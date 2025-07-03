/**
 * HTTP-related utility functions
 */
import axios, { AxiosResponse } from 'axios';
import logger from '../config/logger';
import { HTTP_HEADERS, HTTP_STATUS, SERVIVUELO_CONFIG } from '../constants/apiConstants';

export const isSuccessfulResponse = (status: number): boolean => {
  return status >= HTTP_STATUS.SUCCESS_MIN && status <= HTTP_STATUS.SUCCESS_MAX;
};

export const createApiUrl = (endpoint: string): string => {
  return `${SERVIVUELO_CONFIG.BASE_URL}/${endpoint}`;
};

export const getJsonHeaders = () => ({
  'Content-Type': HTTP_HEADERS.CONTENT_TYPE_JSON,
});

export const makeHttpRequest = async <T>(
  url: string,
  data: any,
  params?: any,
  logContext?: { operation: string; requestData?: any },
): Promise<T> => {
  if (logContext) {
    logger.verbose({
      message: `Starting ${logContext.operation}`,
      url,
      requestData: logContext.requestData,
    });
  }

  try {
    const response: AxiosResponse<T> = await axios.post(url, data, {
      headers: getJsonHeaders(),
      ...(params && { params }),
    });

    if (!isSuccessfulResponse(response.status)) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (logContext) {
      logger.info({
        message: `Successfully completed ${logContext.operation}`,
        data: response.data,
      });
    }

    return response.data;
  } catch (error) {
    if (logContext) {
      logger.error({
        message: `Error in ${logContext.operation}`,
        error: extractErrorMessage(error),
        url,
        requestData: logContext.requestData,
      });
    }
    throw error;
  }
};

export const extractErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};
