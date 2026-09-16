import { createTypedStorage, defineStorageItem } from '@/lib/typed-storage'

export type DocsSidebarState = Record<string, string[]>

function parseDocsSidebarState(value: unknown): DocsSidebarState | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const entries = Object.entries(value)
  if (
    !entries.every(
      (entry): entry is [string, string[]] =>
        Array.isArray(entry[1]) &&
        entry[1].every((item) => typeof item === 'string')
    )
  ) {
    return undefined
  }

  return Object.fromEntries(entries)
}

// Declare new session-scoped values here. The key and value type are then
// inferred by every appSessionStorage operation.
const sessionStorageSchema = {
  docsSidebar: defineStorageItem<DocsSidebarState>({
    storageKey: 'hulla-docs-sidebar-state-v1',
    defaultValue: () => ({}),
    parse: parseDocsSidebarState,
  }),
}

export const appSessionStorage = createTypedStorage({
  schema: sessionStorageSchema,
  getStorage() {
    if (typeof window === 'undefined') return undefined
    return window.sessionStorage
  },
})
