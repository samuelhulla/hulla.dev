import { For, Show } from 'solid-js'
import { Button } from '@/components/button'
import {
  CodeBlockActions,
  CodeBlockFooter,
  CodeBlockHeader,
} from '@/components/code'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs'
import type { ApiCheck, ApiDiagnostic } from '@/lib/demos/api-project'
import FileIcon from './FileIcon'

// Application composition: the panel uses the same code chrome and tabs as the editor.
export default function TypeScriptPanel(props: {
  result?: ApiCheck
  checking: boolean
  onSelect: (diagnostic: ApiDiagnostic) => void
}) {
  const status = () =>
    props.checking
      ? 'Checking…'
      : props.result?.error
        ? 'Unavailable'
        : props.result
          ? `${props.result.diagnostics.length} errors`
          : 'Ready'

  return (
    <CodeBlockFooter
      class="block p-0"
      role="region"
      aria-label="TypeScript diagnostics"
      aria-busy={props.checking}>
      <Tabs defaultValue="problems" class="gap-0">
        <CodeBlockHeader>
          <TabsList aria-label="Editor panels">
            <TabsTrigger value="problems">
              Problems
              <Show
                when={!props.checking && props.result && !props.result.error}>
                <span>{props.result?.diagnostics.length}</span>
              </Show>
            </TabsTrigger>
          </TabsList>
          <CodeBlockActions>
            <span role="status" aria-live="polite">
              TypeScript · {status()}
            </span>
          </CodeBlockActions>
        </CodeBlockHeader>
        <TabsContent value="problems" class="max-h-64 overflow-auto">
          <div class="px-4 py-3 text-xs leading-6">
            <Show when={props.checking}>
              <p class="text-muted-foreground">Checking all three files…</p>
            </Show>
            <Show when={!props.result && !props.checking}>
              <p class="text-muted-foreground">
                Rename <strong class="text-foreground font-medium">name</strong>{' '}
                in the response type, or use the shortcut. The handler and
                caller will need to follow.
              </p>
            </Show>
            <Show when={props.result?.error}>
              <p class="text-danger">{props.result?.error}</p>
            </Show>
            <Show when={!props.checking && !props.result?.error}>
              <ul class="m-0 grid list-none gap-1 p-0">
                <For each={props.result?.diagnostics}>
                  {(error) => (
                    <li>
                      <Button
                        size="sm"
                        variant="ghost"
                        class="h-auto w-full justify-start text-left whitespace-normal"
                        onClick={() => props.onSelect(error)}>
                        <span class="min-w-0 break-words">
                          <span class="text-danger mr-2 font-mono">
                            TS{error.code}
                          </span>
                          {error.message}
                          <span class="text-muted-foreground ml-2 inline-flex items-center gap-1.5 font-mono">
                            <FileIcon filename={error.file} />
                            {error.file} [Ln {error.line}]
                          </span>
                        </span>
                      </Button>
                    </li>
                  )}
                </For>
              </ul>
              <Show
                when={props.result && props.result.diagnostics.length === 0}>
                <p class="text-success">
                  The contract, handler, and client agree.
                </p>
              </Show>
            </Show>
          </div>
        </TabsContent>
      </Tabs>
    </CodeBlockFooter>
  )
}
