import { spawn } from 'node:child_process'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const apiRoot = path.resolve(process.env.HULLA_API_ROOT ?? '../api')
const packagesRoot = path.join(apiRoot, 'packages')
const coreDist = path.join(packagesRoot, 'core/dist')
const expectedVersion = '2.0.0'

const packageJson = JSON.parse(
  await readFile(path.join(apiRoot, 'packages/core/package.json'), 'utf8')
)
if (packageJson.version !== expectedVersion) {
  throw new Error(
    `API fixture expected ${expectedVersion}, received ${packageJson.version}.`
  )
}

await access(path.join(coreDist, 'index.d.ts')).catch(() => {
  throw new Error(
    `Build the @hulla/api workspace first; declarations are missing from ${coreDist}.`
  )
})

const temporary = await mkdtemp(path.join(tmpdir(), 'hulla-api-docs-'))
const config = path.join(temporary, 'tsconfig.json')

try {
  await writeFile(
    config,
    `${JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          paths: {
            '@hulla/api': [path.join(coreDist, 'index.d.ts')],
            '@hulla/api/client': [path.join(coreDist, 'client/index.d.ts')],
            '@hulla/api/fetch': [path.join(coreDist, 'fetch/index.d.ts')],
            '@hulla/api/in-process': [
              path.join(coreDist, 'in-process/index.d.ts'),
            ],
            '@hulla/api/server': [path.join(coreDist, 'server/index.d.ts')],
            '@hulla/api-tanstack-query': [
              path.join(packagesRoot, 'tanstack-query/dist/index.d.ts'),
            ],
            '@hulla/api-swr': [path.join(packagesRoot, 'swr/dist/index.d.ts')],
          },
        },
        files: [
          path.join(root, 'examples/api/quick-start.ts'),
          path.join(root, 'examples/api/fetch-boundary.ts'),
          path.join(root, 'examples/api/query-integrations.ts'),
        ],
      },
      null,
      2
    )}\n`
  )
  await run(path.join(root, 'node_modules/.bin/tsc'), ['--project', config])
  console.log(
    `API documentation fixtures compile against @hulla/api ${expectedVersion}.`
  )
} finally {
  await rm(temporary, { recursive: true, force: true })
}

function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: root,
      stdio: 'inherit',
    })
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
