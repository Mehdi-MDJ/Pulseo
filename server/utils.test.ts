import { describe, it, expect, vi } from 'vitest';

/**
 * ==============================================================================
 * NurseLink AI - Tests Unitaires
 * ==============================================================================
 *
 * Tests pour valider la configuration et les fonctionnalités de base
 * ==============================================================================
 */

// Fonction utilitaire simple pour tester
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Fonction pour valider un email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour calculer le taux horaire moyen
export function calculateAverageHourlyRate(rates: number[]): number {
  if (rates.length === 0) return 0;
  const sum = rates.reduce((acc, rate) => acc + rate, 0);
  return Math.round((sum / rates.length) * 100) / 100;
}

describe('Utils Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly for EUR', () => {
      const result = formatCurrency(25.50);
      expect(result).toContain('25,50');
      expect(result).toContain('€');
    });

    it('should handle different currencies', () => {
      const usdResult = formatCurrency(25.50, 'USD');
      expect(usdResult).toContain('25,50');
      expect(usdResult).toContain('$');
    });

    it('should handle decimal values', () => {
      const result = formatCurrency(25.99);
      expect(result).toContain('25,99');
      expect(result).toContain('€');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('calculateAverageHourlyRate', () => {
    it('should calculate average correctly', () => {
      expect(calculateAverageHourlyRate([20, 25, 30])).toBe(25);
      expect(calculateAverageHourlyRate([15.50, 18.75, 22.25])).toBe(18.83);
    });

    it('should return 0 for empty array', () => {
      expect(calculateAverageHourlyRate([])).toBe(0);
    });

    it('should handle single value', () => {
      expect(calculateAverageHourlyRate([25])).toBe(25);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateAverageHourlyRate([20.333, 25.666])).toBe(23);
    });
  });
});

// Test de configuration Vitest
describe('Vitest Configuration', () => {
  it('should have proper test environment', () => {
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
    expect(typeof vi).toBe('object');
  });

  it('should support async/await', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  it('should support mocking', () => {
    const mockFn = vi.fn(() => 'mocked');
    expect(mockFn()).toBe('mocked');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
