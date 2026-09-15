import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CommandListProps = JSX.IntrinsicElements['div']

export function CommandList(props: CommandListProps) {
  const [local, rest] = splitProps(
    mergeProps({ role: 'listbox' } as const, props),
    ['children', 'class', 'role']
  )

  return (
    <div
      {...rest}
      role={local.role}
      data-slot="command-list"
      class={cn(
        'max-h-72 overflow-x-hidden overflow-y-auto overscroll-contain p-1.5',
        local.class
      )}>
      {local.children}
    </div>
  )
}
