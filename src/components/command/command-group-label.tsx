import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CommandGroupLabelProps = JSX.IntrinsicElements['div']

export function CommandGroupLabel(props: CommandGroupLabelProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <div
      {...rest}
      data-slot="command-group-label"
      class={cn(
        'text-muted-foreground px-2 pt-1 pb-1.5 font-mono text-[0.625rem] font-medium tracking-[0.08em] uppercase',
        local.class
      )}>
      {local.children}
    </div>
  )
}
