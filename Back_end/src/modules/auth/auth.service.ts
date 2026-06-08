import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env.config';
import type { JwtPayload } from '../../shared/types/jwt.types';
import type { LoginDto, RegisterDto, UpdateProfileDto } from './auth.schema';

const CUIDADOR_PUBLIC_FIELDS = {
  id: true,
  nome: true,
  email: true,
  cpf: true,
  sexo: true,
  telefone: true,
  turno: true,
  criado_em: true,
  atualizado_em: true,
} as const;

export class AuthService {
  async login(dto: LoginDto): Promise<{ token: string; cuidador: object; expiresIn: string }> {
    const cuidador = await prisma.cuidador.findUnique({
      where: { email: dto.email },
      select: { ...CUIDADOR_PUBLIC_FIELDS, senha_hash: true },
    });

    const senhaValida = cuidador
      ? await bcrypt.compare(dto.senha, cuidador.senha_hash)
      : await bcrypt.compare(dto.senha, '$2b$12$invalidhashfortimingprotection00000000000');

    if (!cuidador || !senhaValida) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: cuidador.id,
      email: cuidador.email,
      nome: cuidador.nome,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '2h',
    });

    const { senha_hash: _removed, ...cuidadorPublico } = cuidador;
    void _removed;

    return {
      token,
      cuidador: cuidadorPublico,
      expiresIn: env.JWT_EXPIRES_IN,
    };
  }

  async register(dto: RegisterDto): Promise<object> {
    const existente = await prisma.cuidador.findFirst({
      where: { OR: [{ email: dto.email }, { cpf: dto.cpf }] },
      select: { id: true },
    });

    if (existente) {
      throw new Error('CUIDADOR_ALREADY_EXISTS');
    }

    const senha_hash = await bcrypt.hash(dto.senha, env.BCRYPT_SALT_ROUNDS);

    const novoCuidador = await prisma.cuidador.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senha_hash,
        cpf: dto.cpf,
        sexo: dto.sexo ?? null,
        telefone: dto.telefone ?? null,
        turno: dto.turno ?? null,
      },
      select: CUIDADOR_PUBLIC_FIELDS,
    });

    return novoCuidador;
  }

  async getMe(cuidadorId: number): Promise<object> {
    const cuidador = await prisma.cuidador.findUnique({
      where: { id: cuidadorId },
      select: CUIDADOR_PUBLIC_FIELDS,
    });

    if (!cuidador) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    return cuidador;
  }

  async updateProfile(cuidadorId: number, dto: UpdateProfileDto): Promise<object> {
    const atualizado = await prisma.cuidador.update({
      where: { id: cuidadorId },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.turno !== undefined && { turno: dto.turno }),
        ...(dto.sexo !== undefined && { sexo: dto.sexo }),
      },
      select: CUIDADOR_PUBLIC_FIELDS,
    });

    return atualizado;
  }
}

export const authService = new AuthService();
