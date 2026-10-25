export type ContractField = 'name' | 'displayName' | 'handle'
export type ApiDiagnostic = {
  file: string
  line: number
  code: number
  message: string
  start: number
  length: number
}
export type ApiCheck = {
  revision: number
  diagnostics: ApiDiagnostic[]
  error?: string
}

export type ApiSources = Record<
  '/contract.ts' | '/server.ts' | '/profile.ts',
  string
>

export function apiProject(field: ContractField, consumerField: ContractField) {
  return {
    '/contract.ts': `import { defineContract, route, response } from '@hulla/api'

export const contract = defineContract({
  routes: {
    profile: route.get('/profile', {
      responses: {
        200: response.json<{ ${field}: string }>(),
      },
    }),
  },
})`,
    '/server.ts': `import { defineServer } from '@hulla/api/server'
import { contract } from './contract'

export const server = defineServer(contract).implement({
  profile: ({ response }) =>
    response(200, { ${consumerField}: 'Ada Lovelace' }),
})`,
    '/profile.ts': `import type { Client } from '@hulla/api/client'
import { contract } from './contract'

export async function profileTitle(api: Client<typeof contract>) {
  const result = await api.profile()
  if (result.status === 200) {
    return result.body.${consumerField}.toUpperCase()
  }
}`,
  }
}
