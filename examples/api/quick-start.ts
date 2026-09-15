import { defineContract, response, route } from '@hulla/api'
import { createClient } from '@hulla/api/client'
import { inProcessTransport } from '@hulla/api/in-process'
import { defineServer } from '@hulla/api/server'
import { z } from 'zod'

const user = z.object({ id: z.string(), name: z.string() })

export const contract = defineContract({
  basePath: '/api',
  routes: {
    user: route.get('/users/:id', {
      params: z.object({ id: z.string().min(1) }),
      responses: {
        200: response.json(user),
        404: response.json(z.object({ message: z.string() })),
      },
    }),
  },
})

export const implementation = defineServer(contract).implement({
  user: ({ params, response }) =>
    params.id === 'ada'
      ? response(200, { id: 'ada', name: 'Ada' })
      : response(404, { message: 'User not found' }),
})

export const api = createClient(contract, {
  transport: inProcessTransport(implementation),
})

export async function readUser(id: string) {
  const result = await api.user({ params: { id } })
  return result.status === 200 ? result.body.name : result.body.message
}
