import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CodeProps = JSX.IntrinsicElements['code']

export function Code(props: CodeProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <code
      {...rest}
      data-slot="code"
      class={cn(
        'bg-foreground/5 text-foreground rounded-[0.25em] box-decoration-clone px-[0.25em] py-[0.125em] font-mono text-[0.875em] leading-[inherit] font-normal [overflow-wrap:anywhere]',
        local.class
      )}>
      {local.children}
    </code>
  )
}
