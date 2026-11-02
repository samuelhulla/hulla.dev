import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type TabsTriggerProps = JSX.IntrinsicElements['button'] & {
  value: string
}

export function TabsTrigger(props: TabsTriggerProps) {
  const [local, rest] = splitProps(
    mergeProps({ role: 'tab', type: 'button' } as const, props),
    ['children', 'class', 'role', 'type', 'value']
  )

  return (
    <button
      {...rest}
      type={local.type}
      role={local.role}
      value={local.value}
      aria-selected="false"
      tabindex={-1}
      data-slot="tabs-trigger"
      data-value={local.value}
      class={cn(
        "text-muted-foreground after:bg-primary enabled:hover:bg-hover-surface enabled:hover:text-foreground focus-visible:outline-focus-ring enabled:data-[state=active]:bg-selected-surface enabled:data-[state=active]:hover:bg-selected-hover-surface enabled:data-[state=active]:text-primary-text disabled:text-disabled-foreground disabled:after:bg-disabled-foreground relative inline-flex min-h-10 flex-none items-center justify-center gap-2 rounded-t-sm border-0 bg-transparent px-3 py-2 text-sm leading-none font-medium tracking-[-0.01em] whitespace-nowrap transition-[background-color,color] duration-150 select-none group-data-[orientation=vertical]/tabs-list:w-full group-data-[orientation=vertical]/tabs-list:justify-start group-data-[orientation=vertical]/tabs-list:rounded-l-sm group-data-[orientation=vertical]/tabs-list:rounded-r-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:opacity-0 after:transition-[scale,opacity] after:duration-150 after:ease-out after:content-[''] group-data-[orientation=vertical]/tabs-list:after:inset-y-0 group-data-[orientation=vertical]/tabs-list:after:right-0 group-data-[orientation=vertical]/tabs-list:after:left-auto group-data-[orientation=vertical]/tabs-list:after:h-auto group-data-[orientation=vertical]/tabs-list:after:w-0.5 group-data-[orientation=vertical]/tabs-list:after:scale-x-100 group-data-[orientation=vertical]/tabs-list:after:scale-y-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed data-[state=active]:after:scale-x-100 data-[state=active]:after:opacity-100 group-data-[orientation=vertical]/tabs-list:data-[state=active]:after:scale-y-100 motion-reduce:transition-none motion-reduce:after:transition-none",
        local.class
      )}>
      {local.children}
    </button>
  )
}
