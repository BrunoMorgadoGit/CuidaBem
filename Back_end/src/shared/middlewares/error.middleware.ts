import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.helper';
import { env } from '../../config/env.config';
import { registrarLogErro } from '../utils/logger';

interface BusinessErrorConfig { status: number; message: string; code: string; }

const BUSINESS_ERRORS: Record<string, BusinessErrorConfig> = {
  INVALID_CREDENTIALS:    { status: 401, message: 'Email ou senha incorretos.',                               code: 'INVALID_CREDENTIALS' },
  INVALID_REFRESH_TOKEN:  { status: 401, message: 'Refresh token inválido ou expirado.',                      code: 'INVALID_REFRESH_TOKEN' },
  USER_ALREADY_EXISTS:    { status: 409, message: 'Já existe um usuário com este CPF ou email.',              code: 'USER_ALREADY_EXISTS' },
  USER_NOT_FOUND:         { status: 404, message: 'Usuário não encontrado.',                                  code: 'USER_NOT_FOUND' },
  PATIENT_ALREADY_EXISTS: { status: 409, message: 'Já existe um paciente com este CPF.',                      code: 'PATIENT_ALREADY_EXISTS' },
  PATIENT_NOT_FOUND:      { status: 404, message: 'Paciente não encontrado.',                                 code: 'PATIENT_NOT_FOUND' },
  TASK_NOT_FOUND:         { status: 404, message: 'Tarefa não encontrada.',                                   code: 'TASK_NOT_FOUND' },
  CURRENT_PATIENT_NOT_FOUND:{ status: 404, message: 'Nenhum paciente atual encontrado para este usuário.',     code: 'CURRENT_PATIENT_NOT_FOUND' },
  MEMBER_NOT_FOUND:       { status: 404, message: 'Vínculo de membro não encontrado.',                        code: 'MEMBER_NOT_FOUND' },
  CUIDADOR_ALREADY_EXISTS:{ status: 409, message: 'Já existe um cuidador com este CPF ou email.',             code: 'CUIDADOR_ALREADY_EXISTS' },
  IDOSO_ALREADY_EXISTS:   { status: 409, message: 'Já existe um idoso com este CPF.',                         code: 'IDOSO_ALREADY_EXISTS' },
  RESOURCE_NOT_FOUND:     { status: 404, message: 'Recurso não encontrado.',                                   code: 'NOT_FOUND' },
  FORBIDDEN:              { status: 403, message: 'Acesso negado.',                                            code: 'FORBIDDEN' },
  IDOSO_NOT_FOUND:        { status: 404, message: 'Idoso não encontrado.',                                     code: 'IDOSO_NOT_FOUND' },
  DOENCA_NOT_FOUND:       { status: 404, message: 'Doença não encontrada.',                                    code: 'DOENCA_NOT_FOUND' },
  MEDICAMENTO_NOT_FOUND:  { status: 404, message: 'Medicamento não encontrado.',                               code: 'MEDICAMENTO_NOT_FOUND' },
  UPLOAD_NOT_FOUND:       { status: 404, message: 'Arquivo de mídia não encontrado.',                          code: 'UPLOAD_NOT_FOUND' },
  GUIDE_NOT_FOUND:        { status: 404, message: 'Guia não encontrado.',                                      code: 'GUIDE_NOT_FOUND' },
  TUTORIAL_VIDEO_NOT_FOUND:{ status: 404, message: 'Vídeo tutorial não encontrado.',                           code: 'TUTORIAL_VIDEO_NOT_FOUND' },
  EXERCISE_NOT_FOUND:     { status: 404, message: 'Exercício não encontrado.',                                  code: 'EXERCISE_NOT_FOUND' },
  SUPPORT_CONTACT_NOT_FOUND:{ status: 404, message: 'Contato de apoio não encontrado.',                        code: 'SUPPORT_CONTACT_NOT_FOUND' },
  LAST_MEMBER:              { status: 422, message: 'Não é possível remover o último cuidador do paciente.',   code: 'LAST_MEMBER' },
};

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  registrarLogErro('[CuidaBem Error]', {
    name: err.name,
    message: err.message,
    timestamp: new Date().toISOString(),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  const businessError = BUSINESS_ERRORS[err.message];
  if (businessError) {
    sendError(res, businessError.message, businessError.status, businessError.code);
    return;
  }

  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as Error & { code?: string; meta?: { target?: string[] } };
    if (prismaErr.code === 'P2002') {
      sendError(res, `Conflito: "${prismaErr.meta?.target?.join(', ') ?? 'campo'}" já existe.`, 409, 'UNIQUE_CONSTRAINT_VIOLATION');
      return;
    }
    if (prismaErr.code === 'P2025') {
      sendError(res, 'Registro não encontrado.', 404, 'NOT_FOUND');
      return;
    }
    if (prismaErr.code === 'P2003') {
      sendError(res, 'Referência a registro inexistente.', 422, 'FOREIGN_KEY_CONSTRAINT');
      return;
    }
  }

  if (err.constructor.name === 'PrismaClientValidationError') {
    sendError(res, 'Dados incompatíveis com o esquema do banco.', 422, 'PRISMA_VALIDATION_ERROR');
    return;
  }

  if (err.constructor.name === 'MulterError') {
    const multerErr = err as Error & { code?: string };
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      sendError(res, `Arquivo muito grande. Máximo: ${env.MAX_FILE_SIZE_MB}MB.`, 413, 'FILE_TOO_LARGE');
      return;
    }
    if (multerErr.code === 'LIMIT_FILE_COUNT') {
      sendError(res, 'Máximo de 5 arquivos por envio.', 400, 'TOO_MANY_FILES');
      return;
    }
    sendError(res, `Erro no upload: ${err.message}`, 400, 'UPLOAD_ERROR');
    return;
  }

  if (err.message.startsWith('Tipo de arquivo não permitido:')) {
    sendError(res, err.message, 415, 'UNSUPPORTED_MEDIA_TYPE');
    return;
  }

  if (err.message.startsWith('CORS:')) {
    sendError(res, err.message, 403, 'CORS_BLOCKED');
    return;
  }

  sendError(
    res,
    env.NODE_ENV === 'development' ? `Erro interno: ${err.message}` : 'Erro interno do servidor.',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}
