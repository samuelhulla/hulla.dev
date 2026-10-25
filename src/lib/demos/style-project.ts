export const styleSource = `import { style } from '@hulla/style'
import { cn as mergeClasses } from 'cn'

const { cn, vn } = style({ composer: mergeClasses })

const $tone = vn({
  accent: 'text-primary-text',
  muted: 'text-muted-foreground',
})
const $space = vn({ compact: ['px-2', 'px-4'] })

export const compose = (extra = '') =>
  cn('py-2', $tone('accent'), $space('compact'), extra)

export const preview = {
  notice: compose(),
  activity: compose('font-semibold'),
  cell: compose('px-6'),
}

export const trace = {
  variant: $space('compact'),
  override: compose('px-6'),
}`

export type StyleOutput = {
  preview: Record<'notice' | 'activity' | 'cell', string>
  trace: Record<string, string>
  elapsed?: number
  characters?: number
}
