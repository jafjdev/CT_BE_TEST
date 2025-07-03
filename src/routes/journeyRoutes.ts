import { Router } from 'express';
import { searchStations } from '@controllers/journeyController';
import { validateRequest } from '../middleware/validateRequest';
import { ParametersSchemaZod } from '@types';

const router = Router();

router.post('/search', validateRequest(ParametersSchemaZod), searchStations);

export { router as journeyRoutes };
