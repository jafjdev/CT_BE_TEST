import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import logger from '../config/logger';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      logger.error('Validation error:', error);
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  };
};
