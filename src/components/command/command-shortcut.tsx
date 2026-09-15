import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CommandShortcutProps = JSX.IntrinsicElements['span']

export function CommandShortcut(props: CommandShortcutProps) {
  const [local, rest] = splitProps(
    mergeProps({ 'aria-hidden': true } as const, props),
    ['children', 'class', 'aria-hidden']
  )

  return (
    <span
      {...rest}
      aria-hidden={local['aria-hidden']}
      data-slot="command-shortcut"
      class={cn(
        'text-muted-foreground group-data-[selected]/command-item:text-foreground/70 ml-auto pl-3 font-mono text-[0.625rem] tracking-[0.06em] whitespace-nowrap',
        local.class
      )}>
      {local.children}
    </span>
  )
}
