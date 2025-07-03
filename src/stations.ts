import JourneyDestinationTree from './models/journeyDestinationTree';
import SupplierStationCorrelation from './models/supplierStationCorrelation';
import logger from './config/logger';
import { ParametersSchema } from './types';

async function getStationsForJourneys(journeys: ParametersSchema['journeys']) {
  const results = [];

  for (const journey of journeys) {
    const stations = await JourneyDestinationTree.find({
      destinationTree: journey.from,
      arrivalTree: journey.to,
    }).lean();

    results.push({
      journey,
      stations,
    });
  }

  return results;
}

export async function getStations(journeys: ParametersSchema['journeys']) {
  try {
    const stations = await getStationsForJourneys(journeys);
    logger.info('Received stations', stations);
    // hasta aca bien!
    return;
    if (!stations.length) {
      logger.info(`No stations found for destination: ${journeys}`);
      return [];
    }

    const stationCodes = stations.map(s => s.destinationCode);

    const correlations = await SupplierStationCorrelation.find({
      code: { $in: stationCodes },
    }).lean();

    logger.info(`Station codes found for destination: ${journeys}`);
    logger.info(`Correlations found: ${correlations.length}`);
    // 4. Filtrar solo los códigos de Servivuelo
    return correlations
      .map(corr => {
        const servivueloCode = corr.suppliers.find(s => s.startsWith('SERVIVUELO#'));
        return servivueloCode ? servivueloCode.split('#')[1] : null;
      })
      .filter(Boolean);
  } catch (error) {
    logger.error('Error in getStations:', error);
    throw error;
  }
}
