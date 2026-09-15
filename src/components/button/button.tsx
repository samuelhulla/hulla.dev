import { vn, cn } from '@/lib/style'
import { mergeProps, splitProps, type JSX } from 'solid-js'

const $size = vn({
  sm: 'h-7 gap-1.5 rounded-[6px] px-2.5 text-xs [&>svg]:size-3.5',
  md: 'h-8 gap-1.5 rounded-[7px] px-3 text-sm [&>svg]:size-4',
  lg: 'h-9 gap-2 rounded-[8px] px-3 text-base [&>svg]:size-4.5',
})
const $variant = vn({
  primary:
    'border-primary bg-primary text-primary-foreground shadow-(--shadow-control) enabled:not-aria-disabled:active:shadow-none disabled:shadow-none aria-disabled:shadow-none enabled:hover:border-[color-mix(in_oklab,var(--color-primary)_84%,var(--color-foreground))] enabled:hover:bg-[color-mix(in_oklab,var(--color-primary)_84%,var(--color-foreground))] enabled:active:bg-[color-mix(in_oklab,var(--color-primary)_76%,var(--color-foreground))] dark:enabled:hover:border-[color-mix(in_oklab,var(--color-primary)_84%,var(--color-background))] dark:enabled:hover:bg-[color-mix(in_oklab,var(--color-primary)_84%,var(--color-background))] dark:enabled:active:bg-[color-mix(in_oklab,var(--color-primary)_76%,var(--color-background))]',
  secondary:
    'border-border bg-foreground/5 text-foreground shadow-none enabled:hover:border-foreground/20 enabled:hover:bg-foreground/10 enabled:active:bg-foreground/15 dark:enabled:bg-foreground/[0.12] dark:enabled:hover:bg-foreground/20 dark:enabled:active:bg-foreground/25',
  inverted:
    'border-foreground bg-foreground text-background shadow-(--shadow-control) enabled:not-aria-disabled:active:shadow-none disabled:shadow-none aria-disabled:shadow-none enabled:hover:border-foreground/80 enabled:hover:bg-foreground/80 enabled:active:bg-foreground/70',
  danger:
    'border-danger bg-danger text-on-emphasis shadow-(--shadow-control) enabled:not-aria-disabled:active:shadow-none disabled:shadow-none aria-disabled:shadow-none enabled:hover:border-[color-mix(in_oklab,var(--color-danger)_84%,var(--color-foreground))] enabled:hover:bg-[color-mix(in_oklab,var(--color-danger)_84%,var(--color-foreground))] enabled:active:bg-[color-mix(in_oklab,var(--color-danger)_76%,var(--color-foreground))] dark:shadow-none dark:enabled:border-danger/25 dark:enabled:bg-danger/15 dark:enabled:text-danger dark:enabled:hover:border-danger/40 dark:enabled:hover:bg-danger/[0.22] dark:enabled:active:bg-danger/25',
  ghost:
    'border-transparent bg-transparent text-muted-foreground shadow-none enabled:hover:bg-foreground/[0.08] enabled:hover:text-foreground enabled:active:bg-foreground/[0.12]',
  outline:
    'border-foreground/20 bg-transparent text-foreground shadow-none enabled:hover:border-foreground/40 enabled:hover:bg-foreground/[0.08] enabled:active:bg-foreground/[0.12]',
})

export type ButtonProps = JSX.IntrinsicElements['button'] & {
  size?: typeof $size.infer
  variant?: typeof $variant.infer
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(
    mergeProps(
      { size: 'md', type: 'button', variant: 'primary' } as const,
      props
    ),
    ['children', 'class', 'size', 'type', 'variant']
  )

  return (
    <button
      {...rest}
      type={local.type}
      class={cn(
        'focus-visible:outline-focus-ring disabled:border-disabled-border disabled:bg-disabled-surface disabled:text-disabled-foreground relative inline-flex shrink-0 items-center justify-center border leading-none font-medium tracking-[-0.01em] whitespace-nowrap antialiased transition-[background-color,border-color,color,translate] duration-120 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:shadow-none motion-safe:enabled:not-aria-disabled:active:translate-y-px motion-reduce:transition-none [&>svg]:shrink-0',
        $variant(local.variant),
        $size(local.size),
        local.class
      )}>
      {local.children}
    </button>
  )
}
