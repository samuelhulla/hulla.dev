import { mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'

export type CommandInputProps = JSX.IntrinsicElements['input'] & {
  icon?: JSX.Element
}

export function CommandInput(props: CommandInputProps) {
  const [local, rest] = splitProps(
    mergeProps(
      {
        autoComplete: 'off',
        placeholder: 'Type a command or search…',
        role: 'combobox',
        spellCheck: false,
        type: 'search',
      } as const,
      props
    ),
    [
      'autoComplete',
      'class',
      'icon',
      'placeholder',
      'role',
      'spellCheck',
      'type',
    ]
  )

  return (
    <div
      data-slot="command-input-wrapper"
      class="border-border flex h-12 shrink-0 items-center gap-3 border-b px-3.5">
      <span
        aria-hidden="true"
        data-slot="command-input-icon"
        class="text-muted-foreground flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
        {local.icon === undefined ? (
          <svg viewBox="0 0 16 16" fill="none">
            <circle
              cx="7"
              cy="7"
              r="4.25"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="m10.25 10.25 3 3"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.5"
            />
          </svg>
        ) : (
          local.icon
        )}
      </span>
      <input
        {...rest}
        aria-autocomplete="list"
        aria-expanded="true"
        autocomplete={local.autoComplete}
        placeholder={local.placeholder}
        role={local.role}
        spellcheck={local.spellCheck}
        type={local.type}
        data-slot="command-input"
        class={cn(
          'text-foreground caret-primary placeholder:text-muted-foreground disabled:text-muted-foreground h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm outline-none disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden',
          local.class
        )}
      />
    </div>
  )
}
