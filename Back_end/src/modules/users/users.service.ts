import { prisma } from '../../config/database';
import type { UpdateMeDto } from './users.schema';

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

export class UsersService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) throw new Error('USER_NOT_FOUND');
    return mapUser(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined || dto.nome !== undefined ? { name: dto.name ?? dto.nome } : {}),
        ...(dto.phone !== undefined || dto.telefone !== undefined ? { phone: dto.phone ?? dto.telefone ?? null } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
    });

    return mapUser(user);
  }
}

export const usersService = new UsersService();
