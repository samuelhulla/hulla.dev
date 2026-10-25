import type {
  Code,
  Heading,
  InlineCode,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  Strong,
  Text,
} from 'mdast'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { packagePreviews } from '@/data/package-previews'

const DOCS_ORIGIN = 'https://hulla.dev'

type MarkdownNode = RootContent | PhrasingContent

type LooseNode = {
  type: string
  name?: string | null
  value?: string
  url?: string
  ordered?: boolean | null
  spread?: boolean | null
  attributes?: unknown[]
  children?: LooseNode[]
}

type MdxAttribute = {
  type: string
  name?: string
  value?: string | { data?: { estree?: unknown } }
}

export type MarkdownDocument = {
  title: string
  description: string
  usefulFor?: readonly string[]
  tutorial?: {
    outcome: string
    prerequisites: { title: string; href?: string }[]
  }
  body: string
}

export function renderMarkdownDocument({
  title,
  description,
  usefulFor = [],
  tutorial,
  body,
}: MarkdownDocument): string {
  const sections = [
    `# ${title}`,
    `> ${description}`,
    usefulFor.length
      ? `## Useful when\n\n${usefulFor.map((item) => `- ${item}`).join('\n')}`
      : '',
    tutorial
      ? `## What you'll build\n\n${tutorial.outcome}\n\n### Before you start\n\n${tutorial.prerequisites.map((item) => `- ${item.href ? `[${item.title}](${markdownDocsUrl(item.href)})` : item.title}`).join('\n')}`
      : '',
    cleanMdxForAgents(body),
  ]

  return `${sections.filter(Boolean).join('\n\n').trim()}\n`
}

export function cleanMdxForAgents(source: string): string {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .use(remarkStringify, {
      bullet: '-',
      fences: true,
      listItemIndent: 'one',
    })
  const tree = processor.parse(source) as Root & LooseNode

  tree.children = transformChildren(tree.children ?? []) as RootContent[]

  return processor.stringify(tree).trim()
}

function transformChildren(children: readonly LooseNode[]): LooseNode[] {
  return children.flatMap((node): LooseNode[] => {
    if (node.type === 'mdxjsEsm') return []

    if (node.type === 'blockquote') {
      const first = node.children?.[0]?.children?.[0]
      const marker =
        first?.type === 'text'
          ? first.value?.match(
              /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|SUCCESS)\](?: ([^\n]+))?(?:\n|$)/
            )
          : undefined
      if (marker && first) {
        first.value = first.value!.slice(marker[0].length)
        const kind = marker[1]!.toLowerCase()
        const label = kind[0]!.toUpperCase() + kind.slice(1)
        return [
          {
            type: 'blockquote',
            children: [
              paragraph([
                strong([text(`${label}${marker[2] ? `: ${marker[2]}` : ''}`)]),
              ]),
              ...transformChildren(node.children ?? []),
            ],
          },
        ]
      }
    }

    if (node.type === 'mdxJsxFlowElement') {
      return renderFlowComponent(node)
    }

    if (node.type === 'mdxJsxTextElement') {
      if (node.name === 'code') {
        return [inlineCode(componentText(node))]
      }
      if (node.name === 'StepperIndicator') return []
      if (node.name === 'StepperDescription') {
        return [text(componentText(node))]
      }
      if (node.name === 'DocsStepperHeading') {
        return [strong([text(componentText(node))])]
      }
      if (node.name === 'CollapsibleTrigger') {
        return [strong([text(componentText(node))])]
      }
      if (node.name === 'StepperContent') return stepperContent(node)
      if (node.name && /^[A-Z]/.test(node.name)) {
        throw new Error(
          `Add an AI Markdown fallback for the ${node.name} MDX component.`
        )
      }
      return transformChildren(node.children ?? [])
    }

    if (
      node.type === 'mdxFlowExpression' ||
      node.type === 'mdxTextExpression'
    ) {
      return node.value ? [text(node.value)] : []
    }

    if (node.type === 'link' && node.url) {
      node.url = markdownDocsUrl(node.url)
    }

    if (node.children) {
      node.children = transformChildren(node.children)
      if (
        node.children.length === 0 &&
        ['paragraph', 'blockquote', 'listItem', 'list'].includes(node.type)
      ) {
        return []
      }
    }

    return [node]
  })
}

