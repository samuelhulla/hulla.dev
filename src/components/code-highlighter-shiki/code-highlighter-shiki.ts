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

export async function createShikiCodeHighlighter({
  languages,
}: ShikiCodeHighlighterOptions) {
  const highlighter = await getSingletonHighlighter({
    langs: [...languages],
    themes: [theme],
  })

  return {
    highlight(
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
    },
  }
}
