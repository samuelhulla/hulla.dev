type Node = {
  type: string
  value?: string
  children?: Node[]
  [key: string]: unknown
}

/** Keep authoring readable Markdown while using the shared Alert composition. */
export function remarkDocsCallouts() {
  return (tree: Node) => {
    let found = false
    function visit(node: Node) {
      if (!node.children) return
      node.children = node.children.map((child) => {
        visit(child)
        if (child.type !== 'blockquote') return child
        const paragraph = child.children?.[0]
        const first = paragraph?.children?.[0]
        const marker = first?.value?.match(
          /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|SUCCESS)\](?: ([^\n]+))?(?:\n|$)/
        )
        if (
          paragraph?.type !== 'paragraph' ||
          first?.type !== 'text' ||
          !marker
        )
          return child
        found = true
        first.value = first.value!.slice(marker[0].length)
        if (!first.value) paragraph.children!.shift()
        if (!paragraph.children?.length) child.children!.shift()
        // Callouts inherit AlertDescription typography, rather than prose sizing.
        for (const content of child.children ?? []) {
          if (content.type === 'paragraph') {
            Object.assign(content, {
              type: 'mdxJsxFlowElement',
              name: 'p',
              attributes: [
                {
                  type: 'mdxJsxAttribute',
                  name: 'class',
                  value: 'my-2 first:mt-0 last:mb-0',
                },
              ],
            })
          }
        }
        return {
          type: 'mdxJsxFlowElement',
          name: 'DocsCallout',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'kind',
              value: marker[1]!.toLowerCase(),
            },
            ...(marker[2]
              ? [{ type: 'mdxJsxAttribute', name: 'title', value: marker[2] }]
              : []),
          ],
          children: child.children,
        }
      })
    }
    visit(tree)
    if (found)
      tree.children?.unshift({
        type: 'mdxjsEsm',
        value: "import DocsCallout from '@/components/docs/DocsCallout.astro'",
        data: {
          estree: {
            type: 'Program',
            sourceType: 'module',
            body: [
              {
                type: 'ImportDeclaration',
                source: {
                  type: 'Literal',
                  value: '@/components/docs/DocsCallout.astro',
                },
                specifiers: [
                  {
                    type: 'ImportDefaultSpecifier',
                    local: { type: 'Identifier', name: 'DocsCallout' },
                  },
                ],
              },
            ],
          },
        },
      })
  }
}
