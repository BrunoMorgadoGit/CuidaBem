import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { CreateIdosoSchema, UpdateIdosoSchema, IdParamSchema } from './idoso.schema';
import {
    listIdosos, getIdoso, createIdoso, updateIdoso, deleteIdoso,
    getIdosoDoencas, getIdosoMedicamentos,
} from './idoso.controller';

const idosoRouter = Router();

idosoRouter.use(authenticate);

idosoRouter.get('/', listIdosos);
idosoRouter.post('/', validate(CreateIdosoSchema), createIdoso);
idosoRouter.get('/:id', validate(IdParamSchema, 'params'), getIdoso);
idosoRouter.put('/:id', validate(IdParamSchema, 'params'), validate(UpdateIdosoSchema), updateIdoso);
idosoRouter.delete('/:id', validate(IdParamSchema, 'params'), deleteIdoso);
idosoRouter.get('/:id/doencas', validate(IdParamSchema, 'params'), getIdosoDoencas);
idosoRouter.get('/:id/medicamentos', validate(IdParamSchema, 'params'), getIdosoMedicamentos);

export { idosoRouter };
