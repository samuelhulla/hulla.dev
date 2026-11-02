import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CodeBlockActionsProps = JSX.IntrinsicElements['div'] & {
  /** Reveal on pointer hover or keyboard focus; always visible on touch devices. */
  revealOnHover?: boolean
}

export function CodeBlockActions(props: CodeBlockActionsProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'revealOnHover',
  ])

  return (
    <div
      {...rest}
      data-slot="code-block-actions"
      data-reveal-on-hover={local.revealOnHover || undefined}
      class={cn(
        'ml-auto flex shrink-0 items-center gap-1.5 group-focus-within/code-block:data-[reveal-on-hover]:opacity-100 group-hover/code-block:data-[reveal-on-hover]:opacity-100 [&_[data-copied-icon]]:scale-75 [&_[data-copied-icon]]:opacity-0 [&_[data-copied]_[data-copied-icon]]:scale-100 [&_[data-copied]_[data-copied-icon]]:opacity-100 [&_[data-copied]_[data-copy-icon]]:scale-75 [&_[data-copied]_[data-copy-icon]]:opacity-0 [&_[data-copy-icon]]:scale-100 [&_[data-copy-icon]]:opacity-100 [&_[data-slot=code-copy-feedback]]:relative [&_[data-slot=code-copy-feedback]]:block [&_[data-slot=code-copy-feedback]]:size-3.5 [&_[data-slot=code-copy-feedback]>svg]:absolute [&_[data-slot=code-copy-feedback]>svg]:inset-0 [&_[data-slot=code-copy-feedback]>svg]:size-full [&_[data-slot=code-copy-feedback]>svg]:transition-[opacity,transform] [&_[data-slot=code-copy-feedback]>svg]:duration-150 motion-reduce:[&_[data-slot=code-copy-feedback]>svg]:transition-none [@media(hover:hover)_and_(pointer:fine)]:data-[reveal-on-hover]:opacity-0',
        local.class
      )}>
      {local.children}
    </div>
  )
}
