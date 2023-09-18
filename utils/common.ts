// #region uuid
export function useUUID(pattern?: string) {
  // Accept any desired pattern. If no pattern is provided
  // default to a RFC4122 UUID pattern.
  const _pattern = pattern || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

  // Replace each character in the pattern
  // leaving any non x|y character alone.
  return _pattern.replace(/[xy]/g, (c: string) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
// #endregion
