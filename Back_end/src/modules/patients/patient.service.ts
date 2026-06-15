import { prisma } from '../../config/database';
import type { CreatePatientDto, UpdatePatientDto } from './patient.schema';

function normalizeName(dto: CreatePatientDto | UpdatePatientDto): string | undefined {
  return dto.name ?? dto.nome;
}

function normalizeBirthDate(dto: CreatePatientDto | UpdatePatientDto): Date | null | undefined {
  if (dto.birthDate !== undefined) return dto.birthDate;
  if (dto.dataNascimento !== undefined) return dto.dataNascimento;
  return undefined;
}

function normalizeHealthConditions(dto: CreatePatientDto | UpdatePatientDto): string[] | undefined {
  const value = dto.healthConditions ?? dto.condicoesMedicinais;
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function mapPatient(patient: any | null) {
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

export class PatientService {
  async ensureAccess(userId: string, patientId: string) {
    const member = await prisma.patientMember.findUnique({
      where: {
        patientId_userId: {
          patientId,
          userId,
        },
      },
      include: { patient: true, user: true },
    });

    if (!member || !member.active || member.patient.status === 'ARCHIVED') {
      throw new Error('PATIENT_NOT_FOUND');
    }

    return member;
  }

  async getCurrent(userId: string) {
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
        return mapPatient(preference.currentPatient);
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

    if (!firstMember) throw new Error('CURRENT_PATIENT_NOT_FOUND');

    await prisma.userPreference.upsert({
      where: { userId },
      update: { currentPatientId: firstMember.patientId },
      create: { userId, currentPatientId: firstMember.patientId },
    });

    return mapPatient(firstMember.patient);
  }

  async findAll(userId: string) {
    const members = await prisma.patientMember.findMany({
      where: {
        userId,
        active: true,
        patient: { status: { not: 'ARCHIVED' } },
      },
      include: { patient: true },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((member: any) => mapPatient(member.patient));
  }

  async findById(userId: string, patientId: string) {
    const member = await this.ensureAccess(userId, patientId);
    return mapPatient(member.patient);
  }

  async create(userId: string, dto: CreatePatientDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) throw new Error('USER_NOT_FOUND');

    const patient = await prisma.patient.create({
      data: {
        accountId: user.accountId,
        name: normalizeName(dto)!,
        birthDate: normalizeBirthDate(dto) ?? null,
        cpf: dto.cpf ?? null,
        sex: dto.sex ?? dto.sexo ?? null,
        weight: dto.weight ?? dto.peso ?? null,
        healthConditions: normalizeHealthConditions(dto) ?? [],
        notes: dto.notes ?? null,
        photoUrl: dto.photoUrl ?? null,
        members: {
          create: {
            accountId: user.accountId,
            userId,
            role: 'RESPONSIBLE',
          },
        },
      },
    });

    await prisma.userPreference.upsert({
      where: { userId },
      update: { currentPatientId: patient.id },
      create: { userId, currentPatientId: patient.id },
    });

    return mapPatient(patient);
  }

  async update(userId: string, patientId: string, dto: UpdatePatientDto) {
    await this.ensureAccess(userId, patientId);

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...(normalizeName(dto) !== undefined ? { name: normalizeName(dto) } : {}),
        ...(normalizeBirthDate(dto) !== undefined ? { birthDate: normalizeBirthDate(dto) } : {}),
        ...(dto.cpf !== undefined ? { cpf: dto.cpf } : {}),
        ...(dto.sex !== undefined || dto.sexo !== undefined ? { sex: dto.sex ?? dto.sexo } : {}),
        ...(dto.weight !== undefined || dto.peso !== undefined ? { weight: dto.weight ?? dto.peso } : {}),
        ...(normalizeHealthConditions(dto) !== undefined ? { healthConditions: normalizeHealthConditions(dto) } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.photoUrl !== undefined ? { photoUrl: dto.photoUrl } : {}),
      },
    });

    return mapPatient(patient);
  }

  async delete(userId: string, patientId: string) {
    await this.ensureAccess(userId, patientId);

    await prisma.patient.update({
      where: { id: patientId },
      data: { status: 'ARCHIVED' },
    });

    const preference = await prisma.userPreference.findUnique({ where: { userId } });
    if (preference?.currentPatientId === patientId) {
      const nextMember = await prisma.patientMember.findFirst({
        where: {
          userId,
          active: true,
          patient: { status: 'ACTIVE', id: { not: patientId } },
        },
        orderBy: { createdAt: 'asc' },
      });

      await prisma.userPreference.update({
        where: { userId },
        data: { currentPatientId: nextMember?.patientId ?? null },
      });
    }

    return { id: patientId, deleted: true };
  }
}

export const patientService = new PatientService();
