import { mkdir, readFile, writeFile } from 'node:fs/promises'

// Curate build-time assets; neither the registry nor the browser needs an icon pack.
const source = new URL(
  '../node_modules/@iconify-json/logos/icons.json',
  import.meta.url
)
const destination = new URL('../public/file-icons/', import.meta.url)
const { icons } = JSON.parse(await readFile(source, 'utf8'))
const selected = {
  typescript: 'typescript-icon',
  javascript: 'javascript',
  react: 'react',
  astro: 'astro-icon',
  css: 'css-3',
  html: 'html-5',
  json: 'json',
  markdown: 'markdown',
  rust: 'rust',
  vue: 'vue',
  svelte: 'svelte-icon',
  python: 'python',
}

await mkdir(destination, { recursive: true })
for (const [name, key] of Object.entries(selected)) {
  const icon = icons[key]
  // Neutral marks need to remain visible in both of the site's color themes.
  const body =
    name === 'astro'
      ? icon.body.replaceAll('fill="#fff"', 'fill="#888"')
      : icon.body
  await writeFile(
    new URL(`${name}.svg`, destination),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width ?? 256} ${icon.height ?? 256}" fill="#888">${body}</svg>\n`
  )
}
for (const [name, body] of Object.entries({
  file: '<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9L15 3H9Z"/><path d="M14 3v7h7"/>',
  terminal:
    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 8 4 4-4 4m7 0h5"/>',
  yaml: '<path d="m5 4 7 8 7-8m-7 8v8"/>',
})) {
  await writeFile(
    new URL(`${name}.svg`, destination),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</svg>\n`
  )
}
await writeFile(
  new URL('NOTICE.txt', destination),
  'Logo assets are selected from SVG Logos by Gil Barbara via @iconify-json/logos (CC0-1.0).\nSource: https://github.com/gilbarbara/logos\nAstro’s white mark and uncolored marks use a neutral gray for visibility in light and dark themes.\nFile, terminal, and YAML symbols are site-owned.\nRegenerate with: node scripts/generate-file-icons.mjs\n'
)
