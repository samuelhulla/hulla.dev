import { spawn } from 'node:child_process'
import {
  access,
  cp,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { createHash } from 'node:crypto'

const root = process.cwd()
const args = process.argv.slice(2)
const check = args.includes('--check')
const cli = option('--cli') ?? process.env.HULLA_CLI
const registry = path.resolve(
  option('--registry') ?? process.env.HULLA_UI_REGISTRY ?? '../ui/generated'
)
const astroComponents = [
  'navigation-menu',
  'button',
  'badge',
  'breadcrumbs',
  'card',
  'code',
  'code-highlighter-shiki',
  'separator',
  'sidebar',
  'tabs',
  'dialog',
  'collapsible',
  'kbd',
  'alert',
  'table',
  'table-of-contents',
  'backdrop',
  'stepper',
]
const solidComponents = [
  'command',
  'dialog',
  'input',
  'button',
  'spinner',
  'backdrop',
  'kbd',
]

if (!cli) {
  if (!check)
    throw new Error(
      'ui:sync requires --cli <packed-hulla-binary> (or HULLA_CLI).'
    )
  await staticCheck()
  console.log(
    'UI static integrity passed. Supply --cli to also regenerate in an isolated fixture.'
  )
  process.exit(0)
}

await access(path.join(registry, 'ui.config.ts')).catch(() => {
  throw new Error(`UI registry is unavailable at ${registry}`)
})

await access(path.resolve(cli)).catch(() => {
  throw new Error(`Packed hulla CLI binary is unavailable at ${cli}`)
})

if (check) await fixtureCheck(path.resolve(cli))
else await sync(path.resolve(cli), root)

function option(name) {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

async function sync(binary, cwd) {
  const tsconfigPath = path.join(cwd, 'tsconfig.json')
  const originalTsconfig = JSON.parse(await readFile(tsconfigPath, 'utf8'))
  await run(binary, ['ui', 'init', '--yes'], cwd)
  await run(
    binary,
    ['ui', 'add', '--yes', '--framework', 'astro', ...astroComponents],
    cwd
  )
  await run(
    binary,
    ['ui', 'add', '--yes', '--framework', 'solid', ...solidComponents],
    cwd
  )
  const updatedTsconfig = JSON.parse(await readFile(tsconfigPath, 'utf8'))
  // TypeScript 7 resolves the existing relative paths without the removed baseUrl option.
  delete updatedTsconfig.compilerOptions.baseUrl
  updatedTsconfig.compilerOptions.types = [
    ...new Set([
      ...(updatedTsconfig.compilerOptions.types ?? []),
      ...(originalTsconfig.compilerOptions?.types ?? []),
    ]),
  ]
  updatedTsconfig.exclude = [
    ...new Set([
      ...(updatedTsconfig.exclude ?? []),
      ...(originalTsconfig.exclude ?? []),
    ]),
  ]
  await writeFile(tsconfigPath, `${JSON.stringify(updatedTsconfig, null, 2)}\n`)
  await run(
    path.join(root, 'node_modules/.bin/prettier'),
    ['--write', tsconfigPath],
    cwd
  )
}

async function fixtureCheck(binary) {
  const fixture = await mkdtemp(path.join(tmpdir(), 'hulla-dev-ui-check-'))
  try {
    for (const file of [
      'package.json',
      'tsconfig.json',
      'astro.config.mjs',
      '.prettierrc',
    ]) {
      await cp(path.join(root, file), path.join(fixture, file))
    }
    await symlink(
      path.join(root, 'node_modules'),
      path.join(fixture, 'node_modules'),
      'dir'
    )
    await mkdir(path.join(fixture, '.hulla'), { recursive: true })
    await run(binary, ['init', '--yes'], fixture)
    if (!(await exists(path.join(fixture, '.hulla/hulla.json')))) {
      throw new Error('hulla init did not create .hulla/hulla.json.')
    }
    const sourceConfig = JSON.parse(
      await readFile(path.join(root, '.hulla/ui.json'), 'utf8')
    )
    sourceConfig.sources = [registry]
    sourceConfig.installs = sourceConfig.installs.map((install) => ({
      ...install,
      sourceUrl: registry,
    }))
    await writeFile(
      path.join(fixture, '.hulla/ui.json'),
      `${JSON.stringify(sourceConfig, null, 2)}\n`
    )
    await mkdir(path.join(fixture, 'src/pages'), { recursive: true })
    await writeFile(
      path.join(fixture, 'src/pages/index.astro'),
      '<h1>@hulla/ui fixture</h1>\n'
    )

    await sync(binary, fixture)

    const firstDigest = await directoryDigest(
      path.join(fixture, 'src/components')
    )
    await sync(binary, fixture)
    const secondDigest = await directoryDigest(
      path.join(fixture, 'src/components')
    )
    if (firstDigest !== secondDigest)
      throw new Error('Packed-CLI regeneration is not idempotent.')

    await run(
      binary,
      ['ui', '--framework', 'solid', 'remove', '--yes', 'spinner'],
      fixture
    )
    const spinnerRoot = path.join(fixture, 'src/components/spinner')
    if (await exists(spinnerRoot))
      throw new Error(
        'hulla ui remove did not remove the Solid spinner component.'
      )
    await run(
      binary,
      ['ui', 'add', '--yes', '--framework', 'solid', 'spinner'],
      fixture
    )

    const generatedDirectories = [
      ...new Set([...astroComponents, ...solidComponents]),
    ].map((component) => `src/components/${component}`)
    for (const directory of generatedDirectories) {
      const expected = await directoryDigest(path.join(root, directory))
      const actual = await directoryDigest(path.join(fixture, directory))
      if (actual !== expected)
        throw new Error(
          `${directory} differs from isolated packed-CLI regeneration.`
        )
    }
    for (const file of await listFiles(path.join(fixture, 'src/lib'))) {
      const relative = path.relative(fixture, file)
      if (
        (await readFile(path.join(root, relative), 'utf8')) !==
        (await readFile(file, 'utf8'))
      )
        throw new Error(`${relative} differs from CLI regeneration.`)
    }
    if (
      (await readFile(path.join(root, 'src/styles.css'), 'utf8')) !==
      (await readFile(path.join(fixture, 'src/styles.css'), 'utf8'))
    )
      throw new Error('Shared stylesheet differs from CLI regeneration.')
    console.log(
      'UI fixture regeneration matches committed component and support source.'
    )
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
}

async function staticCheck() {
  const packageJson = await readFile(path.join(root, 'package.json'), 'utf8')
  if (/\b(?:file|link):/.test(packageJson))
    throw new Error('Tracked package.json contains a local dependency.')
  const files = await listFiles(path.join(root, 'src/components'))
  if (
    !files.some((file) => file.endsWith('.astro')) ||
    !files.some((file) => file.endsWith('.tsx'))
  ) {
    throw new Error(
      'Expected both Astro and Solid CLI-installed component source.'
    )
  }
  for (const directory of ['src/components', 'src/lib']) {
    for (const file of await listFiles(path.join(root, directory))) {
      const source = await readFile(file, 'utf8')
      if (source.includes('@/src/'))
        throw new Error(`Invalid consumer alias remains in ${file}`)
      if (/from ['"]\.\.\/\.\.\/.*\/(ui|generated)/.test(source)) {
        throw new Error(`Direct sibling UI import remains in ${file}`)
      }
    }
  }
}

async function exists(target) {
  return access(target).then(
    () => true,
    () => false
  )
}

async function directoryDigest(directory) {
  const hash = createHash('sha256')
  for (const file of await listFiles(directory)) {
    hash.update(path.relative(directory, file))
    hash.update(await readFile(file))
  }
  return hash.digest('hex')
}

async function listFiles(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await listFiles(target)))
    else result.push(target)
  }
  return result.sort()
}

function run(command, commandArgs, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(`${command} ${commandArgs.join(' ')} exited ${code}`)
          )
    )
  })
}
