// Refresh the checked-in playground declarations. Normal builds use only the
// snapshot; they never read a sibling checkout or execute its implementation.
import ts from 'typescript'
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const source = path.resolve(process.argv[2] ?? '../api/packages/core')
const root = path.join(source, 'src')
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) => {
        const file = path.join(directory, entry.name)
        return entry.isDirectory() ? walk(file) : [file]
      })
    )
  ).flat()
}
const inputs = (await walk(root)).filter((file) => file.endsWith('.ts')).sort()
const files = {}
const program = ts.createProgram(inputs, {
  declaration: true,
  emitDeclarationOnly: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  rootDir: root,
  outDir: '/playground-api-types',
  strict: true,
})
const result = program.emit(undefined, (file, content) => {
  files[file.replace('/playground-api-types', '/node_modules/@hulla/api')] =
    content
})
if (result.emitSkipped || !Object.keys(files).length)
  throw new Error('Declaration emit failed')
const pkg = JSON.parse(
  await readFile(path.join(source, 'package.json'), 'utf8')
)
files['/node_modules/@hulla/api/package.json'] = JSON.stringify({
  name: pkg.name,
  version: pkg.version,
  exports: Object.fromEntries(
    Object.entries(pkg.exports).map(([key, value]) => [
      key,
      { types: value.types.replace('./dist/', './') },
    ])
  ),
})
files['/node_modules/@standard-schema/spec/index.d.ts'] = await readFile(
  path.join(source, 'node_modules/@standard-schema/spec/dist/index.d.ts'),
  'utf8'
)
const hash = createHash('sha256')
for (const file of inputs)
  hash.update(path.relative(root, file)).update(await readFile(file))
await mkdir('src/lib/demos', { recursive: true })
await writeFile(
  'src/lib/demos/api-types.json',
  JSON.stringify(
    {
      provenance: {
        package: pkg.name,
        version: pkg.version,
        sourceSha256: hash.digest('hex'),
        license: pkg.license,
      },
      files,
    },
    null,
    2
  ) + '\n'
)
console.log(
  `Snapshot: ${Object.keys(files).length} declaration files for ${pkg.name}@${pkg.version}`
)