function renderFlowComponent(node: LooseNode): LooseNode[] {
  const name = node.name ?? ''

  switch (name) {
    case 'Alert':
      return alert(node)
    case 'DocsPackageManagerCommand':
      return packageManagerCommands(node)
    case 'DocsCodeDiff':
      return codeDiff(node)
    case 'DocsLanguageTabs':
      return docsLanguageTabs(node)
    case 'DocsGuideLinks':
      return guideLinks(node)
    case 'DocsConceptFlow':
      return conceptFlow(node)
    case 'DocsContractPath':
      return contractPath()
    case 'DocsProjectBoundary':
      return projectBoundary()
    case 'DocsApiArchitecture':
      return apiArchitecture()
    case 'PackageDemoFrame':
      return packageDemo(node)
    case 'Stepper':
    case 'StepperItem':
    case 'StepperPanel':
    case 'Collapsible':
    case 'CollapsibleContent':
      return transformChildren(node.children ?? [])
    case 'CollapsibleTrigger':
      return [paragraph([strong([text(componentText(node))])])]
    case 'StepperIndicator':
      return []
    case 'StepperContent':
      return stepperContent(node)
    case 'StepperDescription':
      return [paragraph([text(componentText(node))])]
    case 'DocsStepperHeading':
      return [heading(2, componentText(node))]
    case 'p': {
      const children = transformChildren(node.children ?? [])
      return children.length ? [paragraph(children as PhrasingContent[])] : []
    }
    case 'ComponentPreview':
      return []
    default:
      if (/^[A-Z]/.test(name)) {
        throw new Error(
          `Add an AI Markdown fallback for the ${name} MDX component.`
        )
      }
      return transformChildren(node.children ?? [])
  }
}

function packageDemo(node: LooseNode): LooseNode[] {
  const kind = componentProp(node, 'kind')
  if (typeof kind !== 'string' || !Object.hasOwn(packagePreviews, kind))
    throw new Error('PackageDemoFrame requires a known package kind.')
  const preview = packagePreviews[kind as keyof typeof packagePreviews]
  const sample: Code[] = preview.code
    ? [{ type: 'code', lang: preview.language, value: preview.code }]
    : []
  const boundaries: Record<string, string> = {
    api: 'The browser runs a real TypeScript compiler against a checked-in snapshot of @hulla/api declarations. It makes no network request to an API; the repair is a preset edit, not a live AI agent.',
    db: 'The browser models an editable database table, server write validation, and a separate subscribed client connected by message ports. Both sides can edit; it does not connect to PostgreSQL.',
    style:
      'The browser executes the editable TypeScript style module in a disposable worker using installed @hulla/style helpers and cn. Failed edits retain the last working preview. Its 10,000-composition timing is a local measurement, not a comparison benchmark.',
    ui: 'The live form uses installed Solid components and their shipped keyboard, focus, and disabled behavior.',
    control:
      'The browser runs @hulla/control to convert a JSON exception and invalid deployment config into explicit failure results. Nothing is deployed.',
    args: 'The browser runs @hulla/args and Zod on whitespace-separated tokens. Invalid input and omitted options remain distinct. No shell command or preview server runs.',
    gittar:
      'A local filesystem model shows separate editable project copies and an unchanged cached template. No repository is downloaded or files written.',
    cli: 'An install-plan preview shows framework-specific commands and component source paths. No CLI command is executed or files written.',
  }
  const boundary = boundaries[kind]!
  return [
    paragraph([strong([text('Interactive example: ')]), text(preview.caption)]),
    paragraph([text(boundary)]),
    ...sample,
    paragraph([
      {
        type: 'link',
        url: `${DOCS_ORIGIN}/guides/${kind}/quick-start.md`,
        children: [text('Build the working example')],
      },
    ]),
  ]
}

function alert(node: LooseNode): LooseNode[] {
  const titleNode = findComponent(node, 'AlertTitle')
  const descriptionNode = findComponent(node, 'AlertDescription')
  const titleValue = titleNode ? componentText(titleNode) : ''
  const description = descriptionNode
    ? transformChildren(descriptionNode.children ?? [])
    : []
  const children: LooseNode[] = []

  if (titleValue) children.push(paragraph([strong([text(titleValue)])]))
  if (description.length > 0) {
    if (description.some((child) => child.type === 'paragraph')) {
      children.push(...description)
    } else {
      children.push(paragraph(description as PhrasingContent[]))
    }
  }

  return children.length > 0 ? [{ type: 'blockquote', children }] : []
}

function findComponent(node: LooseNode, name: string): LooseNode | undefined {
  for (const child of node.children ?? []) {
    if (
      (child.type === 'mdxJsxFlowElement' ||
        child.type === 'mdxJsxTextElement') &&
      child.name === name
    ) {
      return child
    }
    const nested = findComponent(child, name)
    if (nested) return nested
  }
  return undefined
}

function componentText(node: LooseNode): string {
  if (node.value) return node.value
  return (node.children ?? []).map(componentText).join('')
}

