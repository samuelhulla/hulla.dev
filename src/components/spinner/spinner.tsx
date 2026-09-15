import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type SpinnerProps = JSX.IntrinsicElements['svg']

export function Spinner(props: SpinnerProps) {
  const [local, rest] = splitProps(
    mergeProps({ 'aria-hidden': true } as const, props),
    ['aria-hidden', 'children', 'class']
  )

  return (
    <svg
      {...rest}
      aria-hidden={local['aria-hidden']}
      viewBox="0 0 24 24"
      fill="none"
      data-slot="spinner"
      class={cn(
        'inline-block size-4 shrink-0 animate-spin align-[-0.125em] motion-reduce:animate-none',
        local.class
      )}>
      {local.children}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        stroke-width="2.25"
        opacity="0.2"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="currentColor"
        stroke-width="2.25"
        stroke-linecap="round"
      />
    </svg>
  )
}
