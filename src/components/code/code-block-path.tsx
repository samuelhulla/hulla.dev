import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CodeBlockPathProps = JSX.IntrinsicElements['div']

export function CodeBlockPath(props: CodeBlockPathProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <div
      {...rest}
      data-slot="code-block-path"
      class={cn(
        'border-border bg-surface text-muted-foreground flex min-h-8 min-w-0 items-center gap-3 border-b px-4 py-1.5 font-mono text-[0.6875rem]',
        local.class
      )}>
      {local.children}
    </div>
  )
}
