export type HighlightedToken = {
  className?: string
  color?: string
  content: string
  fontStyle?: 'italic' | 'normal'
  fontWeight?: 'bold' | 'normal'
  textDecoration?: string
}

export type HighlightedLine = {
  deleted?: boolean
  error?: boolean
  focused?: boolean
  highlighted?: boolean
  inserted?: boolean
  tokens: HighlightedToken[]
  warning?: boolean
}

export type HighlightedCode = {
  code: string
  language: string
  lines: HighlightedLine[]
}

export type FlatHighlightToken = {
  className?: string
  content: string
}

export function tokensToHighlightedCode(
  code: string,
  language: string,
  tokens: readonly FlatHighlightToken[]
): HighlightedCode {
  const lines: HighlightedLine[] = [{ tokens: [] }]

  for (const token of tokens) {
    const parts = token.content.split('\n')

    parts.forEach((content, index) => {
      if (content) {
        lines.at(-1)?.tokens.push({
          className: token.className,
          content,
        })
      }

      if (index < parts.length - 1) lines.push({ tokens: [] })
    })
  }

  return { code, language, lines }
}

export function plainHighlightedCode(
  code: string,
  language = 'text'
): HighlightedCode {
  return tokensToHighlightedCode(code, language, [{ content: code }])
}

export function includesLine(
  lines: readonly number[] | undefined,
  line: number
): boolean {
  return lines?.includes(line) ?? false
}
