import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type TabsContentProps = JSX.IntrinsicElements['div'] & {
  value: string
}

export function TabsContent(props: TabsContentProps) {
  const [local, rest] = splitProps(
    mergeProps({ role: 'tabpanel', tabIndex: 0 } as const, props),
    ['children', 'class', 'role', 'tabIndex', 'value']
  )

  return (
    <div
      {...rest}
      role={local.role}
      tabindex={local.tabIndex}
      hidden
      data-slot="tabs-content"
      data-value={local.value}
      class={cn(
        'text-foreground focus-visible:outline-focus-ring min-w-0 rounded-sm text-sm leading-6 transition-opacity duration-120 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none starting:opacity-0',
        local.class
      )}>
      {local.children}
    </div>
  )
}
