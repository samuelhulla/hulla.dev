import { gzipSync } from 'node:zlib'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
const output = path.join(root, 'output', 'bundle-report.json')

const files = await walk(dist)
const assets = []
const routes = []

for (const file of files) {
  const relative = path.relative(dist, file)
  const contents = await readFile(file)
  const entry = {
    path: relative,
    bytes: contents.byteLength,
    gzipBytes: gzipSync(contents).byteLength,
  }
  if (relative.endsWith('.html')) routes.push(entry)
  if (relative.endsWith('.js')) assets.push(entry)
}

assets.sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path))
routes.sort((a, b) => a.path.localeCompare(b.path))

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    routes: routes.length,
    javascriptAssets: assets.length,
    javascriptBytes: assets.reduce((sum, asset) => sum + asset.bytes, 0),
    javascriptGzipBytes: assets.reduce(
      (sum, asset) => sum + asset.gzipBytes,
      0
    ),
  },
  routes,
  javascript: assets,
}

await mkdir(path.dirname(output), { recursive: true })
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
console.log(
  `Bundle report: ${report.summary.routes} routes, ${formatBytes(report.summary.javascriptGzipBytes)} gzip JavaScript`
)

async function walk(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...(await walk(target)))
    else if ((await stat(target)).isFile()) result.push(target)
  }
  return result
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`
}
