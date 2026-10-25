import {
  createMemo,
  createSignal,
  For,
  Index,
  Match,
  Show,
  Switch,
} from 'solid-js'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { deploymentConfig, previewArguments } from '@/lib/demos/input-workflows'
import {
  installPlan,
  installSource,
  templateOptions,
  templateSource,
} from '@/lib/demos/workflow-models'
import DemoEditor from './DemoEditor'

function ControlDemo() {
  const [source, setSource] = createSignal('{\n  "replicas": 3\n}')
  const outcome = createMemo(() => deploymentConfig(source()))
  return (
    <div class="demo-workspace" data-demo="control">
      <div class="demo-toolbar">
        <p class="text-muted-foreground text-sm">
          Edit the config and see where the deployment stops.
        </p>
        <div
          class="flex flex-wrap gap-1"
          role="group"
          aria-label="Config shortcuts">
          <Button
            size="md"
            variant="ghost"
            onClick={() => setSource('{\n  "replicas":\n}')}>
            Break the JSON
          </Button>
          <Button
            size="md"
            variant="ghost"
            onClick={() => setSource('{\n  "replicas": 0\n}')}>
            Use zero replicas
          </Button>
          <Button
            size="md"
            variant="ghost"
            onClick={() => setSource('{\n  "replicas": 3\n}')}>
            Reset
          </Button>
        </div>
      </div>
      <div class="demo-split">
        <DemoEditor
          filename="deploy.json"
          label="Edit deployment config"
          language="json"
          value={source()}
          onChange={setSource}
          height={170}
        />
        <section class="demo-output" aria-label="Deployment result">
          <div class="demo-output-heading">
            <h4>Deployment pipeline</h4>
          </div>
          <ol class="m-0 grid list-none gap-3 p-0 text-sm">
            <For
              each={['Parse JSON', 'Validate config', 'Build deployment plan']}>
              {(step, index) => (
                <li class="flex justify-between gap-4">
                  <span>
                    {index() + 1}. {step}
                  </span>
                  <span class="text-muted-foreground">
                    {outcome().steps.includes(step)
                      ? outcome().result.isErr() &&
                        outcome().steps.at(-1) === step
                        ? 'Err · handled'
                        : 'Ok'
                      : 'Not reached'}
                  </span>
                </li>
              )}
            </For>
          </ol>
          <p
            class={
              outcome().result.isOk()
                ? 'text-success mt-5 text-base'
                : 'text-danger mt-5 text-base'
            }
            role="status">
            {outcome().result.match(
              (value) => value,
              (error) => error.message
            )}
          </p>
        </section>
      </div>
      <p class="text-muted-foreground mt-5 text-sm leading-6">
        Runs @hulla/control locally. Thrown syntax errors and explicit
        validation failures both become results. Nothing is deployed.
      </p>
    </div>
  )
}

function ArgsDemo() {
  const [source, setSource] = createSignal('storefront --port 8080 --open')
  const outcome = createMemo(() => previewArguments(source()))
  return (
    <div class="demo-workspace" data-demo="args">
      <div class="demo-toolbar">
        <p class="text-muted-foreground text-sm">
          Type arguments for your preview command.
        </p>
        <div
          class="flex flex-wrap gap-1"
          role="group"
          aria-label="Argument shortcuts">
          <Button
            size="md"
            variant="ghost"
            onClick={() => setSource('storefront --port nope')}>
            Try an invalid port
          </Button>
          <Button
            size="md"
            variant="ghost"
            onClick={() => setSource('storefront')}>
            Omit the port
          </Button>
        </div>
      </div>
      <label class="grid gap-2 text-sm">
        preview{' '}
        <Input
          controlSize="md"
          class="font-mono"
          aria-label="Preview command arguments"
          value={source()}
          maxLength={200}
          onInput={(event) => setSource(event.currentTarget.value)}
        />
      </label>
      <div class="border-border mt-5 border-t pt-5" role="status">
        <Show
          when={outcome().values}
          fallback={
            <>
              <h4 class="text-danger mb-2 text-base font-medium">
                Preview not started
              </h4>
              <p class="text-sm leading-6">{outcome().error}</p>
              <p class="text-muted-foreground mt-2 text-sm">
                The handler never receives this invalid input.
              </p>
            </>
          }>
          {(values) => (
            <>
              <h4 class="text-success mb-3 text-base font-medium">
                Ready to start {values().project}
              </h4>
              <DemoEditor
                filename="Parsed arguments"
                label="Parsed arguments"
                language="json"
                readOnly
                value={JSON.stringify(values(), null, 2)}
                height={150}
              />
              <p class="text-muted-foreground mt-4 text-sm leading-6">
                {outcome().metadata?.portDetected
                  ? `The supplied port is a number. Original input: ${outcome().metadata?.rawPort}.`
                  : 'No port supplied. Your application chooses the 3000 fallback.'}
              </p>
            </>
          )}
        </Show>
      </div>
      <p class="text-muted-foreground mt-5 text-sm leading-6">
        Runs @hulla/args + Zod. Space-separated tokens; no shell quoting or
        server startup.
      </p>
    </div>
  )
}

