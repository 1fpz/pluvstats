import { describe, expect, it } from 'vitest'
import { scoreOccurrence } from '@/domain/intelligence'
import { validateOccurrence } from '@/utils/validators'

const validForm = {
  title: 'Alagamento na rua de teste',
  type: 'flooding',
  status: 'open',
  severity: 'alert',
  description: 'Descrição suficientemente longa para validar o formulário de ocorrência.',
  address: 'Rua de teste, 100',
  neighborhood: 'Centro',
  lat: -23.66,
  lng: -46.53,
  reportedAt: '2026-11-09T10:00:00-03:00',
  recurrenceCount: 3,
}

describe('occurrence validation', () => {
  it('accepts a complete occurrence', () => {
    expect(validateOccurrence(validForm)).toEqual({})
  })

  it('rejects required fields and out-of-territory coordinates', () => {
    const errors = validateOccurrence({
      ...validForm,
      title: 'curto',
      description: 'curta',
      lat: -10,
      lng: -20,
      reportedAt: 'invalid',
    })
    expect(errors.title).toBeDefined()
    expect(errors.description).toBeDefined()
    expect(errors.lat).toBeDefined()
    expect(errors.lng).toBeDefined()
    expect(errors.reportedAt).toBeDefined()
  })
})

describe('territorial priority', () => {
  const occurrence = {
    id: 'OCO-1',
    severity: 'critical',
    recurrenceCount: 6,
    status: 'open',
    reportedAt: '2026-11-09T10:00:00-03:00',
    sensorId: 'PS-01',
  }

  it('is explainable and bounded', () => {
    const result = scoreOccurrence(occurrence, {
      sensors: [{ id: 'PS-01', levelCm: 60, source: 'simulation' }],
      now: new Date('2026-11-09T12:00:00Z'),
    })
    expect(result.score).toBeGreaterThan(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.factors).toHaveLength(4)
    expect(result.experimental).toBe(true)
  })

  it('ranks a critical, recurrent, recent point above a resolved low-severity one', () => {
    const high = scoreOccurrence(occurrence, { now: new Date('2026-11-09T12:00:00Z') })
    const low = scoreOccurrence(
      {
        ...occurrence,
        severity: 'attention',
        recurrenceCount: 1,
        status: 'resolved',
        reportedAt: '2026-10-01T10:00:00Z',
      },
      { now: new Date('2026-11-09T12:00:00Z') },
    )
    expect(high.score).toBeGreaterThan(low.score)
  })
})
