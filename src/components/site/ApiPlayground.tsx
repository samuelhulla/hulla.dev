import { createSignal, For, onCleanup, Show } from 'solid-js'
import { Button } from '@/components/button'
import {
  apiProject,
  type ApiCheck,
  type ApiSources,
} from '@/lib/demos/api-project'
import DemoEditor from './DemoEditor'

export default function ApiPlayground() {
  const [project, setProject] = createSignal<ApiSources>(
    apiProject('name', 'name')
  )
  const [file, setFile] = createSignal<keyof ApiSources>('/contract.ts')
  const [result, setResult] = createSignal<ApiCheck>()
  const [checking, setChecking] = createSignal(false)
  let worker: Worker | undefined
  let debounce: ReturnType<typeof setTimeout> | undefined
  let revision = 0
  const requestCheck = () => {
    clearTimeout(debounce)
    revision++
    setChecking(true)
    debounce = setTimeout(() => {
      if (!worker) {
        worker = new Worker(
          new URL('../../lib/demos/api-typecheck.worker.ts', import.meta.url),
          { type: 'module' }
        )
        worker.onmessage = (event: MessageEvent<ApiCheck>) => {
          if (event.data.revision !== revision) return
          setResult(event.data)
          setChecking(false)
        }
        worker.onerror = () => {
          setResult({
            revision,
            diagnostics: [],
            error: 'The checker could not load. Edit a file to retry.',
          })
          setChecking(false)
          worker?.terminate()
          worker = undefined
        }
      }
      worker.postMessage({ revision, project: project() })
    }, 250)
  }
  const load = (broken: boolean) => {
    setProject(apiProject('displayName', broken ? 'name' : 'displayName'))
    setFile('/contract.ts')
    requestCheck()
  }
  onCleanup(() => {
    clearTimeout(debounce)
    worker?.terminate()
  })
  return (
    <div
      class="demo-workspace"
      data-demo="api"
      aria-label="Live TypeScript project">
      <div class="demo-toolbar">
        <p class="text-muted-foreground text-sm">
          Edit any file. TypeScript checks all three together.
        </p>
        <div
          class="flex flex-wrap gap-1"
          aria-label="Example shortcuts"
          role="group">
          <Button size="md" variant="ghost" onClick={() => load(true)}>
            Break the contract
          </Button>
          <Button size="md" variant="ghost" onClick={() => load(false)}>
            Load repaired example
          </Button>
        </div>
      </div>
      <div class="demo-split">
        <div class="min-w-0">
          <div
            class="mb-3 flex flex-wrap gap-1"
            role="group"
            aria-label="Project files">
            <For each={['/contract.ts', '/server.ts', '/profile.ts'] as const}>
              {(name) => (
                <Button
                  size="md"
                  variant={file() === name ? 'secondary' : 'ghost'}
                  aria-pressed={file() === name}
                  onClick={() => setFile(name)}>
                  {name.slice(1)}
                </Button>
              )}
            </For>
          </div>
          <For each={['/contract.ts', '/server.ts', '/profile.ts'] as const}>
            {(name) => (
              <div hidden={file() !== name}>
                <DemoEditor
                  filename={name.slice(1)}
                  label={`Edit ${name.slice(1)}`}
                  value={project()[name]}
                  height={330}
                  diagnostics={
                    checking()
                      ? []
                      : result()?.diagnostics.filter(
                          (error) => `/${error.file}` === name
                        )
                  }
                  onChange={(source) => {
                    setProject((files) => ({ ...files, [name]: source }))
                    requestCheck()
                  }}
                />
              </div>
            )}
          </For>
        </div>
        <section
          class="demo-output"
          aria-label="TypeScript diagnostics"
          aria-busy={checking()}>
          <div class="demo-output-heading">
            <h4>TypeScript</h4>
            <span class="text-muted-foreground text-sm" role="status">
              {checking()
                ? 'Checking…'
                : result()?.error
                  ? 'Unavailable'
                  : result()
                    ? `${result()!.diagnostics.length} errors`
                    : 'Ready'}
            </span>
          </div>
          <Show when={!result() && !checking()}>
            <p class="text-muted-foreground text-sm leading-6">
              Rename <strong class="text-foreground font-medium">name</strong>{' '}
              in the response type, or use the shortcut. The handler and caller
              will need to follow.
            </p>
          </Show>
          <Show when={result()?.error}>
            <p class="text-danger text-sm leading-6">{result()!.error}</p>
          </Show>
          <Show when={!checking() && !result()?.error}>
            <ul class="m-0 grid list-none gap-5 p-0">
              <For each={result()?.diagnostics}>
                {(error) => (
                  <li class="text-sm leading-6">
                    <p class="text-danger mb-1 font-mono">
                      {error.file}:{error.line} · TS{error.code}
                    </p>
                    <p>{error.message}</p>
                  </li>
                )}
              </For>
            </ul>
            <Show when={result() && result()!.diagnostics.length === 0}>
              <p class="text-success text-base leading-7">
                The contract, handler, and client agree.
              </p>
            </Show>
          </Show>
          <p class="text-muted-foreground mt-6 text-sm leading-6">
            Real TypeScript and @hulla/api declarations. Code is type-checked
            locally; no API request or AI agent runs.
          </p>
        </section>
      </div>
    </div>
  )
}
