import { createApiChecker } from './api-checker'
import type { ApiSources } from './api-project'

const raw = import.meta.glob('/node_modules/@typescript/old/lib/lib*.d.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
const libraries = Object.fromEntries(
  Object.entries(raw).map(([file, text]) => [
    `/lib/${file.split('/').at(-1)}`,
    text,
  ])
)
const check = createApiChecker(libraries)
self.onmessage = (
  event: MessageEvent<{
    revision: number
    project: ApiSources
  }>
) => {
  const { revision, project } = event.data
  try {
    self.postMessage({ revision, diagnostics: check(project) })
  } catch (error) {
    self.postMessage({ revision, diagnostics: [], error: String(error) })
  }
}
