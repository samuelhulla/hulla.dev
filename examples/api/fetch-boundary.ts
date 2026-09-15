import { createClient } from '@hulla/api/client'
import { fetchAdapter, fetchTransport } from '@hulla/api/fetch'
import { contract, implementation } from './quick-start'

export const handler = fetchAdapter().mount(implementation)

export const remoteApi = createClient(contract, {
  transport: fetchTransport({
    baseUrl: 'https://api.example.com',
  }),
})
