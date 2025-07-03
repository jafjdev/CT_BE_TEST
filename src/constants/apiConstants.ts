export const HTTP_STATUS = {
  SUCCESS_MIN: 200,
  SUCCESS_MAX: 299,
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: 'application/json',
} as const;

export const SERVIVUELO_CONFIG = {
  BASE_URL: process.env.SERVIVUELO_BASE_URL || 'http://localhost/servivuelo',
  PREFIX: 'SERVIVUELO',
  ENDPOINTS: {
    TIMETABLES: 'timetables',
    ACCOMMODATIONS: 'accommodations',
    PRICES: 'prices',
  },
} as const;

export const PASSENGER_TYPES = {
  ADULT: 'adult',
  CHILD: 'children',
} as const;

export const LOG_MESSAGES = {
  SUPPLIER_STATION: {
    FETCH_ERROR: 'Error fetching supplier station by code',
    FETCH_SUCCESS: 'Successfully fetched supplier station',
  },
  TIMETABLES: {
    FETCH_START: 'Fetching timetables from servivuelo',
    FETCH_SUCCESS: 'Successfully received timetables from servivuelo',
    FETCH_ERROR: 'Error fetching timetables from servivuelo',
  },
  ACCOMMODATIONS: {
    FETCH_START: 'Fetching accommodations from servivuelo',
    FETCH_SUCCESS: 'Successfully received accommodations from servivuelo',
    FETCH_ERROR: 'Error fetching accommodations from servivuelo',
  },
  PRICES: {
    FETCH_START: 'Fetching prices from servivuelo',
    FETCH_SUCCESS: 'Successfully received prices from servivuelo',
    FETCH_ERROR: 'Error fetching prices from servivuelo',
  },
  JOURNEY: {
    PROCESSING_START: 'Processing station for available trains, accommodations and prices',
    PROCESSING_ERROR: 'Error processing station for journey',
    TRAIN_PROCESSING_ERROR: 'Error processing train accommodations',
    PRICE_PROCESSING_ERROR: 'Error fetching prices for train-accommodation combination',
    MISSING_CODES: 'Missing SERVIVUELO station codes',
    SAVE_START: 'Saving train combinations to database',
    SAVE_SUCCESS: 'Successfully saved train combinations',
    SAVE_ERROR: 'Error saving train combinations to database',
  },
} as const;
