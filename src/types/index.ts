import { z } from 'zod';

/** ## Tipado de los parametros de entrada */
export type Parameters = {
  /** listado de viajes */
  journeys: {
    /** puerto, estacion, cuidad, o pais de salida */
    from: string;
    /** puerto, estacion, cuidad, o pais de llegada */
    to: string;
    /** dia de salida del viaje */
    date: string;
  }[];
  /** Pasageros del trayecto */
  passenger: {
    /** Numero de adultos */
    adults: number;
    /** Numero de niños */
    children: number;
    /** Total de pasajeros */
    total: number;
  };
  /** Descuentos especiales, como juvilado */
  bonus: ['retired'];
};

/** ## Tipado del objeto que guardamos en la DB */
export type CTSearch = {
  /** Los parametros de entrada que recibimos de la peticion */
  parameters: Parameters;
  train: {
    /** Tipo de viaje, oneway si solo tiene un journey,
     * multidestination si tiene mas de 1,
     * y roundtrip si tiene 2 journey y vuelve al mismo sitio desde el que salió  */
    type: 'oneway' | 'roundtrip' | 'multidestination';
    /** Array con cada uno de los viajes, recordemos que si es roundtrip seran 2 */
    journeys: {
      /** Información de salida */
      departure: {
        /** Fecha en formato DD/MM/YYYY */
        date: string;
        /** Hora en formato HH:mm */
        time: string;
        /** Codigo de la estacion (nuestros codigos, no los de proveedor) */
        station: string;
      };
      /** Información de llegada */
      arrival: {
        /** Fecha en formato DD/MM/YYYY */
        date: string;
        /** Hora en formato HH:mm */
        time: string;
        /** Codigo de la estacion (nuestros codigos, no los de proveedor) */
        station: string;
      };
      /** Duracion del viaje */
      duration: {
        hours: number;
        minutes: number;
      };
    }[];
    /** Opciones que tiene cada combinacion */
    options: {
      /** Objeto de la acomodacion */
      accommodation: {
        /** Codigo de la acomodacion ej: Estandar, Confort, Premiun, ... */
        type: string;
        /** Pasajeros que van en esta acomodacion */
        passengers: {
          adults: string;
          children: string;
        };
      };
      /** Objeto con los precios de la acomodacion, horario, y trayecto anteriores */
      price: {
        /** Precio total de todo el trayecto */
        total: number;
        /** Desglose de precios */
        breakdown: {
          /** Precio por cada adulto */
          adult: number;
          /** Precio por cada niño */
          children: number;
        };
      };
    }[];
  };
};

export const JourneysSchemaZod = z.object({
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  date: z.string().min(1, 'Date is required'),
});

export const ParametersSchemaZod = z.object({
  journeys: z.array(JourneysSchemaZod).min(1, 'At least one journey is required'),
  passenger: z.object({
    adults: z.number().int().min(0, 'Adults must be a non-negative integer'),
    children: z.number().int().min(0, 'Children must be a non-negative integer'),
    total: z.number().int().min(1, 'Total passengers must be at least 1'),
  }),
  bonus: z.array(z.literal('retired')).optional(),
});

export type ParametersSchema = z.infer<typeof ParametersSchemaZod>;
