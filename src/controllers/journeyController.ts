import { Request, Response } from 'express';
import { Parameters, ParametersSchema } from '@types';
import { generateAndSaveCombinations, getStations } from '@services/journeyService';
import logger from '../config/logger';

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
