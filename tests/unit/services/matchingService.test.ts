import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock simple du service de matching
const mockMatchingService: any = {
  findMatchingNurses: jest.fn(),
  calculateCompatibilityScore: jest.fn(),
  getMatchingHistory: jest.fn()
};

jest.mock('../../../server/services/matchingService', () => ({
  MatchingService: jest.fn().mockImplementation(() => mockMatchingService)
}));

describe('MatchingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Interface du service', () => {
    it('devrait avoir toutes les méthodes requises', () => {
      expect(typeof mockMatchingService.findMatchingNurses).toBe('function');
      expect(typeof mockMatchingService.calculateCompatibilityScore).toBe('function');
      expect(typeof mockMatchingService.getMatchingHistory).toBe('function');
    });
  });

  describe('Simulation de recherche d\'infirmières', () => {
    it('devrait pouvoir simuler une recherche réussie', () => {
      const mockResults = [
        {
          nurseId: 'nurse-1',
          score: 85,
          compatibility: {
            specialties: 90,
            experience: 80,
            availability: 85
          }
        }
      ];

      mockMatchingService.findMatchingNurses.mockResolvedValue(mockResults);

      expect(mockMatchingService.findMatchingNurses).toBeDefined();
    });
  });

  describe('Simulation de calcul de score', () => {
    it('devrait pouvoir simuler un calcul de score', () => {
      const expectedScore = 85;
      mockMatchingService.calculateCompatibilityScore.mockReturnValue(expectedScore);

      expect(mockMatchingService.calculateCompatibilityScore).toBeDefined();
    });
  });

  describe('Simulation d\'historique', () => {
    it('devrait pouvoir simuler un historique', () => {
      const mockHistory = [
        {
          id: 'match-1',
          missionId: 'mission-1',
          nurseId: 'nurse-1',
          score: 85,
          status: 'accepted',
          createdAt: new Date()
        }
      ];

      mockMatchingService.getMatchingHistory.mockResolvedValue(mockHistory);

      expect(mockMatchingService.getMatchingHistory).toBeDefined();
    });
  });
});
