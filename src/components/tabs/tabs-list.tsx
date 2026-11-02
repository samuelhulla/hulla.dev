import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type TabsListProps = JSX.IntrinsicElements['div']

export function TabsList(props: TabsListProps) {
  const [local, rest] = splitProps(
    mergeProps({ role: 'tablist' } as const, props),
    ['children', 'class', 'role']
  )

  return (
    <div
      {...rest}
      role={local.role}
      data-slot="tabs-list"
      class={cn(
        'group/tabs-list border-border relative flex w-full min-w-0 [scrollbar-width:none] items-end gap-1 overflow-x-auto border-b px-1 data-[orientation=vertical]:w-fit data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:overflow-visible data-[orientation=vertical]:border-r data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:px-0 data-[orientation=vertical]:py-1 [&::-webkit-scrollbar]:hidden',
        local.class
      )}>
      {local.children}
    </div>
  )
}
