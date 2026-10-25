import { transform } from 'sucrase'
import * as styleModule from '@hulla/style'
import * as mergeModule from 'cn'
import type { StyleOutput } from './style-project'

// Only imported by a disposable worker and the regression tests, never the UI.
export function evaluateStyle(source: string, benchmark = false): StyleOutput {
  const { code } = transform(source, {
    transforms: ['typescript', 'imports'],
    filePath: 'style.ts',
  })
  const exports: Record<string, unknown> = {}
  const modules: Record<string, unknown> = {
    '@hulla/style': styleModule,
    cn: mergeModule,
  }
  const require = (name: string) => {
    if (!Object.hasOwn(modules, name))
      throw new Error(
        `This playground supports @hulla/style and cn imports. Unknown module: ${name}`
      )
    return modules[name]
  }
  new Function('require', 'exports', code)(require, exports)
  const preview = exports.preview as Record<string, unknown> | undefined
  if (
    !preview ||
    !['notice', 'activity', 'cell'].every(
      (key) => typeof preview[key] === 'string'
    )
  )
    throw new Error(
      'Export preview with notice, activity, and cell class strings.'
    )
  const result: StyleOutput = {
    preview: {
      notice: String(preview.notice).slice(0, 2000),
      activity: String(preview.activity).slice(0, 2000),
      cell: String(preview.cell).slice(0, 2000),
    },
    trace: Object.fromEntries(
      Object.entries((exports.trace ?? {}) as object)
        .filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string'
        )
        .slice(0, 6)
        .map(([key, value]) => [key.slice(0, 80), value.slice(0, 2000)])
    ),
  }
  if (benchmark) {
    if (typeof exports.compose !== 'function')
      throw new Error('Export a compose() function to measure compositions.')
    const start = performance.now()
    let characters = 0
    for (let i = 0; i < 10000; i++)
      characters += String(exports.compose(i % 2 ? 'font-semibold' : '')).length
    result.elapsed = performance.now() - start
    result.characters = characters
  }
  return result
}
