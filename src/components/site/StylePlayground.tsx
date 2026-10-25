import { createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { Button } from '@/components/button'
import { cn } from '@/lib/style'
import { styleSource, type StyleOutput } from '@/lib/demos/style-project'
import DemoEditor from './DemoEditor'

const initial: StyleOutput = {
  preview: {
    notice: 'py-2 text-primary-text px-4',
    activity: 'py-2 text-primary-text px-4 font-semibold',
    cell: 'py-2 text-primary-text px-6',
  },
  trace: { variant: 'px-4', override: 'py-2 text-primary-text px-6' },
}
export default function StylePlayground() {
  const [source, setSource] = createSignal(styleSource)
  const [output, setOutput] = createSignal<StyleOutput>(initial)
  const [error, setError] = createSignal('')
  const [pending, setPending] = createSignal(false)
  let worker: Worker | undefined
  let debounce: ReturnType<typeof setTimeout> | undefined
  let timeout: ReturnType<typeof setTimeout> | undefined
  let revision = 0
  const run = (benchmark = false) => {
    clearTimeout(debounce)
    clearTimeout(timeout)
    worker?.terminate()
    revision++
    setPending(true)
    debounce = setTimeout(() => {
      worker = new Worker(
        new URL('../../lib/demos/style-evaluate.worker.ts', import.meta.url),
        { type: 'module' }
      )
      timeout = setTimeout(() => {
        worker?.terminate()
        setPending(false)
        setError('The code runner took too long to load. Edit to retry.')
      }, 15000)
      worker.onmessage = (
        event: MessageEvent<{
          revision: number
          output?: StyleOutput
          error?: string
          started?: boolean
        }>
      ) => {
        if (event.data.revision !== revision) return
        clearTimeout(timeout)
        if (event.data.started) {
          timeout = setTimeout(() => {
            worker?.terminate()
            setPending(false)
            setError(
              'Execution stopped after 3 seconds. Check for a loop, then edit to run again.'
            )
          }, 3000)
          return
        }
        setPending(false)
        setError(event.data.error ?? '')
        if (event.data.output) setOutput(event.data.output)
        worker?.terminate()
      }
      worker.onerror = () => {
        clearTimeout(timeout)
        setPending(false)
        setError('The code runner could not load. Edit the code to retry.')
        worker?.terminate()
      }
      worker.postMessage({ revision, source: source(), benchmark })
    }, 250)
  }
  const edit = (value: string) => {
    setSource(value)
    run()
  }
  onMount(() => run())
  onCleanup(() => {
    clearTimeout(debounce)
    clearTimeout(timeout)
    worker?.terminate()
  })
  return (
    <div class="demo-workspace" data-demo="style">
      <div class="demo-toolbar">
        <p class="text-muted-foreground text-sm">
          Edit the source. One processor drives all three previews.
        </p>
        <div
          class="flex flex-wrap gap-1"
          role="group"
          aria-label="Style example shortcuts">
          <Button
            size="md"
            variant="ghost"
            onClick={() =>
              edit(styleSource.replace('text-primary-text', 'text-success'))
            }>
            Use a green accent
          </Button>
          <Button
            size="md"
            variant="ghost"
            onClick={() =>
              edit(
                styleSource.replace(
                  'style({ composer: mergeClasses })',
                  'style()'
                )
              )
            }>
            Remove the merger
          </Button>
          <Button size="md" variant="ghost" onClick={() => edit(styleSource)}>
            Reset
          </Button>
        </div>
      </div>
      <div class="demo-split">
        <DemoEditor
          value={source()}
          onChange={edit}
          filename="style.ts"
          label="Edit style code"
          height={390}
        />
        <section class="demo-output" aria-label="Live style preview">
          <div class="demo-output-heading">
            <h4>Live preview</h4>
            <span class="text-muted-foreground text-sm" role="status">
              {pending() ? 'Running…' : error() ? 'Fix the code' : 'Up to date'}
            </span>
          </div>
          <Show when={error()}>
            <p class="text-danger mb-5 text-sm leading-6" role="status">
              {error()} The preview keeps the last working result.
            </p>
          </Show>
          <div
            class="grid gap-4"
            style={{ contain: 'layout paint', isolation: 'isolate' }}>
            <For
              each={
                [
                  ['notice', 'Notice', 'Your deployment is ready.'],
                  ['activity', 'Activity', 'Production updated by Ada'],
                  [
                    'cell',
                    'Table cell · local px-6 override',
                    'Release v2.0 · healthy',
                  ],
                ] as const
              }>
              {([key, label, text]) => (
                <div class="bg-foreground/5 rounded-md py-3">
                  <p class="text-muted-foreground mb-1 px-4 text-sm">{label}</p>
                  <p class={cn('text-base', output().preview[key])}>{text}</p>
                </div>
              )}
            </For>
          </div>
          <div class="mt-5 grid gap-3" aria-label="Composition output">
            <For each={Object.entries(output().trace)}>
              {([key, value]) => (
                <p class="text-sm leading-6">
                  <span class="text-muted-foreground block">{key}</span>
                  <code class="font-mono" textContent={value} />
                </p>
              )}
            </For>
          </div>
        </section>
      </div>
      <div class="border-border mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
        <Button
          size="md"
          variant="outline"
          disabled={pending()}
          onClick={() => run(true)}>
          Measure 10,000 compositions
        </Button>
        <p class="text-muted-foreground text-sm" role="status">
          {output().elapsed === undefined
            ? 'Uses the installed @hulla/style package and this site’s CSS.'
            : `${output().elapsed!.toFixed(1)} ms in this browser · ${output().characters!.toLocaleString()} output characters`}
        </p>
      </div>
    </div>
  )
}
