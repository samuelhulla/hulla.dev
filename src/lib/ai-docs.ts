import { getCollection, type CollectionEntry } from 'astro:content'
import { docGroups, docPackages, findDocPackage } from '@/data/docs'
import { guides } from '@/data/guides'
import { renderDocGroupMarkdown } from '@/lib/doc-group-markdown'
import { renderMarkdownDocument } from '@/lib/docs-markdown'

export const SITE_ORIGIN = 'https://hulla.dev'

export type AiDoc = {
  pathname: `/docs${string}` | `/guides${string}`
  markdownPathname: `/docs${string}.md` | `/guides${string}.md`
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

  for (const group of docGroups) {
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
        body: renderDocGroupMarkdown(group, SITE_ORIGIN),
      }),
    })

    for (const metadata of group.entries) {
      const doc = contentDocs.get(metadata.href)
      if (!doc) continue
      ordered.push({
        ...doc,
        section:
          findDocPackage(doc.pathname)?.kind === 'api'
            ? group.title
            : (findDocPackage(doc.pathname)?.title ?? group.title),
      })
      used.add(doc.pathname)
    }
  }

  const remaining = [...contentDocs.values()]
    .filter((doc) => !used.has(doc.pathname))
    .sort((left, right) => left.pathname.localeCompare(right.pathname))
  ordered.push(...remaining)

  ordered.push(guidesLanding())
  for (const entry of await getCollection('guides'))
    ordered.push(contentDoc(entry))
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
- [Guides](${SITE_ORIGIN}/guides.md): Follow-along projects

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

function contentDoc(
  entry: CollectionEntry<'docs'> | CollectionEntry<'guides'>
): AiDoc {
  const pathname = pathnameForEntry(entry)
  const section =
    entry.collection === 'guides'
      ? 'Guides'
      : (findDocPackage(pathname)?.title ?? 'Start here')

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

function pathnameForEntry(
  entry: CollectionEntry<'docs'> | CollectionEntry<'guides'>
): AiDoc['pathname'] {
  return `/${entry.collection}/${entry.id.replace(/\/index$/, '')}`
}

function docsLanding(entries: readonly CollectionEntry<'docs'>[]): AiDoc {
  const packages = docPackages.flatMap((pkg) => {
    const entry = entries.find((entry) => pathnameForEntry(entry) === pkg.href)
    return entry ? [entry] : []
  })

  return {
    pathname: '/docs',
    markdownPathname: '/docs.md',
    title: 'Documentation',
    description: 'Concepts and API references for the @hulla/* packages.',
    section: 'Navigation',
    includeInCorpus: false,
    markdown: renderMarkdownDocument({
      title: 'Documentation',
      description: 'Concepts and API references for the @hulla/* packages.',
      body:
        `Follow a [guide](${SITE_ORIGIN}/guides.md) to build a project, or look up a package below. Working with a coding agent? [Install package skills](${SITE_ORIGIN}/docs/cli/agent-skills.md).\n\n## Browse by package\n\n` +
        packages
          .map(
            (entry) =>
              `- [${entry.data.title}](${SITE_ORIGIN}${pathnameForEntry(entry)}.md): ${entry.data.description}`
          )
          .join('\n'),
    }),
  }
}

function guidesLanding(): AiDoc {
  const body = guides
    .map(
      (guide) =>
        `- [${guide.title}](${SITE_ORIGIN}${guide.href}.md): ${guide.description}`
    )
    .join('\n')
  return {
    pathname: '/guides',
    markdownPathname: '/guides.md',
    title: 'Guides',
    description: 'Build a small app while learning the @hulla/* packages.',
    section: 'Navigation',
    includeInCorpus: false,
    markdown: renderMarkdownDocument({
      title: 'Guides',
      description: 'Build a small app while learning the @hulla/* packages.',
      body,
    }),
  }
}
