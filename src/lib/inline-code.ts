export type InlineCodePart = {
  kind: 'code' | 'text'
  value: string
}

export function tokenizeInlineCode(value: string): InlineCodePart[] {
  const parts: InlineCodePart[] = []
  let cursor = 0

  for (const match of value.matchAll(/`([^`\n]+)`/g)) {
    const index = match.index
    if (index > cursor) {
      parts.push({ kind: 'text', value: value.slice(cursor, index) })
    }
    parts.push({ kind: 'code', value: match[1] ?? '' })
    cursor = index + match[0].length
  }

  if (cursor < value.length) {
    parts.push({ kind: 'text', value: value.slice(cursor) })
  }

  return parts
}

export function stripInlineCode(value: string): string {
  return tokenizeInlineCode(value)
    .map(({ value: part }) => part)
    .join('')
}
