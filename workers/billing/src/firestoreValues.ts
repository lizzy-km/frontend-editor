/** Firestore REST "typed values" <-> plain JavaScript values. Dates are timestamps. */
export type FsValue = Record<string, unknown>

export function toValue(value: unknown): FsValue {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } }
  return { mapValue: { fields: toFields(value as Record<string, unknown>) } }
}

export const toFields = (data: Record<string, unknown>): Record<string, FsValue> =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined).map(([key, value]) => [key, toValue(value)]))

export function fromValue(value: FsValue): unknown {
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('timestampValue' in value) return new Date(String(value.timestampValue))
  if ('arrayValue' in value) return (((value.arrayValue as { values?: FsValue[] }).values) ?? []).map(fromValue)
  if ('mapValue' in value) return fromFields((value.mapValue as { fields?: Record<string, FsValue> }).fields ?? {})
  return null
}

export const fromFields = (fields: Record<string, FsValue>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromValue(value)]))
