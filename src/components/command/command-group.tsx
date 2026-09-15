import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CommandGroupProps = JSX.IntrinsicElements['div']

export function CommandGroup(props: CommandGroupProps) {
  const [local, rest] = splitProps(
    mergeProps({ role: 'group' } as const, props),
    ['children', 'class', 'role']
  )

  return (
    <div
      {...rest}
      role={local.role}
      data-slot="command-group"
      class={cn(
        'text-foreground [&+&]:border-border overflow-hidden py-0 [&+&]:mt-1.5 [&+&]:border-t [&+&]:pt-1.5',
        local.class
      )}>
      {local.children}
    </div>
  )
}
