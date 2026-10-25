export const templateSource = `{
  "subpath": "web",
  "update": "never",
  "outDir": "./project-1"
}`

export function templateOptions(source: string): {
  subpath: 'web' | 'api'
  update: 'always' | 'never' | 'commit'
  outDir: string
} {
  const value = JSON.parse(source) as Record<string, unknown> | null
  if (!value || (value.subpath !== 'web' && value.subpath !== 'api'))
    throw new Error(
      'This local template contains web/ and api/. Choose either subpath.'
    )
  if (!['always', 'never', 'commit'].includes(String(value.update)))
    throw new Error('Set update to always, never, or commit.')
  if (
    typeof value.outDir !== 'string' ||
    !value.outDir.trim() ||
    value.outDir.length > 80
  )
    throw new Error('Set outDir to a destination name of 1–80 characters.')
  return value as ReturnType<typeof templateOptions>
}

export const installSource = 'hulla ui add --framework astro button'
export function installPlan(source: string) {
  const tokens = source.trim().split(/\s+/)
  if (tokens.slice(0, 4).join(' ') !== 'hulla ui add --framework')
    throw new Error(
      'Use hulla ui add --framework <astro|react|solid> <button|dialog>.'
    )
  const framework = tokens[4]
  if (!['astro', 'react', 'solid'].includes(framework ?? ''))
    throw new Error('Choose astro, react, or solid after --framework.')
  const components = [...new Set(tokens.slice(5))]
  if (
    !components.length ||
    components.some((name) => name !== 'button' && name !== 'dialog')
  )
    throw new Error(
      'This install preview includes button and dialog. You can list both.'
    )
  const suffix = framework === 'astro' ? 'astro' : 'tsx'
  return components.flatMap((name) => {
    const files =
      name === 'button'
        ? ['button', 'button-group']
        : [
            'dialog',
            'dialog-header',
            'dialog-title',
            'dialog-description',
            'dialog-footer',
          ]
    return [
      ...files.map((file) => `src/components/${name}/${file}.${suffix}`),
      ...(framework === 'astro' ? [] : [`src/components/${name}/index.tsx`]),
    ]
  })
}
