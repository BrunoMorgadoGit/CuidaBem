import path from 'path';
import { env } from '../../config/env.config';
import { MimeCategories } from '../../config/multer.config';

export interface UploadMetadata {
  cuidadorId: string;
  file: Express.Multer.File;
  idosoId?: string;
}

export class UploadService {
  async saveMetadata({ file }: UploadMetadata) {
    let tipoMidia: 'video' | 'imagem' | 'documento' = 'documento';
    if (MimeCategories.ALLOWED_VIDEO_MIMES.has(file.mimetype)) tipoMidia = 'video';
    else if (MimeCategories.ALLOWED_IMAGE_MIMES.has(file.mimetype)) tipoMidia = 'imagem';

    const caminhoRelativo = path.relative(
      path.join(process.cwd(), env.UPLOAD_DIR),
      file.path
    ).replace(/\\/g, '/');

    return {
      id: Date.now(),
      nome_original: file.originalname,
      caminho: caminhoRelativo,
      tipo_mime: file.mimetype,
      tamanho_bytes: file.size,
      tipo_midia: tipoMidia,
      id_idoso: null,
    };
  }

  async findByCuidador(_cuidadorId: string, _tipoMidia?: string) {
    return [];
  }

  async findById(id: number, _cuidadorId: string) {
    throw new Error('UPLOAD_NOT_FOUND' + id);
  }

  async delete(id: number, _cuidadorId: string) {
    return { id, deletado: true, arquivo: '' };
  }
}

export const uploadService = new UploadService();
