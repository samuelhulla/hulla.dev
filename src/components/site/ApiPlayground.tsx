import { createSignal, For, onCleanup } from 'solid-js'
import { Button } from '@/components/button'
import {
  apiProject,
  type ApiCheck,
  type ApiDiagnostic,
  type ApiSources,
} from '@/lib/demos/api-project'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
} from '@/components/code'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs'
import CodeMirrorSurface from './CodeMirrorSurface'
import TypeScriptPanel from './TypeScriptPanel'
import FileIcon from './FileIcon'

export default function ApiPlayground() {
  const [project, setProject] = createSignal<ApiSources>(
    apiProject('name', 'name')
  )
  const [file, setFile] = createSignal<keyof ApiSources>('/contract.ts')
  const [result, setResult] = createSignal<ApiCheck>()
  const [checking, setChecking] = createSignal(false)
  const [selection, setSelection] = createSignal<ApiDiagnostic>()
  let worker: Worker | undefined
  let debounce: ReturnType<typeof setTimeout> | undefined
  let revision = 0
  const requestCheck = () => {
    clearTimeout(debounce)
    revision++
    setChecking(true)
    setSelection(undefined)
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
      <Tabs
        value={file()}
        onValueChange={(value) => setFile(value as keyof ApiSources)}>
        <CodeBlock data-demo-editor>
          <CodeBlockHeader>
            <TabsList aria-label="Project files">
              <For
                each={['/contract.ts', '/server.ts', '/profile.ts'] as const}>
                {(name) => (
                  <TabsTrigger value={name}>
                    <FileIcon filename={name} />
                    {name.slice(1)}
                  </TabsTrigger>
                )}
              </For>
            </TabsList>
            <CodeBlockActions>
              <span class="text-muted-foreground text-xs">Editable</span>
            </CodeBlockActions>
          </CodeBlockHeader>
          <CodeBlockBody>
            <For each={['/contract.ts', '/server.ts', '/profile.ts'] as const}>
              {(name) => (
                <TabsContent value={name} tabIndex={-1}>
                  <CodeMirrorSurface
                    label={`Edit ${name.slice(1)}`}
                    value={project()[name]}
                    height={330}
                    selection={
                      selection()?.file === name.slice(1)
                        ? selection()
                        : undefined
                    }
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
                </TabsContent>
              )}
            </For>
          </CodeBlockBody>
          <TypeScriptPanel
            result={result()}
            checking={checking()}
            onSelect={(diagnostic) => {
              setFile(`/${diagnostic.file}` as keyof ApiSources)
              setSelection({ ...diagnostic })
            }}
          />
        </CodeBlock>
      </Tabs>
      <p class="text-muted-foreground mt-3 text-xs leading-6">
        Real TypeScript and @hulla/api declarations. Code is type-checked
        locally; no API request or AI agent runs.
      </p>
    </div>
  )
}
