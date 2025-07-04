import JourneyDestinationTree from '@models/journeyDestinationTree';
import { CTSearch, Parameters, ParametersSchema } from '@types';
import { supplierStationService } from './supplierStationService';
import { GetStationsForJourneysResponse } from '@interfaces';
import TrainResult from '@models/trainResult';
import {
  extractTimetables,
  findStationIndexById,
  hasError,
  isValidStationIndex,
} from '../utils/dataUtils';
import { logJourneyOperation } from '../utils/loggerUtils';
import logger from '@config/logger';

const findStationsForSingleJourney = async (journey: ParametersSchema['journeys'][0]) => {
  return JourneyDestinationTree.find({
    destinationTree: journey.from,
    arrivalTree: journey.to,
  }).lean();
};

export const getStationsForJourneys = async (journeys: ParametersSchema['journeys']) => {
  const results: GetStationsForJourneysResponse[] = [];

  for (const journey of journeys) {
    const stationsForJourney = await findStationsForSingleJourney(journey);

    results.push({
      journey,
      stations: stationsForJourney,
    });
  }

  return results;
};

const attachTimetableDataToStation = (
  journey: GetStationsForJourneysResponse,
  timetableResult: any,
) => {
  const stationIndex = findStationIndexById(journey.stations, timetableResult.station._id);

  if (isValidStationIndex(stationIndex)) {
    const station = journey.stations[stationIndex];

    station.timetables = extractTimetables(timetableResult);

    if (hasError(timetableResult)) {
      station.error = timetableResult.error;
    }
  }
};

const enrichJourneyStationsWithTimetables = async (
  journey: GetStationsForJourneysResponse,
  passenger: Parameters['passenger'],
) => {
  const timetableResults = await supplierStationService.getAvailableTrainForAJourney(
    journey,
    passenger,
  );

  timetableResults.forEach(result => {
    attachTimetableDataToStation(journey, result);
  });
};

const enrichAllJourneysWithTimetables = async (
  journeys: GetStationsForJourneysResponse[],
  passenger: Parameters['passenger'],
) => {
  for (const journey of journeys) {
    await enrichJourneyStationsWithTimetables(journey, passenger);
  }
};

export const getStations = async (request: Parameters) => {
  try {
    logJourneyOperation.getStationsInfo(request);

    const journeysWithStations = await getStationsForJourneys(request.journeys);
    await supplierStationService.parseStationCodes(journeysWithStations);

    await enrichAllJourneysWithTimetables(journeysWithStations, request.passenger);

    return journeysWithStations;
  } catch (error) {
    logJourneyOperation.getStationsError(error);
    throw error;
  }
};

export const saveTrainCombinations = async (combinations: CTSearch[]) => {
  try {
    logJourneyOperation.saveStart(combinations.length);

    const savedResults = await TrainResult.insertMany(combinations);

    logJourneyOperation.saveSuccess(savedResults.length);
    return savedResults;
  } catch (error) {
    logJourneyOperation.saveError(error);
    throw error;
  }
};

export const generateAndSaveCombinations = async (
  stationsForJourneys: any[],
  parameters: Parameters,
): Promise<void> => {
  const combinations: CTSearch[] = [];

  // Determinar el tipo de viaje
  const getJourneyType = (journeys: Parameters['journeys']): CTSearch['train']['type'] => {
    if (journeys.length === 1) return 'oneway';
    if (
      journeys.length === 2 &&
      journeys[0].from === journeys[1].to &&
      journeys[0].to === journeys[1].from
    ) {
      return 'roundtrip';
    }
    return 'multidestination';
  };

  // Procesar cada journey con sus estaciones
  for (const journeyData of stationsForJourneys) {
    const { stations } = journeyData;

    // Iterar sobre cada estación que tiene datos válidos
    for (const station of stations) {
      if (!station.timetables || station.timetables.length === 0) continue;

      // Generar combinaciones para cada horario
      for (const timetable of station.timetables) {
        // Verificar que el timetable tenga acomodaciones
        if (!timetable.accommodations || timetable.accommodations.length === 0) continue;

        // Calcular duración del viaje
        const calculateDuration = (departure: string, arrival: string) => {
          // Convertir HH:mm a minutos para el cálculo
          const parseTime = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
          };

          const depMinutes = parseTime(departure);
          const arrMinutes = parseTime(arrival);
          const diffMinutes = arrMinutes - depMinutes;

          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          return { hours, minutes };
        };

        const formatDateTime = (timeString: string, journeyDate: string) => {
          const [hours, minutes] = timeString.split(':');
          const date = new Date(journeyDate);
          date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          return {
            date: date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            time: date.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
          };
        };

        const journeyDate = journeyData.journey.date;
        const depFormatted = formatDateTime(timetable.departureDate, journeyDate);
        const arrFormatted = formatDateTime(timetable.arrivalDate, journeyDate);
        const duration = calculateDuration(timetable.departureDate, timetable.arrivalDate);

        // Generar combinaciones para cada tipo de acomodación del timetable
        for (const accommodation of timetable.accommodations) {
          // Usar la estructura de precio actualizada
          const priceData = accommodation.price;

          // Validar que el precio existe y tiene la estructura esperada
          if (!priceData || typeof priceData.total !== 'number') {
            logger.warn(`Invalid price data for accommodation ${accommodation.type}`, priceData);
            continue;
          }

          // Usar el total ya calculado y los precios individuales del breakdown
          const totalPrice = priceData.total;
          const adultPrice = priceData.breakdown?.adult || 0;
          const childrenPrice = priceData.breakdown?.children || 0;

          // Crear la combinación CTSearch
          const combination: CTSearch = {
            parameters,
            train: {
              type: getJourneyType(parameters.journeys),
              journeys: [
                {
                  departure: {
                    date: depFormatted.date,
                    time: depFormatted.time,
                    station: station.destinationCode,
                  },
                  arrival: {
                    date: arrFormatted.date,
                    time: arrFormatted.time,
                    station: station.arrivalCode,
                  },
                  duration,
                },
              ],
              options: [
                {
                  accommodation: {
                    type: accommodation.type,
                    passengers: {
                      adults: parameters.passenger.adults.toString(),
                      children: parameters.passenger.children.toString(),
                    },
                  },
                  price: {
                    total: totalPrice,
                    breakdown: {
                      adult: adultPrice,
                      children: childrenPrice,
                    },
                  },
                },
              ],
            },
          };

          combinations.push(combination);
        }
      }
    }
  }

  // Guardar todas las combinaciones en MongoDB
  if (combinations.length > 0) {
    await saveTrainCombinations(combinations);
    logger.info(`Generated and saved ${combinations.length} train combinations`);
  } else {
    logger.warn('No valid combinations found to save');
  }
};

export const journeyService = {
  getStationsForJourneys,
  getStations,
  saveTrainCombinations,
  generateAndSaveCombinations,
};
