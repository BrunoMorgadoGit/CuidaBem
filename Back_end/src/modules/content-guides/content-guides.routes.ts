import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware';
import { getGuide, listGuides } from './content-guides.controller';
import { GuideSlugParamSchema } from './content-guides.schema';

const contentGuidesRouter = Router();

contentGuidesRouter.get('/', listGuides);
contentGuidesRouter.get('/:slug', validate(GuideSlugParamSchema, 'params'), getGuide);

export { contentGuidesRouter };