function packageManagerCommands(node: LooseNode): LooseNode[] {
  const commands = componentProp(node, 'commands')
  if (!isRecord(commands)) return []

  return Object.entries(commands).flatMap(([manager, command]) =>
    typeof command === 'string'
      ? [
          heading(3, `Install with ${manager}`),
          { type: 'code', lang: 'sh', value: command } satisfies Code,
        ]
      : []
  )
}

function docsLanguageTabs(node: LooseNode): LooseNode[] {
  const languages = [
    ['typescript', 'TypeScript'],
    ['rust', 'Rust'],
  ] as const

  return languages.flatMap(([slotName, label]) => {
    const section = (node.children ?? []).find(
      (child) =>
        child.type === 'mdxJsxFlowElement' &&
        child.name === 'section' &&
        (child.attributes ?? []).some(
          (attribute) =>
            isRecord(attribute) &&
            attribute.type === 'mdxJsxAttribute' &&
            attribute.name === 'slot' &&
            attribute.value === slotName
        )
    )
    if (!section || !(section.children ?? []).length) {
      throw new Error(
        `DocsLanguageTabs requires a non-empty ${slotName} slot for AI Markdown.`
      )
    }

    return [
      paragraph([strong([text(label)])]),
      ...transformChildren(section.children ?? []),
    ]
  })
}

function codeDiff(node: LooseNode): LooseNode[] {
  const diff = componentProp(node, 'diff')
  const filename = componentProp(node, 'filename')
  const caption = componentProp(node, 'caption')
  if (typeof diff !== 'string') return []

  const result: MarkdownNode[] = []
  if (typeof filename === 'string') {
    result.push(paragraph([text('Change in '), inlineCode(filename)]))
  }
  if (typeof caption === 'string') result.push(paragraph([text(caption)]))
  result.push({
    type: 'code',
    lang: 'diff',
    meta:
      typeof filename === 'string'
        ? `filename=${JSON.stringify(filename)}`
        : null,
    value: diff,
  } satisfies Code)
  return result
}

function guideLinks(node: LooseNode): LooseNode[] {
  const items = componentProp(node, 'items')
  if (!Array.isArray(items)) return []
  return [
    {
      type: 'list',
      ordered: false,
      spread: false,
      children: items.flatMap((item): ListItem[] => {
        if (
          !isRecord(item) ||
          typeof item.title !== 'string' ||
          typeof item.href !== 'string' ||
          typeof item.description !== 'string'
        )
          return []
        return [
          {
            type: 'listItem',
            children: [
              paragraph([
                {
                  type: 'link',
                  url: markdownDocsUrl(item.href),
                  children: [text(item.title)],
                },
                text(` — ${item.description}`),
              ]),
            ],
          },
        ]
      }),
    } satisfies List,
  ]
}

function conceptFlow(node: LooseNode): LooseNode[] {
  const label = componentProp(node, 'label')
  const steps = componentProp(node, 'steps')
  if (typeof label !== 'string' || !Array.isArray(steps)) return []

  const items = steps.flatMap((step): ListItem[] => {
    if (!isRecord(step)) return []
    const titleValue = step.title
    const description = step.description
    const example = step.example
    if (typeof titleValue !== 'string' || typeof description !== 'string') {
      return []
    }

    const children: Paragraph[] = [
      paragraph([strong([text(titleValue)]), text(` — ${description}`)]),
    ]
    if (typeof example === 'string') {
      children.push(paragraph([inlineCode(example)]))
    }
    return [{ type: 'listItem', children }]
  })

  return [
    heading(3, label),
    {
      type: 'list',
      ordered: true,
      spread: false,
      children: items,
    } satisfies List,
  ]
}

function contractPath(): LooseNode[] {
  return [
    heading(3, 'Contract lifecycle'),
    orderedList([
      [
        'Contract',
        'Shared methods, paths, inputs, statuses, and representations.',
      ],
      [
        'Implementation',
        'Server-only exhaustive handlers, middleware, and request context.',
      ],
      ['Adapter', 'Host routing, native context, and response writing.'],
      [
        'Transport',
        'The client boundary: Fetch, in-process, IPC, or WebSocket.',
      ],
    ]),
  ]
}

function projectBoundary(): LooseNode[] {
  return [
    heading(3, 'Recommended API module boundaries'),
    unorderedList([
      [
        'contract.ts — Shared',
        'Declarations and schemas; safe in every runtime.',
      ],
      [
        'implementation.ts — Server only',
        'Handlers, middleware, services, and server context.',
      ],
      [
        'client.ts — Browser safe',
        'A typed client with a browser-appropriate transport.',
      ],
      [
        'route.ts — Host boundary',
        'Mounts the implementation through the framework adapter.',
      ],
    ]),
  ]
}

