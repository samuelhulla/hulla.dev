export type LayerHandle<Metadata = unknown> = {
  readonly active: boolean
  readonly isTop: boolean
  readonly metadata: Metadata
  readonly order: number
  release: () => void
}

export type LayerStack = {
  getSnapshot: () => readonly LayerHandle[]
  push: {
    (): LayerHandle<undefined>
    <const Metadata>(metadata: Metadata): LayerHandle<Metadata>
  }
  subscribe: (listener: () => void) => () => void
  top: () => LayerHandle | undefined
}

type LayerRecord = {
  handle: LayerHandle
  token: symbol
}

export function createLayerStack(): LayerStack {
  let nextOrder = 0
  let records: readonly LayerRecord[] = []
  let snapshot: readonly LayerHandle[] = []

  const listeners = new Set<() => void>()

  const publish = () => {
    snapshot = records.map(({ handle }) => handle)

    for (const listener of listeners) {
      listener()
    }
  }

  function push(): LayerHandle<undefined>
  function push<const Metadata>(metadata: Metadata): LayerHandle<Metadata>
  function push<const Metadata>(metadata?: Metadata): LayerHandle<Metadata> {
    const token = Symbol('layer')
    const order = nextOrder++

    const handle: LayerHandle<Metadata> = {
      get active() {
        return records.some((record) => record.token === token)
      },
      get isTop() {
        return records.at(-1)?.token === token
      },
      metadata: metadata as Metadata,
      order,
      release() {
        const remaining = records.filter((record) => record.token !== token)

        if (remaining.length === records.length) return

        records = remaining
        if (records.length === 0) nextOrder = 0
        publish()
      },
    }

    records = [...records, { handle, token }]
    publish()

    return handle
  }

  return {
    getSnapshot: () => snapshot,
    push,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    top: () => records.at(-1)?.handle,
  }
}

export const layers = createLayerStack()
