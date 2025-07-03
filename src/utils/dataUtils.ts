import { PASSENGER_TYPES, SERVIVUELO_CONFIG } from '../constants/apiConstants';

export const extractServivueloStationCode = (stationTree: string[] | null): string | undefined => {
  if (!stationTree) return undefined;

  return stationTree
    .find((item: string) => item.startsWith(SERVIVUELO_CONFIG.PREFIX))
    ?.split('#')[1];
};

export const buildPriceQueryParams = (
  pax: string,
  bonus?: string[],
): { pax: string; bonus?: string } => {
  const queryParams: { pax: string; bonus?: string } = { pax };

  if (bonus && bonus.length > 0 && pax === PASSENGER_TYPES.ADULT) {
    queryParams.bonus = JSON.stringify(bonus);
  }

  return queryParams;
};

export const findStationIndexById = (stations: any[], stationId: string): number => {
  return stations.findIndex(station => station._id === stationId);
};

export const isValidStationIndex = (index: number): boolean => {
  return index !== -1;
};

export const extractTimetables = (timetableResult: any): any[] => {
  return timetableResult.timetables?.timeTables || [];
};

export const extractAccommodations = (timetableResult: any): any[] => {
  return timetableResult.accommodations?.accommodations || [];
};

export const hasError = (timetableResult: any): boolean => {
  return Boolean(timetableResult.error);
};
