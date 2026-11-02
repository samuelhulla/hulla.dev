import { createMemo, For, mergeProps, splitProps, type JSX } from 'solid-js'
import { cn } from '@/lib/style'
import {
  includesLine,
  plainHighlightedCode,
  type HighlightedCode,
  type HighlightedToken,
} from './code-highlight'

export type CodeBlockContentProps = Omit<
  JSX.IntrinsicElements['pre'],
  'children'
> & {
  children?: JSX.Element
  code?: string
  deletedLines?: readonly number[]
  errorLines?: readonly number[]
  focusedLines?: readonly number[]
  highlighted?: HighlightedCode
  highlightedLines?: readonly number[]
  insertedLines?: readonly number[]
  language?: string
  lineNumbers?: boolean
  startLine?: number
  warningLines?: readonly number[]
  wrap?: boolean
}

function tokenStyle(token: HighlightedToken): JSX.CSSProperties {
  return {
    color: token.color,
    'font-style': token.fontStyle,
    'font-weight': token.fontWeight,
    'text-decoration': token.textDecoration,
  }
}

export function CodeBlockContent(props: CodeBlockContentProps) {
  const [local, rest] = splitProps(
    mergeProps(
      { lineNumbers: false, startLine: 1, tabIndex: 0, wrap: false } as const,
      props
    ),
    [
      'children',
      'class',
      'code',
      'deletedLines',
      'errorLines',
      'focusedLines',
      'highlighted',
      'highlightedLines',
      'insertedLines',
      'language',
      'lineNumbers',
      'startLine',
      'tabIndex',
      'warningLines',
      'wrap',
    ]
  )

  const result = createMemo(
    () =>
      local.highlighted ??
      (local.code !== undefined
        ? plainHighlightedCode(local.code, local.language)
        : undefined)
  )

  return (
    <pre
      {...rest}
      tabindex={local.tabIndex}
      data-language={local.language ?? result()?.language}
      data-line-numbers={local.lineNumbers || undefined}
      data-slot="code-block-content"
      data-wrap={local.wrap || undefined}
      class={cn(
        'group/code-content focus-visible:outline-focus-ring m-0 min-w-0 overflow-auto bg-[var(--hulla-code-background)] py-4 font-mono text-[0.8125rem] leading-6 [tab-size:2] text-[var(--hulla-code-foreground)] focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
        local.wrap ? 'break-words whitespace-pre-wrap' : 'whitespace-pre',
        local.class
      )}>
      <code data-slot="code-block-code">
        {result() ? (
          <For each={result()!.lines}>
            {(sourceLine, index) => {
              const line = () => local.startLine + index()
              const isHighlighted =
                sourceLine.highlighted ||
                includesLine(local.highlightedLines, line())
              const isInserted =
                sourceLine.inserted || includesLine(local.insertedLines, line())
              const isDeleted =
                sourceLine.deleted || includesLine(local.deletedLines, line())
              const isFocused =
                sourceLine.focused || includesLine(local.focusedLines, line())
              const isError =
                sourceLine.error || includesLine(local.errorLines, line())
              const isWarning =
                sourceLine.warning || includesLine(local.warningLines, line())

              return (
                <span>
                  <span
                    data-code-line=""
                    data-line={line()}
                    data-highlighted={isHighlighted || undefined}
                    data-inserted={isInserted || undefined}
                    data-deleted={isDeleted || undefined}
                    data-focused={isFocused || undefined}
                    data-error={isError || undefined}
                    data-warning={isWarning || undefined}
                    class="data-[highlighted]:border-primary/70 data-[highlighted]:bg-primary/5 data-[inserted]:border-success data-[inserted]:bg-success/8 data-[deleted]:border-danger data-[deleted]:bg-danger/8 data-[error]:border-danger data-[error]:bg-danger/10 data-[warning]:border-warning data-[warning]:bg-warning/10 relative inline-block min-h-6 min-w-full border-l-2 border-transparent px-4 group-has-[[data-focused]]/code-content:opacity-70 group-has-[[data-focused]]/code-content:data-[focused]:opacity-100">
                    <For each={sourceLine.tokens}>
                      {(token) => (
                        <span class={token.className} style={tokenStyle(token)}>
                          {token.content}
                        </span>
                      )}
                    </For>
                  </span>
                  {index() < result()!.lines.length - 1 ? '\n' : null}
                </span>
              )
            }}
          </For>
        ) : (
          local.children
        )}
      </code>
    </pre>
  )
}
