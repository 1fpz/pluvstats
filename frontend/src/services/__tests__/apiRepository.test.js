import { describe, expect, it, vi } from 'vitest'
import { ApiRepository } from '../apiRepository'

function fakeResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  }
}

const snapshot = {
  version: 2,
  sensors: [],
  occurrences: [],
  alerts: [],
  simulation: { running: true, scenario: 'normal', tickCount: 0 },
  sourceKind: 'api',
}

describe('ApiRepository', () => {
  it('accepts a base URL with or without /api', () => {
    expect(new ApiRepository({ baseUrl: 'http://host:8000' }).endpoint('/api/snapshot')).toBe(
      'http://host:8000/api/snapshot',
    )
    expect(new ApiRepository({ baseUrl: 'http://host:8000/api/' }).endpoint('/api/snapshot')).toBe(
      'http://host:8000/api/snapshot',
    )
  })

  it('loads the snapshot and notifies subscribers', async () => {
    const fetchImpl = vi.fn(async () => fakeResponse(snapshot))
    const repository = new ApiRepository({ baseUrl: 'http://host:8000', fetchImpl })
    const events = []
    repository.subscribe((next) => events.push(next))

    const result = await repository.init()

    expect(result.sourceKind).toBe('api')
    expect(events).toHaveLength(1)
    expect(fetchImpl.mock.calls[0][0]).toBe('http://host:8000/api/snapshot')
  })

  it('maps a 422 payload into field errors', async () => {
    const fetchImpl = vi.fn(async () =>
      fakeResponse(
        {
          detail: [
            { loc: ['body', 'reported_at'], msg: 'invalid datetime', type: 'datetime_parse' },
            { loc: ['body', 'position', 'lat'], msg: 'out of range', type: 'value_error' },
          ],
        },
        422,
      ),
    )
    const repository = new ApiRepository({ baseUrl: 'http://host:8000', fetchImpl })

    await expect(repository.request('/api/occurrences', { method: 'POST', body: {} })).rejects.toMatchObject({
      name: 'ValidationError',
      fieldErrors: { reportedAt: expect.any(String), lat: expect.any(String) },
    })
  })

  it('extracts the snapshot from a tick payload', async () => {
    const fetchImpl = vi.fn(async () => fakeResponse({ snapshot: { ...snapshot, tick: 3 } }))
    const repository = new ApiRepository({ baseUrl: 'http://host:8000', fetchImpl })
    const events = []
    repository.subscribe((next) => events.push(next))

    const result = await repository.tickSimulation()

    expect(result.tick).toBe(3)
    expect(events).toHaveLength(1)
    expect(fetchImpl.mock.calls[0]).toStrictEqual([
      'http://host:8000/api/simulation/tick',
      expect.objectContaining({ method: 'POST' }),
    ])
  })

  it('posts the occurrence payload and refreshes the snapshot', async () => {
    const fetchImpl = vi.fn(async (url, init) => {
      if (init?.method === 'POST') {
        return fakeResponse({ id: 'OCO-2026-0150' }, 201)
      }
      return fakeResponse(snapshot)
    })
    const repository = new ApiRepository({ baseUrl: 'http://host:8000', fetchImpl })

    const record = await repository.createOccurrence({
      title: 'Acúmulo de água na rua de teste',
      type: 'waterlogging',
      status: 'open',
      severity: 'attention',
      address: 'Rua de Teste, 10',
      neighborhood: 'Centro',
      description: 'Descrição suficientemente longa para validar o formulário local.',
      lat: '-23.66',
      lng: '-46.53',
      reportedAt: '2026-11-12T09:00',
      recurrenceCount: 1,
      affectedPeopleEstimate: 0,
      sensorId: '',
    })

    expect(record.id).toBe('OCO-2026-0150')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('http://host:8000/api/occurrences')
    const body = JSON.parse(init.body)
    expect(body.position).toEqual({ lat: -23.66, lng: -46.53 })
    expect(body.reportedAt).toMatch(/Z$/)
  })

  it('rejects invalid local input before calling the API', async () => {
    const fetchImpl = vi.fn()
    const repository = new ApiRepository({ baseUrl: 'http://host:8000', fetchImpl })

    await expect(
      repository.createOccurrence({
        title: 'curto',
        type: 'flooding',
        status: 'open',
        severity: 'attention',
        address: '',
        neighborhood: '',
        description: 'curta',
        lat: '',
        lng: '',
        reportedAt: '',
      }),
    ).rejects.toMatchObject({ name: 'ValidationError' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
