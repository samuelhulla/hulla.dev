import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type ButtonGroupProps = Omit<
  JSX.IntrinsicElements['div'],
  'children'
> & {
  children: JSX.Element
  orientation?: 'horizontal' | 'vertical'
}

export function ButtonGroup(props: ButtonGroupProps) {
  const [local, rest] = splitProps(
    mergeProps({ orientation: 'horizontal', role: 'group' } as const, props),
    ['children', 'class', 'orientation', 'role']
  )

  return (
    <div
      {...rest}
      role={local.role}
      data-slot="button-group"
      data-orientation={local.orientation}
      class={cn(
        'isolate inline-flex w-fit items-stretch data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col [&>*]:relative [&>*]:focus-visible:z-10 data-[orientation=horizontal]:[&>*:not(:first-child)]:-ml-px data-[orientation=horizontal]:[&>*:not(:first-child)]:rounded-l-none data-[orientation=vertical]:[&>*:not(:first-child)]:-mt-px data-[orientation=vertical]:[&>*:not(:first-child)]:rounded-t-none data-[orientation=horizontal]:[&>*:not(:last-child)]:rounded-r-none data-[orientation=vertical]:[&>*:not(:last-child)]:rounded-b-none [&>button]:active:scale-100',
        local.class
      )}>
      {local.children}
    </div>
  )
}
