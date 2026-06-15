import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware';
import { getTutorialVideo, listTutorialVideos } from './tutorial-videos.controller';
import { TutorialVideoIdParamSchema } from './tutorial-videos.schema';

const tutorialVideosRouter = Router();

tutorialVideosRouter.get('/', listTutorialVideos);
tutorialVideosRouter.get('/:id', validate(TutorialVideoIdParamSchema, 'params'), getTutorialVideo);

export { tutorialVideosRouter };
