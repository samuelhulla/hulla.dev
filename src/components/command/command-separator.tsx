import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CommandSeparatorProps = JSX.IntrinsicElements['hr']

export function CommandSeparator(props: CommandSeparatorProps) {
  const [local, rest] = splitProps(props, ['class'])

  return (
    <hr
      {...rest}
      data-slot="command-separator"
      class={cn('bg-border mx-0 my-1.5 h-px border-0', local.class)}
    />
  )
}
