import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type DialogTitleProps = JSX.IntrinsicElements['h2']

export function DialogTitle(props: DialogTitleProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <h2
      {...rest}
      data-slot="dialog-title"
      class={cn(
        'font-semibold tracking-[-0.025em] group-data-[variant=compact]/dialog:text-lg group-data-[variant=compact]/dialog:leading-6 group-data-[variant=fullscreen]/dialog:text-xl group-data-[variant=fullscreen]/dialog:leading-7 group-data-[variant=workspace]/dialog:text-base group-data-[variant=workspace]/dialog:leading-6',
        local.class
      )}>
      {local.children}
    </h2>
  )
}