function GittarDemo() {
  const [source, setSource] = createSignal(templateSource)
  const [projects, setProjects] = createSignal<
    { directory: string; title: string }[]
  >([])
  const [downloads, setDownloads] = createSignal(0)
  const [error, setError] = createSignal('')
  const copy = () => {
    try {
      const options = templateOptions(source())
      if (downloads() === 0 || options.update === 'always')
        setDownloads((count) => count + 1)
      const project = {
        directory: options.outDir,
        title: `${options.subpath} starter`,
      }
      setProjects((items) =>
        items.some((item) => item.directory === project.directory)
          ? items.map((item) =>
              item.directory === project.directory ? project : item
            )
          : [...items, project]
      )
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }
  return (
    <div class="demo-workspace" data-demo="gittar">
      <div class="demo-toolbar">
        <p class="text-muted-foreground text-sm">
          Edit options for the local acme/starters template.
        </p>
        <Button
          size="md"
          variant="ghost"
          onClick={() => {
            try {
              setSource(
                JSON.stringify(
                  {
                    ...templateOptions(source()),
                    outDir: `./project-${projects().length + 1}`,
                  },
                  null,
                  2
                )
              )
            } catch {
              setSource(templateSource)
            }
          }}>
          Use a new destination
        </Button>
      </div>
      <DemoEditor
        filename="download.options.json"
        label="Edit template options"
        language="json"
        value={source()}
        onChange={setSource}
        height={170}
      />
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button size="md" onClick={copy}>
          Copy starter
        </Button>
        <p class="text-muted-foreground text-sm" role="status">
          Cache: {downloads()} simulated downloads · full web/ + api/ snapshot
        </p>
      </div>
      <Show when={error()}>
        <p class="text-danger mt-3 text-sm" role="status">
          {error()}
        </p>
      </Show>
      <div class="mt-5 grid max-h-80 gap-4 overflow-auto">
        <Index
          each={projects()}
          fallback={
            <p class="text-muted-foreground text-sm leading-6">
              Copy a starter, change its title, then use a new destination. The
              next copy starts from the unchanged cache.
            </p>
          }>
          {(project, index) => (
            <label class="grid gap-2 text-sm">
              <span class="font-mono">{project().directory}</span>
              <Input
                controlSize="md"
                aria-label={`Project ${index + 1} title`}
                value={project().title}
                maxLength={60}
                onInput={(event) => {
                  const title = event.currentTarget.value
                  setProjects((items) =>
                    items.map((item, i) =>
                      i === index ? { ...item, title } : item
                    )
                  )
                }}
              />
            </label>
          )}
        </Index>
      </div>
      <p class="text-muted-foreground mt-5 text-sm leading-6">
        Local filesystem model; no downloads or files written. Reusing a
        destination replaces that copy, as a real copy operation would.
      </p>
    </div>
  )
}

function CliDemo() {
  const [source, setSource] = createSignal(installSource)
  const plan = createMemo(() => {
    try {
      return { files: installPlan(source()) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  })
  return (
    <div class="demo-workspace" data-demo="cli">
      <div class="demo-toolbar">
        <p class="text-muted-foreground text-sm">
          Edit the command to change the install plan.
        </p>
        <div class="flex flex-wrap gap-1">
          <Button
            size="md"
            variant="ghost"
            onClick={() =>
              setSource('hulla ui add --framework react button dialog')
            }>
            Try React + dialog
          </Button>
          <Button
            size="md"
            variant="ghost"
            onClick={() => setSource(installSource)}>
            Reset
          </Button>
        </div>
      </div>
      <DemoEditor
        filename="Terminal"
        label="Edit install command"
        language="text"
        value={source()}
        onChange={setSource}
        height={90}
      />
      <div class="mt-5">
        <Show
          when={plan().files}
          fallback={
            <p class="text-danger text-sm leading-6" role="status">
              {plan().error}
            </p>
          }>
          {(files) => (
            <DemoEditor
              filename="Source entering your repository"
              label="Files to install"
              language="text"
              value={files().join('\n')}
              readOnly
              height={200}
            />
          )}
        </Show>
      </div>
      <p class="text-muted-foreground mt-5 text-sm leading-6">
        Install preview for button and dialog using default project paths.
        Registry support files are additional. No CLI command is run or files
        written.
      </p>
    </div>
  )
}

export default function PackageWorkflowDemo(props: {
  kind: 'control' | 'args' | 'gittar' | 'cli'
}) {
  return (
    <Switch>
      <Match when={props.kind === 'control'}>
        <ControlDemo />
      </Match>
      <Match when={props.kind === 'args'}>
        <ArgsDemo />
      </Match>
      <Match when={props.kind === 'gittar'}>
        <GittarDemo />
      </Match>
      <Match when={props.kind === 'cli'}>
        <CliDemo />
      </Match>
    </Switch>
  )
}
