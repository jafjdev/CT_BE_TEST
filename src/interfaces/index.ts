import { Document } from 'mongoose';
import { CTSearch, ParametersSchema } from '@types';

// Service interfaces
export interface PassengerInfo {
  adults: number;
  children: number;
}

export interface TimetableRequest {
  from: string;
  to: string;
  date: string;
}

export interface TimetableEntry {
  shipID: string;
  shipId?: string; // Alternative field name from mock service
  departureDate: string;
  arrivalDate: string;
}

export interface TimetableResponse {
  timeTables: TimetableEntry[];
}

export interface AccommodationResponse {
  accommodations: {
    type: string;
    available: string;
  }[];
}

// Interface for fetchPrices function input parameters
export interface FetchPricesRequest {
  /** ID del barco/tren */
  shipID: string;
  /** Fecha de salida en formato string */
  departureDate: string;
  /** Tipo de acomodación */
  accommodation: string;
  /** Tipo de pasajero */
  pax: 'adult' | 'children' | 'infant';
  /** Bonificaciones opcionales (solo válidas para adultos) */
  bonus?: string[];
}

export interface Station {
  _id: string;
  destinationCode: string;
  destinationTree: string[];
  arrivalCode: string;
  arrivalTree: string[];
  timetables?: any;
  accommodations?: any;
  error?: string;
}

export interface GetStationsForJourneysResponse {
  journey: ParametersSchema['journeys'][number];
  stations: Array<Station>;
}

// Model interfaces
export interface TrainResultDoc extends CTSearch, Document {}

export interface SupplierStationCorrelation extends Document {
  code: string;
  suppliers: string[];
}

export interface JourneyDestinationTree extends Document {
  destinationCode: string;
  destinationTree: string[];
  arrivalCode: string;
  arrivalTree: string[];
}
