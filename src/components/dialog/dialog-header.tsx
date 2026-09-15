import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type DialogHeaderProps = JSX.IntrinsicElements['div']

export function DialogHeader(props: DialogHeaderProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <div
      {...rest}
      data-slot="dialog-header"
      class={cn(
        'group-data-[variant=workspace]/dialog:border-border group-data-[variant=fullscreen]/dialog:border-border grid gap-1.5 text-left group-data-[variant=compact]/dialog:mb-5 group-data-[variant=fullscreen]/dialog:shrink-0 group-data-[variant=fullscreen]/dialog:border-b group-data-[variant=fullscreen]/dialog:px-5 group-data-[variant=fullscreen]/dialog:py-5 group-data-[variant=workspace]/dialog:shrink-0 group-data-[variant=workspace]/dialog:border-b group-data-[variant=workspace]/dialog:px-6 group-data-[variant=workspace]/dialog:py-4 sm:group-data-[variant=fullscreen]/dialog:px-8',
        local.class
      )}>
      {local.children}
    </div>
  )
}
