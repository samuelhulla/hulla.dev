import {
  createSignal,
  Index,
  Match,
  Switch,
  lazy,
  Suspense,
  onMount,
} from 'solid-js'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { cn } from '@/lib/style'
import ApiPlayground from './ApiPlayground'
import DatabasePlayground from './DatabasePlayground'
import StylePlayground from './StylePlayground'
import '@/styles/playgrounds.css'

const PackageWorkflowDemo = lazy(() => import('./PackageWorkflowDemo'))
export type DemoKind =
  'api' | 'ui' | 'db' | 'style' | 'control' | 'args' | 'gittar' | 'cli'
type Task = { title: string; done: boolean }
const initialTasks = (): Task[] => [
  { title: 'Review the schema', done: false },
  { title: 'Ship the release', done: false },
]

function UiDemo() {
  let input: HTMLInputElement | undefined
  const [tasks, setTasks] = createSignal(initialTasks())
  const [title, setTitle] = createSignal('')
  const complete = () => tasks().filter((task) => task.done).length
  const add = () => {
    const value = title().trim()
    if (!value) return
    setTasks((items) => [...items, { title: value, done: false }])
    setTitle('')
    input?.focus()
  }

  return (
    <div class="grid gap-3" data-demo="ui">
      <div class="flex items-center justify-between gap-2">
        <strong class="text-sm font-medium">Release checklist</strong>
        <span class="text-muted-foreground text-sm" role="status">
          {complete()} / {tasks().length} complete
        </span>
      </div>
      <ul class="grid max-h-64 list-none gap-2 overflow-y-auto p-0">
        <Index each={tasks()}>
          {(task, index) => (
            <li class="flex items-center justify-between gap-3 text-sm">
              <span
                class={cn(
                  'min-w-0 [overflow-wrap:anywhere]',
                  task().done && 'text-muted-foreground line-through'
                )}>
                {task().title}
              </span>
              <Button
                size="md"
                variant={task().done ? 'secondary' : 'ghost'}
                aria-pressed={task().done}
                aria-label={`${task().done ? 'Reopen' : 'Complete'} ${task().title}`}
                onClick={() =>
                  setTasks((items) =>
                    items.map((item, i) =>
                      i === index ? { ...item, done: !item.done } : item
                    )
                  )
                }>
                {task().done ? 'Done' : 'Complete'}
              </Button>
            </li>
          )}
        </Index>
      </ul>
      <form
        class="border-border flex items-center gap-2 border-t pt-3"
        onSubmit={(event) => {
          event.preventDefault()
          add()
        }}>
        <Input
          ref={(element) => {
            input = element
          }}
          controlSize="md"
          aria-label="New checklist task"
          placeholder="Add a task…"
          value={title()}
          maxLength={60}
          onInput={(event) => setTitle(event.currentTarget.value)}
        />
        <Button size="md" type="submit" disabled={!title().trim()}>
          Add task
        </Button>
      </form>
      <p class="text-muted-foreground text-sm leading-6">
        Uses this site's shipped Solid components. Try adding tasks and moving
        through the form with your keyboard.
      </p>
    </div>
  )
}

export default function PackageDemo(props: {
  kind: DemoKind
  presentation?: 'showcase'
}) {
  const [ready, setReady] = createSignal(false)
  onMount(() => setReady(true))
  return (
    <fieldset
      class="m-0 min-w-0 border-0 p-0"
      disabled={!ready()}
      aria-label={`${props.kind} package playground`}>
      <Switch>
        <Match when={props.kind === 'api'}>
          <ApiPlayground />
        </Match>
        <Match when={props.kind === 'db'}>
          <DatabasePlayground />
        </Match>
        <Match when={props.kind === 'style'}>
          <StylePlayground />
        </Match>
        <Match when={props.kind === 'ui'}>
          <UiDemo />
        </Match>
        <Match
          when={
            props.kind === 'control' ||
            props.kind === 'args' ||
            props.kind === 'gittar' ||
            props.kind === 'cli'
          }>
          <Suspense
            fallback={
              <p class="text-muted-foreground text-sm">
                Loading working example…
              </p>
            }>
            <PackageWorkflowDemo
              kind={props.kind as 'control' | 'args' | 'gittar' | 'cli'}
            />
          </Suspense>
        </Match>
      </Switch>
    </fieldset>
  )
}
