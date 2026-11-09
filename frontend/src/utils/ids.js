export function nextSequentialId(prefix, existing = [], year = new Date().getFullYear()) {
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`)
  const highest = existing.reduce((max, item) => {
    const match = pattern.exec(item.id ?? '')
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0)
  return `${prefix}-${year}-${String(highest + 1).padStart(4, '0')}`
}

export function createId(prefix) {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${random}`
}
