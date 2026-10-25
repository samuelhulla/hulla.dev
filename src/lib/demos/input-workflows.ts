import { err, ok, tcf, type Result } from '@hulla/control'
import { flag, option, parser, positional } from '@hulla/args'
import { z } from 'zod'

export function deploymentConfig(source: string): {
  result: Result<string, Error>
  steps: string[]
} {
  const steps = ['Parse JSON']
  const parsed = tcf({
    try: () => JSON.parse(source) as unknown,
    catch: () =>
      new Error('Invalid JSON. The deployment config could not be read.'),
  })
  if (parsed.isErr()) return { result: parsed, steps }
  steps.push('Validate config')
  const value = parsed.value
  if (
    typeof value !== 'object' ||
    value === null ||
    !('replicas' in value) ||
    typeof value.replicas !== 'number' ||
    !Number.isInteger(value.replicas) ||
    value.replicas < 1 ||
    value.replicas > 10
  ) {
    return {
      result: err(new Error('replicas must be an integer from 1 to 10.')),
      steps,
    }
  }
  steps.push('Build deployment plan')
  const replicas = value.replicas
  const result = ok(
    `${replicas} replica${replicas === 1 ? '' : 's'} ready for deployment`
  )
  return { result, steps }
}

const cli = parser({
  name: 'preview',
  arguments: [
    positional({
      name: 'project',
      schema: z
        .string()
        .regex(/^[a-z][a-z0-9-]*$/, 'Use a lowercase project slug'),
    }),
    option({ name: 'port', schema: z.coerce.number().int().min(1).max(65535) }),
    flag({ name: 'open' }),
  ],
  settings: { caseSensitive: true },
})

export function previewArguments(source: string) {
  try {
    // This field accepts individual whitespace-separated tokens, not shell syntax.
    const parsed = cli.parse(source.trim() ? source.trim().split(/\s+/) : [])
    if (!parsed.arguments.project.detected)
      return { error: 'Supply a project slug before starting the preview.' }
    const { project, port, open } = parsed.arguments
    return {
      values: {
        project: project.value,
        port: port.detected ? port.value : 3000,
        open: open.value,
      },
      metadata: {
        portDetected: port.detected,
        rawPort: port.raw ?? '(omitted)',
      },
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}
