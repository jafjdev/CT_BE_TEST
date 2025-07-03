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

export const journeyService = {
  getStationsForJourneys,
  getStations,
  saveTrainCombinations,
};
