export interface StorageItem<Value> {
  storageKey: string
  defaultValue(): Value
  parse(value: unknown): Value | undefined
  serialize?(value: Value): unknown
}

type StorageSchema = Record<string, StorageItem<unknown>>

type StorageValue<Item> = Item extends StorageItem<infer Value> ? Value : never

export function defineStorageItem<Value>(
  item: StorageItem<Value>
): StorageItem<Value> {
  return item
}

export function createTypedStorage<const Schema extends StorageSchema>({
  getStorage,
  schema,
}: {
  getStorage(): Storage | undefined
  schema: Schema
}) {
  function resolveStorage(): Storage | undefined {
    try {
      return getStorage()
    } catch {
      return undefined
    }
  }

  function getItem<Key extends keyof Schema>(key: Key): Schema[Key] {
    return schema[key] as Schema[Key]
  }

  function get<Key extends keyof Schema>(key: Key): StorageValue<Schema[Key]> {
    const item = getItem(key)

    try {
      const serialized = resolveStorage()?.getItem(item.storageKey)
      if (serialized === null || serialized === undefined) {
        return item.defaultValue() as StorageValue<Schema[Key]>
      }

      const value = item.parse(JSON.parse(serialized))
      return (
        value === undefined ? item.defaultValue() : value
      ) as StorageValue<Schema[Key]>
    } catch {
      return item.defaultValue() as StorageValue<Schema[Key]>
    }
  }

  function set<Key extends keyof Schema>(
    key: Key,
    value: StorageValue<Schema[Key]>
  ): boolean {
    const item = getItem(key)
    const storage = resolveStorage()
    if (!storage) return false

    try {
      const serializedValue = item.serialize ? item.serialize(value) : value
      const serialized = JSON.stringify(serializedValue)
      if (serialized === undefined) return false

      storage.setItem(item.storageKey, serialized)
      return true
    } catch {
      return false
    }
  }

  function update<Key extends keyof Schema>(
    key: Key,
    updater: (value: StorageValue<Schema[Key]>) => StorageValue<Schema[Key]>
  ): StorageValue<Schema[Key]> {
    const value = updater(get(key))
    set(key, value)
    return value
  }

  function remove<Key extends keyof Schema>(key: Key): boolean {
    const storage = resolveStorage()
    if (!storage) return false

    try {
      storage.removeItem(getItem(key).storageKey)
      return true
    } catch {
      return false
    }
  }

  return { get, remove, set, update }
}
