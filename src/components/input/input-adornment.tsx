import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type InputAdornmentProps = JSX.IntrinsicElements['span']

export function InputAdornment(props: InputAdornmentProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <span
      {...rest}
      data-slot="input-adornment"
      class={cn(
        'text-muted-foreground inline-flex h-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap [&>svg]:size-[1em] [&>svg]:shrink-0',
        local.class
      )}>
      {local.children}
    </span>
  )
}