function apiArchitecture(): LooseNode[] {
  return [
    heading(3, '@hulla/api architecture'),
    orderedList([
      [
        'Typed client',
        'Builds a call from the shared contract and narrows the returned status.',
      ],
      [
        'Transport',
        'Carries one invocation over Fetch, in process, MessagePort, or WebSocket.',
      ],
      [
        'Adapter',
        'Connects the portable call to host routing, context, request reads, and response writes.',
      ],
      [
        'Implementation',
        'Runs server middleware and the exhaustive route handler.',
      ],
    ]),
  ]
}

function stepperContent(node: LooseNode): LooseNode[] {
  const descriptionNode = findComponent(node, 'StepperDescription')
  const description = descriptionNode
    ? componentText(descriptionNode).trim()
    : ''
  const fullText = componentText(node).trim()
  const titleValue = description
    ? fullText
        .slice(0, Math.max(0, fullText.length - description.length))
        .trim()
    : fullText

  if (!titleValue && !description) return []

  return [
    paragraph([
      ...(titleValue ? [strong([text(titleValue)])] : []),
      ...(titleValue && description ? [text(' — ')] : []),
      ...(description ? [text(description)] : []),
    ]),
  ]
}

function orderedList(items: readonly (readonly [string, string])[]): List {
  return list(items, true)
}

function unorderedList(items: readonly (readonly [string, string])[]): List {
  return list(items, false)
}

function list(
  items: readonly (readonly [string, string])[],
  ordered: boolean
): List {
  return {
    type: 'list',
    ordered,
    spread: false,
    children: items.map(([titleValue, description]) => ({
      type: 'listItem',
      children: [
        paragraph([strong([text(titleValue)]), text(` — ${description}`)]),
      ],
    })),
  }
}

function componentProp(node: LooseNode, name: string): unknown {
  const attribute = (node.attributes ?? []).find(
    (value): value is MdxAttribute =>
      isRecord(value) && value.type === 'mdxJsxAttribute' && value.name === name
  )
  if (!attribute) return undefined
  if (typeof attribute.value === 'string') return attribute.value
  if (!attribute.value || !isRecord(attribute.value)) return true

  const program = attribute.value.data?.estree
  if (!isRecord(program) || !Array.isArray(program.body)) return undefined
  const statement = program.body[0]
  if (!isRecord(statement) || !isRecord(statement.expression)) return undefined
  return staticExpression(statement.expression)
}

function staticExpression(expression: Record<string, unknown>): unknown {
  switch (expression.type) {
    case 'Literal':
      return expression.value
    case 'TemplateLiteral': {
      if (
        !Array.isArray(expression.expressions) ||
        expression.expressions.length
      ) {
        return undefined
      }
      const quasi = Array.isArray(expression.quasis)
        ? expression.quasis[0]
        : undefined
      if (!isRecord(quasi) || !isRecord(quasi.value)) return undefined
      return quasi.value.cooked ?? quasi.value.raw
    }
    case 'ArrayExpression':
      return Array.isArray(expression.elements)
        ? expression.elements.map((item) =>
            isRecord(item) ? staticExpression(item) : undefined
          )
        : []
    case 'ObjectExpression': {
      const result: Record<string, unknown> = {}
      if (!Array.isArray(expression.properties)) return result
      for (const property of expression.properties) {
        if (!isRecord(property) || !isRecord(property.key)) continue
        const key =
          typeof property.key.name === 'string'
            ? property.key.name
            : typeof property.key.value === 'string'
              ? property.key.value
              : undefined
        if (!key || !isRecord(property.value)) continue
        result[key] = staticExpression(property.value)
      }
      return result
    }
    default:
      return undefined
  }
}

function markdownDocsUrl(url: string): string {
  const match = url.match(/^(\/(?:docs|guides))(\/[^#?]*)?([#?].*)?$/)
  if (!match || match[2]?.endsWith('.md')) return url
  return `${DOCS_ORIGIN}${match[1]}${match[2] ?? ''}.md${match[3] ?? ''}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function heading(depth: Heading['depth'], value: string): Heading {
  return { type: 'heading', depth, children: [text(value)] }
}

function paragraph(children: PhrasingContent[]): Paragraph {
  return { type: 'paragraph', children }
}

function text(value: string): Text {
  return { type: 'text', value }
}

function inlineCode(value: string): InlineCode {
  return { type: 'inlineCode', value }
}

function strong(children: PhrasingContent[]): Strong {
  return { type: 'strong', children }
}
