import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type KbdProps = JSX.IntrinsicElements['kbd']

export function Kbd(props: KbdProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <kbd
      {...rest}
      data-slot="kbd"
      class={cn(
        'border-border bg-surface-raised text-muted-foreground inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-sm border px-1.5 py-0.5 align-middle font-mono text-xs leading-none font-medium whitespace-nowrap shadow-[0_1px_0_var(--color-border)] select-none',
        local.class
      )}>
      {local.children}
    </kbd>
  )
}
