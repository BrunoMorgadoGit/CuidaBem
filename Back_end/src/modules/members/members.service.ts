import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserRole, PatientMemberRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env.config';
import type { CreateMemberDto, UpdateMemberDto } from './members.schema';

function toUserRole(role: string): UserRole {
  const normalized = role.toUpperCase();
  if (normalized === 'RESPONSIBLE') return UserRole.RESPONSIBLE;
  if (normalized === 'CAREGIVER') return UserRole.CAREGIVER;
  if (normalized === 'ADMIN') return UserRole.ADMIN;
  return UserRole.FAMILY;
}

function toPatientMemberRole(role: string): PatientMemberRole {
  const normalized = role.toUpperCase();
  if (normalized === 'RESPONSIBLE') return PatientMemberRole.RESPONSIBLE;
  if (normalized === 'CAREGIVER') return PatientMemberRole.CAREGIVER;
  if (normalized === 'NURSE') return PatientMemberRole.NURSE;
  return PatientMemberRole.FAMILY;
}

function mapMember(member: any) {
  return {
    id: member.id,
    patientId: member.patientId,
    userId: member.userId,
    role: String(member.role).toLowerCase(),
    active: member.active,
    user: member.user
      ? {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          phone: member.user.phone ?? undefined,
          role: String(member.user.role).toLowerCase(),
        }
      : undefined,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export class MembersService {
  private async ensurePatientAccess(userId: string, patientId: string) {
    const member = await prisma.patientMember.findUnique({
      where: { patientId_userId: { patientId, userId } },
      include: { patient: true, user: true },
    });

    if (!member || !member.active || member.patient.status === 'ARCHIVED') {
      throw new Error('PATIENT_NOT_FOUND');
    }

    return member;
  }

  async list(patientId: string, requesterId: string) {
    await this.ensurePatientAccess(requesterId, patientId);

    const members = await prisma.patientMember.findMany({
      where: { patientId, active: true },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });

    return members.map(mapMember);
  }

  async create(patientId: string, requesterId: string, dto: CreateMemberDto) {
    const requesterMember = await this.ensurePatientAccess(requesterId, patientId);
    let user = dto.userId
      ? await prisma.user.findFirst({ where: { id: dto.userId, accountId: requesterMember.accountId } })
      : await prisma.user.findUnique({ where: { email: dto.email! } });

    if (user && user.accountId !== requesterMember.accountId) {
      throw new Error('FORBIDDEN');
    }

    if (!user) {
      const passwordHash = await bcrypt.hash(randomBytes(24).toString('hex'), env.BCRYPT_SALT_ROUNDS);
      user = await prisma.user.create({
        data: {
          accountId: requesterMember.accountId,
          name: dto.name ?? dto.email!.split('@')[0],
          email: dto.email!,
          passwordHash,
          role: toUserRole(dto.role),
        },
      });
    }

    const member = await prisma.patientMember.upsert({
      where: { patientId_userId: { patientId, userId: user.id } },
      update: {
        role: toPatientMemberRole(dto.role),
        active: true,
      },
      create: {
        accountId: requesterMember.accountId,
        patientId,
        userId: user.id,
        role: toPatientMemberRole(dto.role),
      },
      include: { user: true },
    });

    return mapMember(member);
  }

  async update(memberId: string, requesterId: string, dto: UpdateMemberDto) {
    const current = await prisma.patientMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });
    if (!current) throw new Error('MEMBER_NOT_FOUND');

    await this.ensurePatientAccess(requesterId, current.patientId);

    const member = await prisma.patientMember.update({
      where: { id: memberId },
      data: {
        ...(dto.role ? { role: toPatientMemberRole(dto.role) } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
      include: { user: true },
    });

    return mapMember(member);
  }

  async delete(memberId: string, requesterId: string) {
    const current = await prisma.patientMember.findUnique({ where: { id: memberId } });
    if (!current) throw new Error('MEMBER_NOT_FOUND');

    await this.ensurePatientAccess(requesterId, current.patientId);

    const activeCount = await prisma.patientMember.count({
      where: { patientId: current.patientId, active: true },
    });

    if (activeCount <= 1) {
      throw new Error('LAST_MEMBER');
    }

    await prisma.patientMember.update({
      where: { id: memberId },
      data: { active: false },
    });

    return { id: memberId, deleted: true };
  }
}

export const membersService = new MembersService();
