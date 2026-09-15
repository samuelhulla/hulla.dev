import { vn, cn } from '@/lib/style'
import { mergeProps, splitProps, type JSX } from 'solid-js'

const $size = vn({
  sm: 'h-8 rounded-sm px-2.5 text-[0.8125rem] [&[type=file]]:leading-[1.875rem] file:text-[0.8125rem]',
  md: 'h-10 rounded-md px-3 text-sm [&[type=file]]:leading-[2.375rem] file:text-sm',
  lg: 'h-12 rounded-md px-3.5 text-base [&[type=file]]:leading-[2.875rem] file:text-base',
})
const $variant = vn({
  outline:
    'border border-foreground/25 bg-surface shadow-[inset_0_1px_2px_oklch(0_0_0/0.025)] enabled:not-focus-visible:not-aria-invalid:hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-focus-ring/25 focus-visible:border-focus-ring enabled:aria-invalid:border-danger enabled:aria-invalid:hover:border-danger disabled:border-disabled-border disabled:bg-disabled-surface disabled:shadow-none',
  filled:
    'border border-transparent bg-foreground/[0.075] shadow-none enabled:not-focus-visible:not-aria-invalid:hover:bg-foreground/[0.12] focus-visible:ring-2 focus-visible:ring-focus-ring/25 focus-visible:border-focus-ring focus-visible:bg-surface enabled:aria-invalid:border-danger/65 enabled:aria-invalid:bg-danger/[0.055] disabled:border-disabled-border disabled:bg-disabled-surface disabled:shadow-none',
  underline:
    'rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none enabled:not-focus-visible:not-aria-invalid:hover:border-foreground/40 focus-visible:border-focus-ring focus-visible:shadow-[0_1px_0_var(--color-focus-ring)] enabled:aria-invalid:border-danger disabled:border-disabled-border disabled:bg-transparent disabled:shadow-none',
})

export type InputProps = JSX.IntrinsicElements['input'] & {
  controlSize?: typeof $size.infer
  variant?: typeof $variant.infer
}

export function Input(props: InputProps) {
  const [local, rest] = splitProps(
    mergeProps({ controlSize: 'md', variant: 'outline' } as const, props),
    ['class', 'controlSize', 'variant']
  )

  return (
    <input
      {...rest}
      data-control=""
      data-slot="control"
      class={cn(
        'text-foreground placeholder:text-muted-foreground file:text-foreground disabled:text-disabled-foreground disabled:placeholder:text-disabled-foreground enabled:aria-invalid:placeholder:text-danger/60 block w-full min-w-0 appearance-none antialiased transition-[background-color,border-color,box-shadow,color] duration-150 ease-out file:mr-3 file:border-0 file:bg-transparent file:p-0 file:leading-[inherit] file:font-medium focus-visible:outline-none disabled:cursor-not-allowed motion-reduce:transition-none',
        $size(local.controlSize),
        $variant(local.variant),
        local.class
      )}
    />
  )
}
