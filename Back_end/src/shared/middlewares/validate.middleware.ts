import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response.helper';

type ValidateTarget = 'body' | 'params' | 'query';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedParams?: unknown;
      validatedQuery?: unknown;
    }
  }
}

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        campo: issue.path.join('.') || 'raiz',
        mensagem: issue.message,
        codigo: issue.code,
      }));
      sendError(res, `Dados inválidos. ${details.length} campo(s) com erro.`, 400, 'VALIDATION_ERROR', details);
      return;
    }

    if (target === 'body') {
      req.validatedBody = result.data;
      req.body = result.data;
    } else if (target === 'params') {
      req.validatedParams = result.data;
      Object.keys(req.params).forEach((key) => delete req.params[key]);
      Object.assign(req.params, result.data);
    } else {
      req.validatedQuery = result.data;
    }

    next();
  };
}
