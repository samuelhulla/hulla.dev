import { describe, expect, test } from 'bun:test'

import { createTypedStorage, defineStorageItem } from '../src/lib/typed-storage'

function expectType<Value>(value: Value) {
  void value
}

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

const schema = {
  count: defineStorageItem<number>({
    storageKey: 'count-v1',
    defaultValue: () => 0,
    parse: (value) => (typeof value === 'number' ? value : undefined),
  }),
  preferences: defineStorageItem<{ compact: boolean }>({
    storageKey: 'preferences-v1',
    defaultValue: () => ({ compact: false }),
    parse: (value) =>
      value !== null &&
      typeof value === 'object' &&
      'compact' in value &&
      typeof value.compact === 'boolean'
        ? { compact: value.compact }
        : undefined,
  }),
}

describe('typed storage', () => {
  test('uses typed defaults and persists values by schema key', () => {
    const storage = new MemoryStorage()
    const store = createTypedStorage({ getStorage: () => storage, schema })

    expectType<number>(store.get('count'))
    expectType<{ compact: boolean }>(store.get('preferences'))
    expect(store.get('count')).toBe(0)
    expect(store.set('count', 4)).toBe(true)
    expect(store.get('count')).toBe(4)
    expect(storage.getItem('count-v1')).toBe('4')
  })

  test('rejects malformed stored data at runtime', () => {
    const storage = new MemoryStorage()
    const store = createTypedStorage({ getStorage: () => storage, schema })
    storage.setItem('preferences-v1', JSON.stringify({ compact: 'yes' }))

    expect(store.get('preferences')).toEqual({ compact: false })
  })

  test('updates and removes values without exposing raw storage keys', () => {
    const storage = new MemoryStorage()
    const store = createTypedStorage({ getStorage: () => storage, schema })

    expect(store.update('count', (count) => count + 1)).toBe(1)
    expect(store.remove('count')).toBe(true)
    expect(store.get('count')).toBe(0)
  })

  test('falls back when browser storage is unavailable', () => {
    const store = createTypedStorage({
      getStorage: () => {
        throw new Error('blocked')
      },
      schema,
    })

    expect(store.get('count')).toBe(0)
    expect(store.set('count', 1)).toBe(false)
  })
})
