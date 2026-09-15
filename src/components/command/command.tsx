import { createMutableRef, exposeRef, onMountEffect } from '@/lib/solid'
import { mergeProps, splitProps, type JSX } from 'solid-js'
import {
  COMMAND_SELECT_EVENT,
  connectCommand,
  type CommandSelectDetail,
} from '@/lib/command'
import { cn } from '@/lib/style'

export type CommandProps = Omit<JSX.IntrinsicElements['div'], 'onSelect'> & {
  filter?: boolean
  loop?: boolean
  onSelect?: (value: string) => void
}

export function Command(props: CommandProps) {
  const [local, rest] = splitProps(
    mergeProps({ filter: true, loop: true } as const, props),
    ['children', 'class', 'filter', 'loop', 'onSelect']
  )

  const elementRef = createMutableRef<HTMLDivElement>(null)
  exposeRef(rest.ref, () => elementRef.current as HTMLDivElement, [])
  onMountEffect(() => {
    const element = elementRef.current
    if (!element) return

    const controller = connectCommand(element)
    const handleSelect = (event: Event) => {
      local.onSelect?.((event as CustomEvent<CommandSelectDetail>).detail.value)
    }
    element.addEventListener(COMMAND_SELECT_EVENT, handleSelect)

    return () => {
      element.removeEventListener(COMMAND_SELECT_EVENT, handleSelect)
      controller.destroy()
    }
  })

  return (
    <div
      {...rest}
      ref={elementRef}
      data-filter={local.filter ? 'true' : 'false'}
      data-loop={local.loop ? 'true' : 'false'}
      data-slot="command"
      class={cn(
        'border-border bg-surface-raised text-foreground flex w-full min-w-0 flex-col overflow-hidden rounded-lg border shadow-(--shadow-raised)',
        local.class
      )}>
      {local.children}
    </div>
  )
}
