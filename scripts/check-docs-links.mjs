import { readFile, readdir, access } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('dist')
const pages = new Map()
for (const section of ['docs', 'guides']) {
  for (const file of await readdir(path.join(root, section), {
    recursive: true,
  })) {
    if (!file.endsWith('.html')) continue
    const html = await readFile(path.join(root, section, file), 'utf8')
    const route =
      `/${section}/${file.replace(/(?:^|\/)index\.html$/, '').replace(/\.html$/, '')}`.replace(
        /\/$/,
        ''
      )
    const ids = new Set(
      [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
    )
    pages.set(route, { html, ids })
  }
}
if (pages.size === 0)
  throw new Error('Build the site before checking docs links.')
const failures = new Set()
let checked = 0
for (const [route, { html }] of pages) {
  for (const match of html.matchAll(/\bhref="([^"]+)"/g)) {
    const target = match[1].replaceAll('&amp;', '&')
    if (
      !/^\/(?:docs|guides)(?:\/|\.|$)/.test(target) &&
      !target.startsWith('#') &&
      !/^https:\/\/hulla\.dev\/(?:docs|guides)(?:\/|\.|$)/.test(target)
    )
      continue
    const url = new URL(target, `https://hulla.dev${route}`)
    if (url.pathname.endsWith('.md')) {
      try {
        await access(path.join(root, url.pathname))
      } catch {
        failures.add(`${route} → ${target} (missing Markdown)`)
      }
    } else {
      const page = pages.get(url.pathname.replace(/\/$/, ''))
      if (!page) failures.add(`${route} → ${target} (missing page)`)
      else if (url.hash && !page.ids.has(decodeURIComponent(url.hash.slice(1))))
        failures.add(`${route} → ${target} (missing section)`)
    }
    checked++
  }
}
if (failures.size) throw new Error([...failures].join('\n'))
console.log(
  `Checked ${checked} internal links across ${pages.size} documentation pages.`
)
