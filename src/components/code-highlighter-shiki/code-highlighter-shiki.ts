import {
  createCssVariablesTheme,
  getSingletonHighlighter,
  type BundledLanguage,
  type ThemedToken,
} from 'shiki'
import type { HighlightedCode, HighlightedToken } from '../code/code-highlight'

const themeName = 'hulla-code'
const theme = createCssVariablesTheme({
  name: themeName,
  variablePrefix: '--hulla-code-',
  fontStyle: true,
})

export type ShikiCodeHighlighterOptions = {
  languages: readonly BundledLanguage[]
}

export type ShikiHighlightOptions = {
  language: BundledLanguage
}

type DiffLine = {
  body: string
  kind: 'context' | 'deleted' | 'inserted' | 'metadata'
  marker: string
}

function normalizeToken(token: ThemedToken): HighlightedToken {
  const fontStyle = token.fontStyle ?? 0
  const decorations = [
    fontStyle & 4 ? 'underline' : '',
    fontStyle & 8 ? 'line-through' : '',
  ].filter(Boolean)

  return {
    color: token.color,
    content: token.content,
    fontStyle: fontStyle & 1 ? 'italic' : undefined,
    fontWeight: fontStyle & 2 ? 'bold' : undefined,
    textDecoration: decorations.length ? decorations.join(' ') : undefined,
  }
}

function parseDiffLine(line: string): DiffLine {
  if (
    line.startsWith('+++') ||
    line.startsWith('---') ||
    line.startsWith('@@') ||
    line.startsWith('diff ') ||
    line.startsWith('index ')
  ) {
    return { body: line, kind: 'metadata', marker: '' }
  }

  if (line.startsWith('+'))
    return { body: line.slice(1), kind: 'inserted', marker: '+' }
  if (line.startsWith('-'))
    return { body: line.slice(1), kind: 'deleted', marker: '-' }
  if (line.startsWith(' '))
    return { body: line.slice(1), kind: 'context', marker: ' ' }

  return { body: line, kind: 'context', marker: '' }
}

export async function createShikiCodeHighlighter({
  languages,
}: ShikiCodeHighlighterOptions) {
  const highlighter = await getSingletonHighlighter({
    langs: [...languages],
    themes: [theme],
  })

  function highlight(
    code: string,
    { language }: ShikiHighlightOptions
  ): HighlightedCode {
    const result = highlighter.codeToTokens(code, {
      lang: language,
      theme: themeName,
    })

    return {
      code,
      language,
      lines: result.tokens.map((line) => ({
        tokens: line.map(normalizeToken),
      })),
    }
  }

  return {
    highlight,
    highlightDiff(
      code: string,
      { language }: ShikiHighlightOptions
    ): HighlightedCode {
      const lines = code.split('\n').map(parseDiffLine)
      const oldLineIndexes: number[] = []
      const newLineIndexes: number[] = []

      lines.forEach((line, index) => {
        if (line.kind !== 'inserted' && line.kind !== 'metadata')
          oldLineIndexes.push(index)
        if (line.kind !== 'deleted' && line.kind !== 'metadata')
          newLineIndexes.push(index)
      })

      const oldCode = highlight(
        oldLineIndexes.map((index) => lines[index]!.body).join('\n'),
        { language }
      )
      const newCode = highlight(
        newLineIndexes.map((index) => lines[index]!.body).join('\n'),
        { language }
      )
      const oldTokens = new Map(
        oldLineIndexes.map((index, position) => [
          index,
          oldCode.lines[position]?.tokens ?? [],
        ])
      )
      const newTokens = new Map(
        newLineIndexes.map((index, position) => [
          index,
          newCode.lines[position]?.tokens ?? [],
        ])
      )

      return {
        code,
        language: 'diff',
        lines: lines.map((line, index) => {
          if (line.kind === 'metadata')
            return { tokens: [{ content: line.body }] }

          const marker = line.marker
            ? [
                {
                  color:
                    line.kind === 'inserted'
                      ? 'var(--color-success)'
                      : line.kind === 'deleted'
                        ? 'var(--color-danger)'
                        : undefined,
                  content: line.marker,
                  fontWeight:
                    line.kind === 'inserted' || line.kind === 'deleted'
                      ? ('bold' as const)
                      : undefined,
                },
              ]
            : []
          const tokens =
            line.kind === 'deleted'
              ? oldTokens.get(index)
              : newTokens.get(index)

          return {
            deleted: line.kind === 'deleted' || undefined,
            inserted: line.kind === 'inserted' || undefined,
            tokens: [...marker, ...(tokens ?? [])],
          }
        }),
      }
    },
  }
}
