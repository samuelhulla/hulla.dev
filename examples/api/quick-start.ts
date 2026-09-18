import { defineContract, request, response, route } from '@hulla/api'
import { createClient } from '@hulla/api/client'
import { inProcessTransport } from '@hulla/api/in-process'
import { defineServer } from '@hulla/api/server'
import { z } from 'zod'

const newTask = z.object({
  title: z.string().min(1),
})

export const task = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
})

export const contract = defineContract({
  basePath: '/api',
  routes: {
    createTask: route.post('/tasks', {
      body: request.json(newTask),
      responses: {
        201: response.json(task),
      },
    }),
  },
})

export const implementation = defineServer(contract).implement({
  createTask: ({ body, response }) =>
    response(201, {
      id: crypto.randomUUID(),
      title: body.title,
      completed: false,
    }),
})

export const api = createClient(contract, {
  transport: inProcessTransport(implementation),
})

export async function createTask(title: string) {
  const result = await api.createTask({ body: { title } })
  return result.body
}
