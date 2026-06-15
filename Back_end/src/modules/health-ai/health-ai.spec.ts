import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { analyzeHealth } from './health-ai.controller';
import fs from 'fs';
import * as jpeg from 'jpeg-js';

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock('jpeg-js', () => ({
  decode: vi.fn(),
}));

describe('HealthAI Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: number;
  let responseData: any;

  beforeEach(() => {
    responseStatus = 200;
    responseData = null;

    mockResponse = {
      status: vi.fn().mockImplementation((code: number) => {
        responseStatus = code;
        return mockResponse as Response;
      }),
      json: vi.fn().mockImplementation((data: any) => {
        responseData = data;
        return mockResponse as Response;
      }),
    };

    vi.clearAllMocks();
  });

  describe('analyzeHealth', () => {
    it('deve analisar categoria Pele / Lesões com risco baixo (normal)', async () => {
      mockRequest = {
        body: {
          category: 'pele',
          imageUrl: 'imagens/test-clear.jpg',
          notes: '',
        },
      };

      // Mock fs.existsSync to return false so it runs the hash-based fallback (with low redness)
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await analyzeHealth(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.category).toBe('Pele / Lesões');
      expect(responseData.riskLevel).toBeDefined();
    });

    it('deve analisar categoria Excreções e identificar risco alto se redness for alto', async () => {
      mockRequest = {
        body: {
          category: 'excreções',
          imageUrl: 'imagens/test-red.jpg',
          notes: 'presença de manchas',
        },
      };

      // Mock fs.existsSync to return true and mock jpeg decode to simulate red pixels (redness > 0.6)
      vi.mocked(fs.existsSync).mockReturnValue(true);
      // Red: 200, Green: 50, Blue: 50
      const mockDecodedData = {
        width: 2,
        height: 2,
        data: Buffer.from([
          200, 50, 50, 255,
          200, 50, 50, 255,
          200, 50, 50, 255,
          200, 50, 50, 255
        ]),
      };
      vi.mocked(jpeg.decode).mockReturnValue(mockDecodedData as any);
      vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from([]));

      await analyzeHealth(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.category).toBe('Excreções');
      expect(responseData.riskLevel).toBe('alto');
      expect(responseData.title).toContain('Sangue');
    });

    it('deve analisar comportamento e identificar risco moderado se houver palavras-chave de agitação', async () => {
      mockRequest = {
        body: {
          category: 'comportamento',
          notes: 'o paciente está muito agitado e confuso',
        },
      };

      await analyzeHealth(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.category).toBe('Comportamento');
      expect(responseData.riskLevel).toBe('moderado');
      expect(responseData.title).toContain('Agitação');
    });
  });
});
