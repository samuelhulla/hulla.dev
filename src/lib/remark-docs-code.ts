type Node = {
  type: string
  value?: string
  lang?: string | null
  meta?: string | null
  children?: Node[]
  [key: string]: unknown
}
/** Route fences to the same public composition as explicitly authored examples. */
export function remarkDocsCode() {
  return (tree: Node) => {
    let hasCode = false
    function visit(node: Node) {
      if (!node.children) return
      node.children = node.children.map((child) => {
        if (child.type !== 'code') {
          visit(child)
          return child
        }
        hasCode = true
        const filename = child.meta?.match(/filename="([^"]+)"/)?.[1]
        const highlighted = child.meta?.match(/(?:^|\s)\{([\d,\s-]+)\}/)?.[1]
        const range = (name: string) =>
          child.meta?.match(
            new RegExp(`(?:^|\\s)${name}=\\{([\\d,\\s-]+)\\}`)
          )?.[1]
        const stringAttribute = (name: string, value?: string) =>
          value
            ? [
                {
                  type: 'mdxJsxAttribute',
                  name,
                  value: value.replace(/\s/g, ''),
                },
              ]
            : []
        return {
          type: 'mdxJsxFlowElement',
          name: 'MarkdownCodeBlock',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'code', value: child.value ?? '' },
            {
              type: 'mdxJsxAttribute',
              name: 'language',
              value: child.lang || 'text',
            },
            ...(filename
              ? [{ type: 'mdxJsxAttribute', name: 'filename', value: filename }]
              : []),
            ...stringAttribute('highlighted', highlighted),
            ...stringAttribute('focused', range('focus')),
            ...stringAttribute('inserted', range('ins')),
            ...stringAttribute('deleted', range('del')),
            ...stringAttribute('error', range('error')),
            ...stringAttribute('warning', range('warning')),
            ...(child.meta?.match(/(?:^|\s)lineNumbers(?:\s|$)/)
              ? [{ type: 'mdxJsxAttribute', name: 'lineNumbers', value: null }]
              : []),
          ],
          children: [],
        }
      })
    }
    visit(tree)
    if (hasCode)
      tree.children?.unshift({
        type: 'mdxjsEsm',
        value:
          "import MarkdownCodeBlock from '@/components/docs/DocsCodeBlock.astro'",
        data: {
          estree: {
            type: 'Program',
            sourceType: 'module',
            body: [
              {
                type: 'ImportDeclaration',
                source: {
                  type: 'Literal',
                  value: '@/components/docs/DocsCodeBlock.astro',
                },
                specifiers: [
                  {
                    type: 'ImportDefaultSpecifier',
                    local: { type: 'Identifier', name: 'MarkdownCodeBlock' },
                  },
                ],
              },
            ],
          },
        },
      })
  }
}
