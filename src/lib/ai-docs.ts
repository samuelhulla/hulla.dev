import { getCollection, type CollectionEntry } from 'astro:content'
import { apiDocs } from '@/data/docs'
import { renderMarkdownDocument } from '@/lib/docs-markdown'

export const SITE_ORIGIN = 'https://hulla.dev'

export type AiDoc = {
  pathname: `/docs${string}`
  markdownPathname: `/docs${string}.md`
  title: string
  description: string
  markdown: string
  section: string
  includeInCorpus: boolean
}

export async function loadAiDocs(): Promise<AiDoc[]> {
  const entries = await getCollection('docs')
  const contentDocs = new Map(
    entries.map((entry) => [pathnameForEntry(entry), contentDoc(entry)])
  )
  const ordered: AiDoc[] = [docsLanding(entries)]
  const used = new Set<string>()

  for (const group of apiDocs) {
    ordered.push({
      pathname: group.href,
      markdownPathname: `${group.href}.md`,
      title: group.title,
      description: group.description,
      section: 'Navigation',
      includeInCorpus: false,
      markdown: renderMarkdownDocument({
        title: group.title,
        description: group.description,
        body: group.entries
          .map(
            (entry) =>
              `- [${entry.title}](${SITE_ORIGIN}${entry.href}.md): ${entry.description}`
          )
          .join('\n'),
      }),
    })

    for (const metadata of group.entries) {
      const doc = contentDocs.get(metadata.href)
      if (!doc) continue
      ordered.push({ ...doc, section: group.title })
      used.add(doc.pathname)
    }
  }

  const remaining = [...contentDocs.values()]
    .filter((doc) => !used.has(doc.pathname))
    .sort((left, right) => left.pathname.localeCompare(right.pathname))
  ordered.push(...remaining)

  return ordered
}

export function renderLlmsTxt(docs: readonly AiDoc[]): string {
  const sections = new Map<string, AiDoc[]>()
  for (const doc of docs) {
    if (!doc.includeInCorpus) continue
    const sectionDocs = sections.get(doc.section) ?? []
    sectionDocs.push(doc)
    sections.set(doc.section, sectionDocs)
  }

  const index = [...sections]
    .map(
      ([section, sectionDocs]) =>
        `## ${section}\n\n${sectionDocs
          .map(
            (doc) =>
              `- [${doc.title}](${SITE_ORIGIN}${doc.markdownPathname}): ${doc.description}`
          )
          .join('\n')}`
    )
    .join('\n\n')

  return `# hulla.dev documentation

> Official documentation for the @hulla/* TypeScript package ecosystem.

Use the focused Markdown pages below for retrieval. Use the full corpus only when a tool needs all documentation in one context.

## Complete documentation

- [Full documentation corpus](${SITE_ORIGIN}/llms-full.txt): Every documentation page combined into one Markdown document
- [Documentation home](${SITE_ORIGIN}/docs.md): Package-level documentation index

${index}
`
}

export function renderLlmsFull(docs: readonly AiDoc[]): string {
  const pages = docs
    .filter((doc) => doc.includeInCorpus)
    .map((doc) => doc.markdown.replace(/^# /, '## ').trim())
    .join('\n\n---\n\n')

  return `# hulla.dev documentation

> Official documentation for the @hulla/* TypeScript package ecosystem.

This file is generated from the same MDX sources as hulla.dev. Prefer /llms.txt when you can retrieve only the pages relevant to a task.

${pages}
`
}

export function markdownResponse(doc: AiDoc): Response {
  return new Response(doc.markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${doc.pathname}>; rel="alternate"; type="text/html", </llms.txt>; rel="describedby"`,
    },
  })
}

function contentDoc(entry: CollectionEntry<'docs'>): AiDoc {
  const pathname = pathnameForEntry(entry)
  const section =
    pathname === '/docs/ui'
      ? '@hulla/ui'
      : pathname === '/docs/cli'
        ? 'hulla CLI'
        : 'Start here'

  return {
    pathname,
    markdownPathname: `${pathname}.md`,
    title: entry.data.title,
    description: entry.data.description,
    section,
    includeInCorpus: true,
    markdown: renderMarkdownDocument({
      ...entry.data,
      body: entry.body ?? '',
    }),
  }
}

function pathnameForEntry(entry: CollectionEntry<'docs'>): `/docs${string}` {
  return `/docs/${entry.id.replace(/\/index$/, '')}`
}

function docsLanding(entries: readonly CollectionEntry<'docs'>[]): AiDoc {
  const packages = entries
    .filter((entry) => ['api', 'ui', 'cli'].includes(entry.id))
    .sort(
      (left, right) =>
        ['api', 'ui', 'cli'].indexOf(left.id) -
        ['api', 'ui', 'cli'].indexOf(right.id)
    )

  return {
    pathname: '/docs',
    markdownPathname: '/docs.md',
    title: 'Documentation',
    description: 'Guides and references for the @hulla/* packages.',
    section: 'Navigation',
    includeInCorpus: false,
    markdown: renderMarkdownDocument({
      title: 'Documentation',
      description: 'Guides and references for the @hulla/* packages.',
      body: packages
        .map(
          (entry) =>
            `- [${entry.data.title}](${SITE_ORIGIN}${pathnameForEntry(entry)}.md): ${entry.data.description}`
        )
        .join('\n'),
    }),
  }
}
