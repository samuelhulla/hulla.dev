import { cn } from '@/lib/style'
import { splitProps, type JSX } from 'solid-js'

export type BackdropProps = JSX.IntrinsicElements['div']

export function Backdrop(props: BackdropProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])
  return (
    <div
      {...rest}
      aria-hidden="true"
      data-slot="backdrop"
      class={cn(
        'bg-foreground/40 dark:bg-background/72 fixed inset-0 backdrop-blur-[3px] transition-[display,opacity] [transition-behavior:allow-discrete] duration-150 motion-reduce:backdrop-blur-none motion-reduce:transition-none dark:backdrop-blur-[8px] starting:opacity-0 [&[hidden]]:pointer-events-none [&[hidden]]:hidden [&[hidden]]:opacity-0',
        local.class
      )}>
      {local.children}
    </div>
  )
}
