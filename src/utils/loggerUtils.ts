import logger from '../config/logger';
import { extractErrorMessage } from './httpUtils';
import { LOG_MESSAGES } from '../constants/apiConstants';

export const logSupplierStationOperation = {
  error: (error: unknown, supplierStationCode: string) => {
    logger.error({
      message: LOG_MESSAGES.SUPPLIER_STATION.FETCH_ERROR,
      error: extractErrorMessage(error),
      supplierStationCode,
    });
  },
};

export const logJourneyOperation = {
  processingStart: (from: string, to: string, date: string) => {
    logger.info({
      message: LOG_MESSAGES.JOURNEY.PROCESSING_START,
      from,
      to,
      date,
    });
  },

  processingError: (error: unknown, station: any, journey: any) => {
    logger.error({
      message: LOG_MESSAGES.JOURNEY.PROCESSING_ERROR,
      error: extractErrorMessage(error),
      station,
      journey,
    });
  },

  trainProcessingError: (error: unknown, trainId: string) => {
    logger.error({
      message: LOG_MESSAGES.JOURNEY.TRAIN_PROCESSING_ERROR,
      error: extractErrorMessage(error),
      trainId,
    });
  },

  priceProcessingError: (error: unknown, trainId: string, accommodationType: string) => {
    logger.error({
      message: LOG_MESSAGES.JOURNEY.PRICE_PROCESSING_ERROR,
      error: extractErrorMessage(error),
      trainId,
      accommodationType,
    });
  },

  missingCodes: (station: any) => {
    logger.warn({
      message: LOG_MESSAGES.JOURNEY.MISSING_CODES,
      station: {
        destinationTree: station.destinationTree,
        arrivalTree: station.arrivalTree,
      },
    });
  },

  saveStart: (count: number) => {
    logger.info(`${LOG_MESSAGES.JOURNEY.SAVE_START}: ${count} combinations`);
  },

  saveSuccess: (count: number) => {
    logger.info(`${LOG_MESSAGES.JOURNEY.SAVE_SUCCESS}: ${count} combinations`);
  },

  saveError: (error: unknown) => {
    logger.error(LOG_MESSAGES.JOURNEY.SAVE_ERROR, error);
  },

  fetchPricesInfo: (shipID: string, accommodation: any) => {
    logger.info({
      message: 'Fetching prices for train-accommodation combination',
      shipID,
      accommodation,
    });
  },

  getStationsInfo: (request: any) => {
    logger.info('Request in get stations', request);
  },

  getStationsError: (error: unknown) => {
    logger.error('Error in getStations service:', error);
  },
};
