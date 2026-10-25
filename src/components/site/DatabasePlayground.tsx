import { createSignal, Index, onCleanup, onMount, Show } from 'solid-js'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import {
  commitInventory,
  initialInventory,
  type InventoryCommand,
  type Product,
} from '@/lib/demos/inventory'

type Snapshot = {
  products: Product[]
  revision: number
  epoch: number
  origin: 'database' | 'client'
  description: string
  requestId?: number
  productId?: number
}

export default function DatabasePlayground() {
  const [database, setDatabase] = createSignal(initialInventory())
  const [client, setClient] = createSignal(initialInventory())
  const [revision, setRevision] = createSignal(0)
  const [clientRevision, setClientRevision] = createSignal(0)
  const [last, setLast] = createSignal<Snapshot>()
  const [error, setError] = createSignal('')
  const [pending, setPending] = createSignal(false)
  const [drafts, setDrafts] = createSignal<Record<number, string>>({})
  const nameRequests = new Map<number, number>()
  let request = 0
  let channel: MessageChannel | undefined
  let transaction = 0
  let epoch = 0
  const commit = (
    command: InventoryCommand,
    origin: Snapshot['origin'],
    requestId?: number
  ) => {
    const result = commitInventory(database(), command)
    if (result.error) {
      setError(result.error)
      setPending(false)
      return
    }
    setError('')
    setDatabase(result.products)
    setRevision(++transaction)
    channel?.port2.postMessage({
      products: result.products,
      revision: transaction,
      epoch,
      origin,
      description: result.description,
      requestId,
      productId: command.id,
    } satisfies Snapshot)
  }
  onMount(() => {
    channel = new MessageChannel()
    // Separate state and an actual message boundary: browser -> server model.
    channel.port2.onmessage = (
      event: MessageEvent<{
        command: InventoryCommand
        requestId: number
        epoch: number
      }>
    ) => {
      if (event.data.epoch === epoch)
        commit(event.data.command, 'client', event.data.requestId)
    }
    // Only a published server snapshot may update the client's subscribed view.
    channel.port1.onmessage = (event: MessageEvent<Snapshot>) => {
      if (event.data.epoch !== epoch || event.data.revision < clientRevision())
        return
      setClient(event.data.products)
      setClientRevision(event.data.revision)
      if (
        event.data.productId !== undefined &&
        event.data.requestId === nameRequests.get(event.data.productId)
      ) {
        const id = event.data.productId
        nameRequests.delete(id)
        setDrafts((values) => {
          const next = { ...values }
          delete next[id]
          return next
        })
      }
      setLast(event.data)
      setPending(false)
    }
  })
  onCleanup(() => {
    channel?.port1.close()
    channel?.port2.close()
  })
  const fromClient = (command: InventoryCommand) => {
    if (!channel) return
    setPending(true)
    const requestId = ++request
    if (command.kind === 'rename') {
      nameRequests.set(command.id, requestId)
      setDrafts((values) => ({ ...values, [command.id]: command.name }))
    }
    channel.port1.postMessage({ command, requestId, epoch })
  }
  return (
    <div class="demo-workspace" data-demo="db">
      <div class="demo-toolbar">
        <p class="text-muted-foreground text-sm">
          Edit the table or the app. Both writes go through the server model.
        </p>
        <Button
          size="md"
          variant="ghost"
          onClick={() => {
            const products = initialInventory()
            epoch++
            setPending(true)
            setDatabase(products)
            setDrafts({})
            nameRequests.clear()
            setRevision(++transaction)
            setError('')
            channel?.port2.postMessage({
              products,
              revision: transaction,
              epoch,
              origin: 'database',
              description: 'Restored the initial inventory',
            } satisfies Snapshot)
          }}>
          Reset
        </Button>
      </div>
      <div
        class="demo-flow"
        aria-label="Database, server and client relationship">
        <div>
          <strong>Database</strong>
          <small>products table</small>
        </div>
        <span class="demo-flow-arrow" aria-hidden="true">
          ⇄
        </span>
        <div>
          <strong>Server</strong>
          <small>validate · commit · publish</small>
        </div>
        <span class="demo-flow-arrow" aria-hidden="true">
          ⇄
        </span>
        <div>
          <strong>Client</strong>
          <small>subscribed storefront</small>
        </div>
      </div>
      <div class="demo-split" data-layout="equal">
        <section class="demo-pane" aria-label="Database table">
          <h4>products</h4>
          <p class="demo-pane-label">Edit a name or stock level directly.</p>
          <table class="w-full table-fixed border-collapse text-left text-sm">
            <thead>
              <tr class="border-border text-muted-foreground border-b">
                <th class="pr-3 pb-3 font-medium">name</th>
                <th class="w-24 pb-3 font-medium">stock</th>
              </tr>
            </thead>
            <tbody>
              <Index each={database()}>
                {(product) => (
                  <tr class="border-border border-b last:border-0">
                    <td class="py-3 pr-3">
                      <Input
                        controlSize="md"
                        variant="filled"
                        aria-label={`Database name for product ${product().id}`}
                        value={product().name}
                        maxLength={60}
                        onInput={(event) =>
                          commit(
                            {
                              kind: 'rename',
                              id: product().id,
                              name: event.currentTarget.value,
                            },
                            'database'
                          )
                        }
                      />
                    </td>
                    <td class="py-3">
                      <Input
                        controlSize="md"
                        variant="filled"
                        type="number"
                        min="0"
                        max="10000"
                        step="1"
                        aria-label={`Database stock for product ${product().id}`}
                        value={product().stock}
                        onInput={(event) => {
                          const value = event.currentTarget.value
                          if (!value.trim()) {
                            setError('Enter a stock level before committing.')
                            return
                          }
                          commit(
                            {
                              kind: 'stock',
                              id: product().id,
                              stock: Number(value),
                            },
                            'database'
                          )
                        }}
                      />
                    </td>
                  </tr>
                )}
              </Index>
            </tbody>
          </table>
          <p class="text-muted-foreground mt-4 text-sm">
            Committed revision {revision()}
          </p>
        </section>
        <section class="demo-pane" aria-label="Client storefront">
          <h4>Storefront</h4>
          <p class="demo-pane-label">
            Rename a product, or buy one to change stock.
          </p>
          <div class="grid gap-5">
            <Index each={client()}>
              {(product) => (
                <article class="border-border border-b pb-4 last:border-0 last:pb-0">
                  <Input
                    variant="underline"
                    controlSize="md"
                    aria-label={`Client name for product ${product().id}`}
                    value={drafts()[product().id] ?? product().name}
                    maxLength={60}
                    onInput={(event) =>
                      fromClient({
                        kind: 'rename',
                        id: product().id,
                        name: event.currentTarget.value,
                      })
                    }
                  />
                  <div class="mt-3 flex items-center justify-between gap-3">
                    <span
                      class={
                        product().stock > 0
                          ? 'text-success text-sm'
                          : 'text-muted-foreground text-sm'
                      }>
                      {product().stock > 0
                        ? `${product().stock} available`
                        : 'Sold out'}
                    </span>
                    <Button
                      size="md"
                      variant="outline"
                      aria-label={`Buy ${product().name}`}
                      disabled={pending() || product().stock === 0}
                      onClick={() =>
                        fromClient({ kind: 'buy', id: product().id })
                      }>
                      Buy one
                    </Button>
                  </div>
                </article>
              )}
            </Index>
          </div>
          <p class="text-muted-foreground mt-4 text-sm">
            Subscribed to products.list · revision {clientRevision()}
          </p>
        </section>
      </div>
      <Show when={error()}>
        <p class="text-danger mt-4 text-sm" role="status">
          Server rejected the edit: {error()}
        </p>
      </Show>
      <div
        class="border-border mt-5 border-t pt-4 text-sm leading-6"
        role="status">
        <Show
          when={last()}
          fallback={
            <p class="text-muted-foreground">
              Try setting the first row’s stock to 10, then buy one in the
              storefront.
            </p>
          }>
          {(change) => (
            <>
              <p class="demo-flow-message" data-origin={change().origin}>
                {change().origin === 'client'
                  ? 'Client → server → database → subscribed UI'
                  : 'Database → server query → subscribed UI'}
              </p>
              <p>
                {change().description} · committed and published at revision{' '}
                {change().revision}.
              </p>
            </>
          )}
        </Show>
      </div>
      <p class="text-muted-foreground mt-4 text-sm leading-6">
        Local model with separate client and database state connected by message
        ports. No PostgreSQL connection.
      </p>
    </div>
  )
}
