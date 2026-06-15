import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env.config';
import { registrarLogAviso, registrarLogInfo } from '../../shared/utils/logger';
import type { JwtPayload } from '../../shared/types/jwt.types';
import type { LoginDto, LogoutDto, RefreshDto, RegisterDto } from './auth.schema';

type RequestMeta = {
  userAgent?: string;
  ipAddress?: string;
};

function normalizeUserName(dto: RegisterDto): string {
  return dto.name ?? dto.nome ?? '';
}

function normalizePassword(dto: RegisterDto | LoginDto): string {
  return dto.password ?? dto.senha ?? '';
}

function normalizePhone(dto: RegisterDto): string | null {
  return dto.phone ?? dto.telefone ?? null;
}

function normalizePatient(dto: RegisterDto) {
  const patient = dto.patient ?? dto.paciente;
  const name = patient?.name ?? patient?.nome ?? dto.patientName ?? dto.nomePaciente ?? `Idoso de ${normalizeUserName(dto)}`;
  const birthDate = patient?.birthDate ?? patient?.dataNascimento ?? null;
  const sex = patient?.sex ?? patient?.sexo ?? null;
  const weight = patient?.weight ?? patient?.peso ?? null;
  const healthConditions = patient?.healthConditions ?? patient?.condicoesMedicinais ?? [];

  return {
    name,
    birthDate,
    cpf: patient?.cpf ?? null,
    sex,
    weight,
    healthConditions: Array.isArray(healthConditions)
      ? healthConditions
      : healthConditions
        ? healthConditions.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
    photoUrl: patient?.photoUrl ?? null,
  };
}

function mapUser(user: any) {
  return {
    id: user.id,
    accountId: user.accountId,
    name: user.name,
    email: user.email,
    cpf: user.cpf ?? undefined,
    phone: user.phone ?? undefined,
    role: String(user.role).toLowerCase(),
    avatarUrl: user.avatarUrl ?? undefined,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function mapPatient(patient: any | null) {
  if (!patient) return null;

  return {
    id: patient.id,
    accountId: patient.accountId,
    name: patient.name,
    birthDate: patient.birthDate ?? undefined,
    cpf: patient.cpf ?? undefined,
    sex: patient.sex ?? undefined,
    weight: patient.weight ?? undefined,
    healthConditions: Array.isArray(patient.healthConditions) ? patient.healthConditions : [],
    notes: patient.notes ?? undefined,
    photoUrl: patient.photoUrl ?? undefined,
    status: String(patient.status).toLowerCase(),
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

export class AuthService {
  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private createAccessToken(user: any): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      accountId: user.accountId,
      email: user.email,
      name: user.name,
      role: String(user.role).toLowerCase(),
    };

    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  }

  private async createRefreshToken(userId: string, meta: RequestMeta = {}): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const tokenHash = this.hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ipAddress ?? null,
      },
    });

    return token;
  }

  private async findCurrentPatient(userId: string) {
    const preference = await prisma.userPreference.findUnique({
      where: { userId },
      include: { currentPatient: true },
    });

    if (preference?.currentPatient) {
      const member = await prisma.patientMember.findUnique({
        where: {
          patientId_userId: {
            patientId: preference.currentPatient.id,
            userId,
          },
        },
      });

      if (member?.active && preference.currentPatient.status === 'ACTIVE') {
        return preference.currentPatient;
      }
    }

    const firstMember = await prisma.patientMember.findFirst({
      where: {
        userId,
        active: true,
        patient: { status: 'ACTIVE' },
      },
      include: { patient: true },
      orderBy: { createdAt: 'asc' },
    });

    if (firstMember) {
      await prisma.userPreference.upsert({
        where: { userId },
        update: { currentPatientId: firstMember.patientId },
        create: { userId, currentPatientId: firstMember.patientId },
      });
    }

    return firstMember?.patient ?? null;
  }

  async register(dto: RegisterDto, meta: RequestMeta = {}) {
    const name = normalizeUserName(dto);
    const password = normalizePassword(dto);
    const patientInput = normalizePatient(dto);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.cpf ? [{ cpf: dto.cpf }] : []),
        ],
      },
      select: { id: true },
    });

    if (existingUser) throw new Error('USER_ALREADY_EXISTS');

    if (patientInput.cpf) {
      const existingPatient = await prisma.patient.findUnique({
        where: { cpf: patientInput.cpf },
        select: { id: true },
      });
      if (existingPatient) throw new Error('PATIENT_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx: any) => {
      const account = await tx.account.create({
        data: { name: dto.accountName ?? `Grupo de ${name}` },
      });

      const user = await tx.user.create({
        data: {
          accountId: account.id,
          name,
          email: dto.email,
          passwordHash,
          cpf: dto.cpf ?? null,
          phone: normalizePhone(dto),
          role: 'RESPONSIBLE',
        },
      });

      const patient = await tx.patient.create({
        data: {
          accountId: account.id,
          name: patientInput.name,
          birthDate: patientInput.birthDate,
          cpf: patientInput.cpf,
          sex: patientInput.sex,
          weight: patientInput.weight,
          healthConditions: patientInput.healthConditions,
          photoUrl: patientInput.photoUrl,
        },
      });

      await tx.patientMember.create({
        data: {
          accountId: account.id,
          patientId: patient.id,
          userId: user.id,
          role: 'RESPONSIBLE',
        },
      });

      await tx.userPreference.create({
        data: {
          userId: user.id,
          currentPatientId: patient.id,
        },
      });

      return { user, patient };
    });

    const token = this.createAccessToken(result.user);
    const refreshToken = await this.createRefreshToken(result.user.id, meta);

    registrarLogInfo(`Usuário registrado com sucesso: ${result.user.email}`);

    return {
      token,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
      user: mapUser(result.user),
      currentPatient: mapPatient(result.patient),
    };
  }

  async login(dto: LoginDto, meta: RequestMeta = {}) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    const password = normalizePassword(dto);

    const validPassword = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, '$2b$12$invalidhashfortimingprotection00000000000');

    if (!user || !user.active || !validPassword) {
      registrarLogAviso(`Tentativa de login falha para o email: ${dto.email}`);
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id, meta);
    const currentPatient = await this.findCurrentPatient(user.id);

    registrarLogInfo(`Login efetuado com sucesso: ${user.email}`);

    return {
      token,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
      user: mapUser(user),
      currentPatient: mapPatient(currentPatient),
    };
  }

  async refresh(dto: RefreshDto, meta: RequestMeta = {}) {
    const tokenHash = this.hashRefreshToken(dto.refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || !stored.user.active) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const token = this.createAccessToken(stored.user);
    const refreshToken = await this.createRefreshToken(stored.userId, meta);
    const currentPatient = await this.findCurrentPatient(stored.userId);

    return {
      token,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
      user: mapUser(stored.user),
      currentPatient: mapPatient(currentPatient),
    };
  }

  async logout(userId: string, dto: LogoutDto): Promise<{ loggedOut: true }> {
    if (dto.refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          userId,
          tokenHash: this.hashRefreshToken(dto.refreshToken),
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return { loggedOut: true };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) throw new Error('USER_NOT_FOUND');

    const currentPatient = await this.findCurrentPatient(userId);
    return {
      user: mapUser(user),
      currentPatient: mapPatient(currentPatient),
    };
  }
}

export const authService = new AuthService();
