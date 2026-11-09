/** Joins conditional class names without external dependencies. */
export function cn(...values) {
  return values.flat(Infinity).filter(Boolean).join(' ')
}
