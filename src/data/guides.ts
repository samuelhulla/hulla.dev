import type { DocPackage } from './docs'

export type Guide = {
  id: string
  packageKind: DocPackage['kind']
  title: string
  description: string
  href: `/guides/${string}`
}

export const guides: readonly Guide[] = [
  {
    id: 'api/quick-start',
    packageKind: 'api',
    title: 'Build a task API',
    description: 'Create a task and call your API from TypeScript.',
    href: '/guides/api/quick-start',
  },
  {
    id: 'args/quick-start',
    packageKind: 'args',
    title: 'Build a greeting command',
    description: 'Read a name and an optional greeting from the command line.',
    href: '/guides/args/quick-start',
  },
  {
    id: 'args/recipes',
    packageKind: 'args',
    title: 'Build a notes CLI',
    description: 'Save notes to a JSON file and read them back.',
    href: '/guides/args/recipes',
  },
  {
    id: 'cli/quick-start',
    packageKind: 'cli',
    title: 'Install your first component',
    description: 'Add editable UI components to an Astro project.',
    href: '/guides/cli/quick-start',
  },
  {
    id: 'control/quick-start',
    packageKind: 'control',
    title: 'Handle a missing title',
    description: 'Return a title or an error and handle both in the caller.',
    href: '/guides/control/quick-start',
  },
  {
    id: 'control/config-checker',
    packageKind: 'control',
    title: 'Build a config checker',
    description: 'Check a JSON config and tell the user what needs fixing.',
    href: '/guides/control/config-checker',
  },
  {
    id: 'db/quick-start',
    packageKind: 'db',
    title: 'Build a live task list',
    description:
      'Save tasks to PostgreSQL and see changes in two browser tabs.',
    href: '/guides/db/quick-start',
  },
  {
    id: 'style/quick-start',
    packageKind: 'style',
    title: 'Style a button',
    description:
      'Give a button a choice of sizes and colors with typed class recipes.',
    href: '/guides/style/quick-start',
  },
  {
    id: 'ui/quick-start',
    packageKind: 'ui',
    title: 'Build a reading counter',
    description: 'Put Card and Button together on a working Astro page.',
    href: '/guides/ui/quick-start',
  },
  {
    id: 'gittar/quick-start',
    packageKind: 'gittar',
    title: 'Build a template downloader',
    description: 'Download repository files and reuse the saved copy.',
    href: '/guides/gittar/quick-start',
  },
]

export const guideRedirects = Object.fromEntries(
  guides.map((guide) => [`/docs/${guide.id}`, guide.href])
)
export function findGuide(pathname: string) {
  return guides.find((guide) => guide.href === pathname.replace(/\/$/, ''))
}
export function adjacentGuides(pathname: string) {
  const current = findGuide(pathname)
  const pages = guides.filter(
    (guide) => guide.packageKind === current?.packageKind
  )
  const index = current ? pages.indexOf(current) : -1
  return {
    previous: index > 0 ? pages[index - 1] : undefined,
    next: index >= 0 ? pages[index + 1] : undefined,
  }
}
