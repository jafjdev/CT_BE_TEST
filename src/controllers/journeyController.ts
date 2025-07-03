import { Request, Response } from 'express';
import { CTSearch, Parameters, ParametersSchema } from '@types';
import { getStations, saveTrainCombinations } from '@services/journeyService';
import logger from '../config/logger';

const generateAndSaveCombinations = async (
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

export const searchStations = async (req: Request, res: Response) => {
  try {
    const body = req.body as ParametersSchema;
    logger.info('Received search request', body);
    //Basicamente se hace el orquestado inicial, se llenan los datos con las busquedas de la base de datos
    const stationsForJourneys = await getStations(body as Parameters);

    // Ejecutar la función para generar y guardar combinaciones, Se hace la propiedad "distributiva"
    await generateAndSaveCombinations(stationsForJourneys, body as Parameters);

    res.status(200).json({
      success: true,
      data: { success: true },
      message: 'Stations retrieved successfully',
    });
  } catch (error) {
    logger.error('Error in searchStations controller:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve stations',
    });
  }
};
