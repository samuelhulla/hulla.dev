import { defineCollection, z } from 'astro:content'

const docsSchema = z.object({
  title: z.string(),
  name: z.string().optional(),
})

export const collections = {
  docs: defineCollection({ type: 'content', schema: docsSchema }),
}
