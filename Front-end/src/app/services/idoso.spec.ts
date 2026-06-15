import { describe, expect, it } from 'vitest';
import { Idoso } from './idoso';

describe('Idoso', () => {
  it('should be created', () => {
    const service = new Idoso();
    expect(service).toBeTruthy();
  });
});
