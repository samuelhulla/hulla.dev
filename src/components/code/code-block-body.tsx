import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CodeBlockBodyProps = JSX.IntrinsicElements['div']

export function CodeBlockBody(props: CodeBlockBodyProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <div
      {...rest}
      data-slot="code-block-body"
      class={cn(
        'relative min-w-0 [&>[data-slot=code-block-actions]]:absolute [&>[data-slot=code-block-actions]]:top-2 [&>[data-slot=code-block-actions]]:right-2 [&>[data-slot=code-block-actions]]:z-10 [&>[data-slot=code-block-actions]]:ml-0',
        local.class
      )}>
      {local.children}
    </div>
  )
}
