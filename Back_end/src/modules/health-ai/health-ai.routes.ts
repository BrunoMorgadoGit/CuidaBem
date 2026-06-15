import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { analyzeHealth } from './health-ai.controller';

const healthAiRouter = Router();

healthAiRouter.post('/analyze', authenticate, analyzeHealth);

export { healthAiRouter };
