import { describe, it, expect } from 'vitest'

// Test simple pour valider la configuration Vitest
describe('Configuration de base', () => {
  it('devrait passer un test simple', () => {
    expect(1 + 1).toBe(2)
  })

  it('devrait valider les opérations de base', () => {
    const result = 2 * 3
    expect(result).toBe(6)
  })
})

// Test pour valider l'import des utilitaires
describe('Utilitaires', () => {
  it('devrait formater correctement une date', () => {
    const date = new Date('2024-01-01')
    const formatted = date.toISOString().split('T')[0]
    expect(formatted).toBe('2024-01-01')
  })
})
