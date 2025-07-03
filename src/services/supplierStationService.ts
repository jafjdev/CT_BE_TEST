import SupplierStationCorrelation from '../models/supplierStationCorrelation';
import {
  AccommodationResponse,
  FetchPricesRequest,
  GetStationsForJourneysResponse,
  PassengerInfo,
  TimetableRequest,
  TimetableResponse,
} from '@interfaces';
import { PASSENGER_TYPES, SERVIVUELO_CONFIG } from '../constants/apiConstants';
import { createApiUrl, makeHttpRequest } from '../utils/httpUtils';
import { buildPriceQueryParams, extractServivueloStationCode } from '../utils/dataUtils';
import { logJourneyOperation, logSupplierStationOperation } from '../utils/loggerUtils';

/**
 * Database operations for supplier stations
 */
export const getSupplierStationByCode = async (
  supplierStationCode: string,
): Promise<string[] | null> => {
  try {
    const supplierStation = await SupplierStationCorrelation.findOne({
      code: supplierStationCode,
    }).lean();

    return supplierStation ? supplierStation.suppliers : null;
  } catch (error) {
    logSupplierStationOperation.error(error, supplierStationCode);
    throw error;
  }
};

export const enrichStationsWithSupplierData = async (
  journeyStations: GetStationsForJourneysResponse[],
): Promise<void> => {
  // Note: This may cause concurrency issues with too many requests
  // But it's the most efficient approach for this test
  await Promise.all(
    journeyStations.map(async journey => {
      await Promise.all(
        journey.stations.map(async station => {
          const [destinationTree, arrivalTree] = await Promise.all([
            getSupplierStationByCode(station.destinationCode),
            getSupplierStationByCode(station.arrivalCode),
          ]);
          station.destinationTree = destinationTree;
          station.arrivalTree = arrivalTree;
        }),
      );
    }),
  );
};

/**
 * External API calls to SERVIVUELO service
 */
const fetchTimetablesFromExternalService = async (
  request: TimetableRequest,
  passenger: PassengerInfo,
): Promise<TimetableResponse> => {
  const { from, to, date } = request;
  const { adults, children } = passenger;
  const url = createApiUrl(SERVIVUELO_CONFIG.ENDPOINTS.TIMETABLES);

  const requestData = { from, to, date };
  const params = { adults, childrens: children };

  return makeHttpRequest<TimetableResponse>(url, requestData, params, {
    operation: 'timetables fetch',
    requestData: { request, passenger },
  });
};

const fetchAccommodationsFromExternalService = async (
  shipId: string,
  departureDate: string,
  passenger: PassengerInfo,
): Promise<AccommodationResponse> => {
  const url = createApiUrl(SERVIVUELO_CONFIG.ENDPOINTS.ACCOMMODATIONS);
  const requestData = { shipID: shipId, departureDate };

  return makeHttpRequest<AccommodationResponse>(url, requestData, undefined, {
    operation: 'accommodations fetch',
    requestData: { shipId, departureDate, passenger },
  });
};

const fetchPricesFromExternalService = async (request: FetchPricesRequest): Promise<number> => {
  const { shipID, departureDate, accommodation, pax, bonus } = request;
  const url = createApiUrl(SERVIVUELO_CONFIG.ENDPOINTS.PRICES);

  const queryParams = buildPriceQueryParams(pax, bonus);

  const requestBody = {
    shipID,
    departureDate,
    accommodation,
  };

  return makeHttpRequest<number>(url, requestBody, queryParams, {
    operation: 'prices fetch',
    requestData: request,
  });
};

/**
 * Business logic for processing stations and trains
 */
const validateStationCodes = (station: any): { from: string; to: string } | null => {
  const from = extractServivueloStationCode(station.destinationTree);
  const to = extractServivueloStationCode(station.arrivalTree);

  if (!from || !to) {
    logJourneyOperation.missingCodes(station);
    return null;
  }

  return { from, to };
};

const createTimetableRequest = (from: string, to: string, date: string): TimetableRequest => ({
  from,
  to,
  date,
});

const processStationTimetables = async (
  station: any,
  journeyDate: string,
  passenger: PassengerInfo,
): Promise<TimetableResponse | null> => {
  const stationCodes = validateStationCodes(station);
  if (!stationCodes) {
    return null;
  }

  const { from, to } = stationCodes;
  const timetableRequest = createTimetableRequest(from, to, journeyDate);

  logJourneyOperation.processingStart(from, to, journeyDate);

  return await fetchTimetablesFromExternalService(timetableRequest, passenger);
};

const createPriceRequest = (
  shipID: string,
  departureDate: string,
  pax: FetchPricesRequest['pax'],
  accommodationType: string,
): FetchPricesRequest => ({
  pax,
  shipID,
  departureDate,
  accommodation: accommodationType,
});

