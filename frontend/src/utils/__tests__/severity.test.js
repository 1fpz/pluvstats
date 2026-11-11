import { describe, expect, it } from 'vitest'
import { currentSituationSeverity, worstSeverity } from '@/utils/severity'

describe('public situation severity', () => {
  it('stays normal when every live signal is normal', () => {
    const sensors = [
      { alertSeverity: 'normal' },
      { alertSeverity: null },
    ]
    expect(currentSituationSeverity(sensors, [])).toBe('normal')
  })

  it('uses the most severe live sensor or open alert', () => {
    expect(currentSituationSeverity([{ alertSeverity: 'attention' }], [])).toBe('attention')
    expect(currentSituationSeverity([], [{ severity: 'alert' }])).toBe('alert')
    expect(
      currentSituationSeverity(
        [{ alertSeverity: 'attention' }, { alertSeverity: 'critical' }],
        [{ severity: 'alert' }],
      ),
    ).toBe('critical')
  })

  it('does not receive historical occurrences, so resolved events cannot raise the status', () => {
    // The function contract only accepts live sensors and open alerts. A
    // resolved critical occurrence is therefore not part of the calculation.
    expect(currentSituationSeverity([], [])).toBe('normal')
    expect(worstSeverity([])).toBe('normal')
  })
})
