import { vn, cn } from '@/lib/style'
import { mergeProps, splitProps, type JSX } from 'solid-js'

const $size = vn({
  sm: 'h-8 rounded-sm text-[0.8125rem] [&>[data-slot=input-adornment]]:px-2.5 [&>[data-control]]:px-2.5',
  md: 'h-10 rounded-md text-sm [&>[data-slot=input-adornment]]:px-3 [&>[data-control]]:px-3',
  lg: 'h-12 rounded-md text-base [&>[data-slot=input-adornment]]:px-3.5 [&>[data-control]]:px-3.5',
})
const $variant = vn({
  outline:
    'border border-foreground/25 bg-surface shadow-[inset_0_1px_2px_oklch(0_0_0/0.025)] has-[[data-control]:enabled]:not-focus-within:not-has-[[data-control][aria-invalid=true]:enabled]:hover:border-foreground/40 focus-within:ring-2 focus-within:ring-focus-ring/25 focus-within:border-focus-ring has-[[data-control][aria-invalid=true]:enabled]:border-danger',
  filled:
    'border border-transparent bg-foreground/[0.075] shadow-none has-[[data-control]:enabled]:not-focus-within:not-has-[[data-control][aria-invalid=true]:enabled]:hover:bg-foreground/[0.12] focus-within:ring-2 focus-within:ring-focus-ring/25 focus-within:border-focus-ring focus-within:bg-surface has-[[data-control][aria-invalid=true]:enabled]:border-danger/65 has-[[data-control][aria-invalid=true]:enabled]:bg-danger/[0.055]',
  underline:
    'rounded-none border-0 border-b border-border bg-transparent shadow-none has-[[data-control]:enabled]:not-focus-within:not-has-[[data-control][aria-invalid=true]:enabled]:hover:border-foreground/40 focus-within:border-focus-ring focus-within:shadow-[0_1px_0_var(--color-focus-ring)] has-[[data-control][aria-invalid=true]:enabled]:border-danger',
})

export type InputGroupProps = Omit<JSX.IntrinsicElements['div'], 'children'> & {
  children: JSX.Element
  controlSize?: typeof $size.infer
  variant?: typeof $variant.infer
}

export function InputGroup(props: InputGroupProps) {
  const [local, rest] = splitProps(
    mergeProps({ controlSize: 'md', variant: 'outline' } as const, props),
    ['children', 'class', 'controlSize', 'variant']
  )

  return (
    <div
      {...rest}
      data-slot="input-group"
      class={cn(
        'group/input-group text-foreground has-[[data-control]:disabled]:bg-disabled-surface has-[[data-control]:disabled]:border-disabled-border has-[[data-control]:disabled]:[&>[data-slot=input-adornment]]:text-disabled-foreground flex w-full min-w-0 items-center overflow-hidden antialiased transition-[background-color,border-color,box-shadow,color] duration-150 ease-out has-[[data-control]:disabled]:cursor-not-allowed has-[[data-control]:disabled]:shadow-none motion-reduce:transition-none [&>[data-control]]:h-full [&>[data-control]]:flex-1 [&>[data-control]]:rounded-none [&>[data-control]]:border-0 [&>[data-control]]:bg-transparent [&>[data-control]]:shadow-none [&>[data-control]]:focus-visible:border-0 [&>[data-control]]:focus-visible:bg-transparent [&>[data-control]]:focus-visible:ring-0 [&>[data-control]:disabled]:opacity-100 [&>[data-control]:enabled:not(:focus-visible):not([aria-invalid=true])]:hover:border-0 [&>[data-control]:enabled:not(:focus-visible):not([aria-invalid=true])]:hover:bg-transparent [&>[data-control]:has(+[data-slot=input-adornment])]:pr-0 [&>[data-slot=input-adornment]+[data-control]]:pl-0',
        $size(local.controlSize),
        $variant(local.variant),
        local.class
      )}>
      {local.children}
    </div>
  )
}
