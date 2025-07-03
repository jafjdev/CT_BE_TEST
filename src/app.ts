import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { journeyRoutes } from './routes/journeyRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import logger from './config/logger';

export const createApp = () => {
  const app = express();

  // Middleware de seguridad y cors
  app.use(helmet());
  app.use(cors());

  // Middleware de transformacion de datos
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use(
    morgan('combined', {
      stream: { write: msg => logger.info(msg.trim()) },
    }),
  );
  app.use(requestLogger);

  // API routes
  app.use('/api/journeys', journeyRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
