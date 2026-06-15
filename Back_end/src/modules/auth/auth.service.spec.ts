import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { prisma } from '../../config/database';

vi.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userPreference: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    patientMember: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('getMe', () => {
    it('deve retornar o cuidador se encontrado', async () => {
      const mockUser = {
        id: '1',
        accountId: 'acc-1',
        name: 'Teste',
        email: 'teste@email.com',
        role: 'RESPONSIBLE',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.userPreference.findUnique).mockResolvedValue(null as any);
      vi.mocked(prisma.patientMember.findFirst).mockResolvedValue(null as any);

      const result = await authService.getMe('1');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.name).toBe(mockUser.name);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('deve lancar erro se nao encontrar', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.getMe('999')).rejects.toThrow('USER_NOT_FOUND');
    });
  });
});
