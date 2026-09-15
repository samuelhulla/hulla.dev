import { spawn } from 'node:child_process'
import { cp, mkdtemp, readFile, readdir, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = process.cwd()
const roots = ['src', 'scripts', 'tests']
const relativeImport =
  /(?:from\s*|import\s*\(|require\s*\()\s*['"](\.[^'"]+)['"]/g
const siblingRoots = ['api', 'ui', 'cli'].map((name) =>
  path.resolve(root, '..', name)
)

for (const directory of roots) {
  for (const file of await walk(path.join(root, directory))) {
    if (!/\.(?:astro|[cm]?[jt]sx?|mdx)$/.test(file)) continue
    const source = await readFile(file, 'utf8')
    for (const match of source.matchAll(relativeImport)) {
      const target = path.resolve(path.dirname(file), match[1])
      if (
        siblingRoots.some(
          (sibling) =>
            target === sibling || target.startsWith(`${sibling}${path.sep}`)
        )
      ) {
        throw new Error(
          `Runtime sibling import found in ${path.relative(root, file)}`
        )
      }
    }
  }
}

const packageJson = await readFile(path.join(root, 'package.json'), 'utf8')
if (/['"]file:/.test(packageJson))
  throw new Error('package.json contains a local file dependency.')
console.log(
  'Self-containment scan passed; the site runtime has no sibling repository imports.'
)

if (process.argv.includes('--build')) {
  const fixture = await mkdtemp(path.join(tmpdir(), 'hulla-self-contained-'))
  const excluded = new Set([
    '.astro',
    '.git',
    '.playwright-cli',
    'dist',
    'node_modules',
    'output',
    'tmp',
  ])
  try {
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (excluded.has(entry.name)) continue
      await cp(path.join(root, entry.name), path.join(fixture, entry.name), {
        recursive: entry.isDirectory(),
      })
    }
    await symlink(
      path.join(root, 'node_modules'),
      path.join(fixture, 'node_modules'),
      'dir'
    )
    await run(path.join(fixture, 'node_modules/.bin/astro'), ['build'], fixture)
    console.log(
      'Self-contained production build passed in an isolated tree with no sibling repositories.'
    )
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
}

async function walk(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await walk(target)))
    else result.push(target)
  }
  return result
}

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(' ')} exited ${code}`))
    )
  })
}
