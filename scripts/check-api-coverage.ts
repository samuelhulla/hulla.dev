import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'
import { apiCoverage } from '../src/data/api-coverage'

const apiRoot = path.resolve(process.env.HULLA_API_ROOT ?? '../api')
const packagesRoot = path.join(apiRoot, 'packages')
const declarations = new Map<string, string>()

for (const directory of await readdir(packagesRoot, { withFileTypes: true })) {
  if (!directory.isDirectory()) continue

  const packageRoot = path.join(packagesRoot, directory.name)
  const packageJson = JSON.parse(
    await readFile(path.join(packageRoot, 'package.json'), 'utf8')
  ) as {
    name: string
    exports: unknown
  }

  for (const [subpath, conditions] of publicEntrypoints(packageJson.exports)) {
    const declaration = declarationTarget(conditions)
    if (!declaration) {
      throw new Error(
        `${packageJson.name}${subpath === '.' ? '' : subpath.slice(1)} has no import types declaration.`
      )
    }

    const entrypoint =
      subpath === '.'
        ? packageJson.name
        : `${packageJson.name}${subpath.slice(1)}`
    declarations.set(entrypoint, path.resolve(packageRoot, declaration))
  }
}

const program = ts.createProgram({
  rootNames: [...declarations.values()],
  options: {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
  },
})
const checker = program.getTypeChecker()
const documented = new Map<string, Set<string>>()
const completeEntrypoints = new Set<string>()

for (const item of apiCoverage) {
  const names = documented.get(item.entrypoint) ?? new Set<string>()
  for (const exported of item.exports) {
    if (exported === '*') completeEntrypoints.add(item.entrypoint)
    else names.add(exported)
  }
  documented.set(item.entrypoint, names)
}

const failures: string[] = []
let exportCount = 0

for (const [entrypoint, declaration] of declarations) {
  const source = program.getSourceFile(declaration)
  const symbol = source && checker.getSymbolAtLocation(source)
  if (!source || !symbol) {
    failures.push(`${entrypoint}: could not inspect ${declaration}`)
    continue
  }

  const publicExports = checker
    .getExportsOfModule(symbol)
    .map((item) => item.getName())
    .filter((name) => name !== 'default')
    .sort()
  exportCount += publicExports.length
  const covered = documented.get(entrypoint) ?? new Set<string>()
  const complete = completeEntrypoints.has(entrypoint)
  const missing = complete
    ? []
    : publicExports.filter((name) => !covered.has(name))
  const stale = complete
    ? []
    : [...covered].filter((name) => !publicExports.includes(name))

  if (missing.length)
    failures.push(`${entrypoint}: missing ${missing.join(', ')}`)
  if (stale.length) failures.push(`${entrypoint}: stale ${stale.join(', ')}`)
}

for (const entrypoint of documented.keys()) {
  if (!declarations.has(entrypoint)) {
    failures.push(`${entrypoint}: coverage references a non-public entrypoint`)
  }
}

if (failures.length) {
  throw new Error(
    `API coverage manifest is incomplete:\n${failures.join('\n')}`
  )
}

console.log(
  `API coverage maps ${exportCount} exports across ${declarations.size} public entrypoints.`
)

function publicEntrypoints(exports: unknown): [string, unknown][] {
  if (!isRecord(exports)) return []
  const entries = Object.entries(exports)
  return entries.some(([key]) => key.startsWith('.'))
    ? entries.filter(([key]) => key.startsWith('.'))
    : [['.', exports]]
}

function declarationTarget(conditions: unknown): string | undefined {
  if (!isRecord(conditions)) return undefined
  if (typeof conditions.types === 'string') return conditions.types
  if ('import' in conditions) return declarationTarget(conditions.import)
  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
