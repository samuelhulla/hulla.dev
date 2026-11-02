import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CodeBlockProps = JSX.IntrinsicElements['div']

export function CodeBlock(props: CodeBlockProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <div
      {...rest}
      data-slot="code-block"
      class={cn(
        'group/code-block border-border bg-surface-raised text-foreground min-w-0 overflow-hidden rounded-md border shadow-sm',
        local.class
      )}>
      {local.children}
    </div>
  )
}
