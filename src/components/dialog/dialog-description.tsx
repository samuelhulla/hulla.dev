import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type DialogDescriptionProps = JSX.IntrinsicElements['p']

export function DialogDescription(props: DialogDescriptionProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <p
      {...rest}
      data-slot="dialog-description"
      class={cn(
        'text-muted-foreground group-data-[variant=compact]/dialog:text-sm group-data-[variant=compact]/dialog:leading-6 group-data-[variant=fullscreen]/dialog:text-sm group-data-[variant=fullscreen]/dialog:leading-6 group-data-[variant=workspace]/dialog:text-xs group-data-[variant=workspace]/dialog:leading-5',
        local.class
      )}>
      {local.children}
    </p>
  )
}
