import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CodeBlockTitleProps = JSX.IntrinsicElements['div']

export function CodeBlockTitle(props: CodeBlockTitleProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <div
      {...rest}
      data-slot="code-block-title"
      class={cn(
        'text-foreground min-w-0 truncate font-mono text-xs font-medium tracking-[-0.01em]',
        local.class
      )}>
      {local.children}
    </div>
  )
}
