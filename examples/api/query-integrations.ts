import { createSWR } from '@hulla/api-swr'
import { createTanStackQuery } from '@hulla/api-tanstack-query'
import { api } from './quick-start'

export const query = createTanStackQuery(api, {
  prefix: ['example'],
})
export const swr = createSWR(api, { prefix: ['example'] })

export const userQuery = query.user.queryOptions({ params: { id: 'ada' } })
export const userSWR = swr.user.queryOptions({ params: { id: 'ada' } })
