import { splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CodeBlockHeaderProps = JSX.IntrinsicElements['div']

export function CodeBlockHeader(props: CodeBlockHeaderProps) {
  const [local, rest] = splitProps(props, ['children', 'class'])

  return (
    <div
      {...rest}
      data-slot="code-block-header"
      class={cn(
        'border-border bg-surface [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:border-border [&:has(>[data-slot=tabs-list])>[data-slot=code-block-actions]]:border-border [&:has(>[data-slot=tabs-list])>[data-slot=code-block-actions]]:bg-surface flex min-h-9 min-w-0 items-center gap-3 border-b px-4 py-1.5 has-[>[data-slot=tabs-list]]:gap-0 has-[>[data-slot=tabs-list]]:p-0 [&:has(>[data-slot=tabs-list])>[data-slot=code-block-actions]]:z-10 [&:has(>[data-slot=tabs-list])>[data-slot=code-block-actions]]:ml-0 [&:has(>[data-slot=tabs-list])>[data-slot=code-block-actions]]:self-stretch [&:has(>[data-slot=tabs-list])>[data-slot=code-block-actions]]:border-l [&:has(>[data-slot=tabs-list])>[data-slot=code-block-actions]]:px-3 [&>[data-slot=tabs-list]]:h-9 [&>[data-slot=tabs-list]]:min-w-0 [&>[data-slot=tabs-list]]:flex-1 [&>[data-slot=tabs-list]]:items-stretch [&>[data-slot=tabs-list]]:gap-0 [&>[data-slot=tabs-list]]:border-b-0 [&>[data-slot=tabs-list]]:px-0 [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:h-full [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:min-h-0 [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:rounded-none [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:border-r [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:px-3 [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:py-1.5 [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:text-xs [&>[data-slot=tabs-list]>[data-slot=tabs-trigger]]:after:inset-x-0',
        local.class
      )}>
      {local.children}
    </div>
  )
}