const processAccommodationPricing = async (
  accommodation: any,
  shipID: string,
  departureDate: string,
  passenger: PassengerInfo,
): Promise<any> => {
  try {
    logJourneyOperation.fetchPricesInfo(shipID, accommodation);

    let adultPrice = 0;
    let childrenPrice = 0;

    // Process adult prices
    if (passenger.adults > 0) {
      const adultPriceRequest = createPriceRequest(
        shipID,
        departureDate,
        PASSENGER_TYPES.ADULT,
        accommodation.type,
      );
      const rawAdultPrice = await fetchPricesFromExternalService(adultPriceRequest);
      adultPrice = Number(rawAdultPrice) || 0;
    }

    // Process children prices
    if (passenger.children > 0) {
      const childrenPriceRequest = createPriceRequest(
        shipID,
        departureDate,
        'children',
        accommodation.type,
      );
      const rawChildrenPrice = await fetchPricesFromExternalService(childrenPriceRequest);
      childrenPrice = Number(rawChildrenPrice) || 0;
    }

    // Calculate total price based on passenger counts
    const adultTotal = adultPrice * (passenger.adults || 0);
    const childrenTotal = childrenPrice * (passenger.children || 0);
    const total = adultTotal + childrenTotal;

    // Ensure total is a valid number
    const finalTotal = Number(total) || 0;

    return {
      ...accommodation,
      price: {
        total: finalTotal,
        breakdown: {
          adult: adultPrice,
          children: childrenPrice,
        },
      },
    };
  } catch (priceError) {
    logJourneyOperation.priceProcessingError(priceError, shipID, accommodation.type);

    return {
      ...accommodation,
      priceError: priceError instanceof Error ? priceError.message : String(priceError),
    };
  }
};

const processTrainAccommodations = async (train: any, passenger: PassengerInfo): Promise<any> => {
  const shipID = train.shipId;

  try {
    const accommodationsData = await fetchAccommodationsFromExternalService(
      shipID,
      train.departureDate,
      passenger,
    );

    const trainWithAccommodations = {
      ...train,
      accommodations: [],
    };

    if (accommodationsData?.accommodations) {
      for (const accommodation of accommodationsData.accommodations) {
        const accommodationWithPrice = await processAccommodationPricing(
          accommodation,
          shipID,
          train.departureDate,
          passenger,
        );
        trainWithAccommodations.accommodations.push(accommodationWithPrice);
      }
    }

    return trainWithAccommodations;
  } catch (trainError) {
    logJourneyOperation.trainProcessingError(trainError, shipID);

    return {
      ...train,
      accommodations: [],
      accommodationError: trainError instanceof Error ? trainError.message : String(trainError),
    };
  }
};

const processAllTrainsWithAccommodations = async (
  timetableData: TimetableResponse,
  passenger: PassengerInfo,
): Promise<any[]> => {
  const trainsWithPrices = [];

  if (timetableData?.timeTables) {
    for (const train of timetableData.timeTables) {
      const processedTrain = await processTrainAccommodations(train, passenger);
      trainsWithPrices.push(processedTrain);
    }
  }

  return trainsWithPrices;
};

const createStationResult = (
  station: any,
  timetableData: TimetableResponse,
  trainsWithPrices: any[],
) => ({
  station,
  timetables: {
    ...timetableData,
    timeTables: trainsWithPrices,
  },
});

const createErrorResult = (station: any, error: string) => ({
  station,
  error,
});

/**
 * Main orchestration function for getting available trains for a journey
 */
export const getAvailableTrainForAJourney = async (
  journey: GetStationsForJourneysResponse,
  passenger: PassengerInfo,
) => {
  const results = [];

  for (const station of journey.stations) {
    try {
      const timetableData = await processStationTimetables(
        station,
        journey.journey.date,
        passenger,
      );

      if (!timetableData) {
        results.push(createErrorResult(station, 'Missing SERVIVUELO station codes'));
        continue;
      }

      const trainsWithPrices = await processAllTrainsWithAccommodations(timetableData, passenger);
      results.push(createStationResult(station, timetableData, trainsWithPrices));
    } catch (error) {
      logJourneyOperation.processingError(error, station, journey.journey);
      results.push(
        createErrorResult(station, error instanceof Error ? error.message : String(error)),
      );
    }
  }

  return results;
};

/**
 * Service interface for external consumption
 */
export const supplierStationService = {
  getSupplierStationByCode,
  parseStationCodes: enrichStationsWithSupplierData,
  getAvailableTrainForAJourney,
  fetchPrices: fetchPricesFromExternalService,
};
