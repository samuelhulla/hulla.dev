import {
  createMutableRef,
  exposeRef,
  createLifecycleEffect,
  onMountEffect,
} from '@/lib/solid'
import { mergeProps, splitProps, type JSX } from 'solid-js'
import {
  connectTabs,
  TABS_VALUE_CHANGE_EVENT,
  type TabsController,
  type TabsValueChangeDetail,
} from '@/lib/tabs'
import { cn } from '@/lib/style'

export type TabsProps = Omit<JSX.IntrinsicElements['div'], 'defaultValue'> & {
  activationMode?: 'automatic' | 'manual'
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  value?: string
}

export function Tabs(props: TabsProps) {
  const [local, rest] = splitProps(
    mergeProps(
      { activationMode: 'automatic', orientation: 'horizontal' } as const,
      props
    ),
    [
      'activationMode',
      'children',
      'class',
      'defaultValue',
      'onValueChange',
      'orientation',
      'value',
    ]
  )

  const elementRef = createMutableRef<HTMLDivElement>(null)
  exposeRef(rest.ref, () => elementRef.current as HTMLDivElement, [])
  const controllerRef = createMutableRef<TabsController>(null)
  onMountEffect(() => {
    const element = elementRef.current
    if (!element) return

    const controller = connectTabs(element)
    controllerRef.current = controller

    const handleValueChange = (event: Event) => {
      const nextValue = (event as CustomEvent<TabsValueChangeDetail>).detail
        .value
      local.onValueChange?.(nextValue)

      if (local.value !== undefined) {
        queueMicrotask(() => controller.setValue(local.value ?? ''))
      }
    }

    element.addEventListener(TABS_VALUE_CHANGE_EVENT, handleValueChange)

    return () => {
      element.removeEventListener(TABS_VALUE_CHANGE_EVENT, handleValueChange)
      controller.destroy()
      controllerRef.current = null
    }
  })

  createLifecycleEffect(
    () => {
      const controller = controllerRef.current
      if (!controller) return
      controller.refresh()
      if (local.value !== undefined) controller.setValue(local.value)
    },
    () => [local.activationMode, local.orientation, local.value]
  )

  return (
    <div
      {...rest}
      ref={elementRef}
      data-activation-mode={local.activationMode}
      data-initial-value={local.value ?? local.defaultValue}
      data-orientation={local.orientation}
      data-slot="tabs"
      class={cn(
        'grid min-w-0 gap-4 data-[orientation=vertical]:grid-cols-[auto_minmax(0,1fr)] data-[orientation=vertical]:items-start',
        local.class
      )}>
      {local.children}
    </div>
  )
}
