import { Request, Response } from 'express';
import { uploadService } from './upload.service';
import { sendSuccess, sendError } from '../../shared/utils/response.helper';

export async function uploadVideo(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    sendError(res, 'Nenhum arquivo de vídeo recebido. Envie o arquivo no campo "video".', 400, 'MISSING_FILE');
    return;
  }

  const idosoId = req.body.id_idoso ? String(req.body.id_idoso) : undefined;

  const result = await uploadService.saveMetadata({
    cuidadorId: req.user!.sub,
    file: req.file,
    idosoId,
  });

  sendSuccess(res, result, `Vídeo "${req.file.originalname}" enviado com sucesso.`, 201);
}

export async function uploadImagem(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    sendError(res, 'Nenhuma imagem recebida. Envie o arquivo no campo "imagem".', 400, 'MISSING_FILE');
    return;
  }

  const idosoId = req.body.id_idoso ? String(req.body.id_idoso) : undefined;

  const result = await uploadService.saveMetadata({
    cuidadorId: req.user!.sub,
    file: req.file,
    idosoId,
  });

  sendSuccess(res, result, `Imagem "${req.file.originalname}" enviada com sucesso.`, 201);
}

export async function uploadMultiplos(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    sendError(res, 'Nenhum arquivo recebido. Envie os arquivos no campo "arquivos".', 400, 'MISSING_FILES');
    return;
  }

  const idosoId = req.body.id_idoso ? String(req.body.id_idoso) : undefined;
  const cuidadorId = req.user!.sub;

  const results = await Promise.all(
    files.map((file) => uploadService.saveMetadata({ cuidadorId, file, idosoId }))
  );

  sendSuccess(res, results, `${files.length} arquivo(s) enviado(s) com sucesso.`, 201);
}

export async function listUploads(req: Request, res: Response): Promise<void> {
  const tipo = req.query['tipo'] as string | undefined;
  const uploads = await uploadService.findByCuidador(req.user!.sub, tipo);
  sendSuccess(res, uploads, `${uploads.length} arquivo(s) encontrado(s).`);
}

export async function getUpload(req: Request, res: Response): Promise<void> {
  const upload = await uploadService.findById(Number(req.params['id']), req.user!.sub);
  sendSuccess(res, upload, 'Arquivo de mídia carregado.');
}

export async function deleteUpload(req: Request, res: Response): Promise<void> {
  const result = await uploadService.delete(Number(req.params['id']), req.user!.sub);
  sendSuccess(res, result, `Arquivo "${result.arquivo}" removido com sucesso.`);
}
