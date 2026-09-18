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
  body: string
}

export function renderMarkdownDocument({
  title,
  description,
  usefulFor = [],
  body,
}: MarkdownDocument): string {
  const sections = [
    `# ${title}`,
    `> ${description}`,
    usefulFor.length
      ? `## Useful when\n\n${usefulFor.map((item) => `- ${item}`).join('\n')}`
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
    case 'DocsConceptFlow':
      return conceptFlow(node)
    case 'DocsContractPath':
      return contractPath()
    case 'DocsProjectBoundary':
      return projectBoundary()
    case 'DocsApiArchitecture':
      return apiArchitecture()
    case 'Stepper':
    case 'StepperItem':
    case 'StepperPanel':
      return transformChildren(node.children ?? [])
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
  const match = url.match(/^\/docs(\/[^#?]*)?([#?].*)?$/)
  if (!match || match[1]?.endsWith('.md')) return url
  return `${DOCS_ORIGIN}/docs${match[1] ?? ''}.md${match[2] ?? ''}`
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
