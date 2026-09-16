import { describe, expect, test } from 'bun:test'
import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { apiCoverage } from '../src/data/api-coverage'
import { apiDocs, flatApiDocs } from '../src/data/docs'
import { remarkDocsCode } from '../src/lib/remark-docs-code'
import {
  cleanMdxForAgents,
  renderMarkdownDocument,
} from '../src/lib/docs-markdown'
import { stripInlineCode, tokenizeInlineCode } from '../src/lib/inline-code'
const root = join(import.meta.dir, '..')
describe('documentation integrity', () => {
  test('metadata strips Markdown while descriptions retain code semantics', () => {
    const source = 'Use the `hulla` CLI.'
    expect(stripInlineCode(source)).toBe('Use the hulla CLI.')
    expect(tokenizeInlineCode(source)).toEqual([
      { kind: 'text', value: 'Use the ' },
      { kind: 'code', value: 'hulla' },
      { kind: 'text', value: ' CLI.' },
    ])
  })
  test('every documented route has a collection entry and a shared route renderer', async () => {
    await access(join(root, 'src/pages/docs/[...slug].astro'))
    for (const entry of flatApiDocs) {
      const suffix = entry.href.slice('/docs/api'.length)
      await access(
        join(
          root,
          'src/content/docs/api',
          suffix ? `${suffix}.mdx` : 'index.mdx'
        )
      )
    }
    expect(new Set(apiDocs.map((group) => group.href)).size).toBe(
      apiDocs.length
    )
  })
  test('coverage destinations exist and exports are unique per entrypoint', () => {
    const routes = new Set(flatApiDocs.map((entry) => entry.href))
    const seen = new Set<string>()
    for (const item of apiCoverage) {
      expect(routes.has(item.page)).toBe(true)
      for (const name of item.exports) {
        const key = `${item.entrypoint}:${name}`
        expect(seen.has(key)).toBe(false)
        seen.add(key)
      }
    }
  })
  test('fenced code preserves source and language, including JSX-sensitive characters', () => {
    type Tree = Parameters<ReturnType<typeof remarkDocsCode>>[0]
    const source = '  const value = `<tag>${input} & "text"`\n    return value'
    const tree: Tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'code',
              lang: 'ts',
              meta: 'filename="example.ts"',
              value: source,
            },
          ],
        },
      ],
    }
    remarkDocsCode()(tree)
    const node = tree.children?.[1]?.children?.[0]
    expect(node?.type).toBe('mdxJsxFlowElement')
    expect(node?.attributes).toEqual([
      { type: 'mdxJsxAttribute', name: 'code', value: source },
      { type: 'mdxJsxAttribute', name: 'language', value: 'ts' },
      { type: 'mdxJsxAttribute', name: 'filename', value: 'example.ts' },
    ])
    expect(tree.children?.[0]?.type).toBe('mdxjsEsm')
  })
  test('documents without fences do not gain an unnecessary component import', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
      ],
    }
    const before = structuredClone(tree)
    remarkDocsCode()(tree)
    expect(tree).toEqual(before)
  })
  test('AI Markdown removes presentation-only MDX and targets Markdown siblings', () => {
    const output = renderMarkdownDocument({
      title: 'Example',
      description: 'Machine-readable documentation.',
      usefulFor: ['Testing AI navigation.'],
      body: `import DocsPackageManagerCommand from '@/component.astro'

Read the [guide](/docs/api/quick-start).

<DocsPackageManagerCommand commands={{ bun: 'bun add example' }} />`,
    })

    expect(output).toContain('# Example')
    expect(output).toContain('https://hulla.dev/docs/api/quick-start.md')
    expect(output).toContain('```sh\nbun add example\n```')
    expect(output).not.toContain('import DocsPackageManagerCommand')
    expect(output).not.toContain('<DocsPackageManagerCommand')
  })
  test('AI Markdown fails loudly when a visual component lacks a fallback', () => {
    expect(() => cleanMdxForAgents('<NewDiagram />')).toThrow(
      'Add an AI Markdown fallback for the NewDiagram MDX component.'
    )
  })
  test('site styles do not target shared component parts or descendants of prose containers', async () => {
    const css = await readFile(join(root, 'src/styles/site.css'), 'utf8')
    expect(css).not.toContain('[data-slot')
    expect(css).not.toMatch(/\.docs-content\s+[^,{]+\{/)
    expect(css).not.toMatch(/\.md-(?:p|blockquote|li)\s+[^,{]+\{/)
  })
})
