import { defineCollection, z } from 'astro:content'

const docsSchema = z.object({
  title: z.string(),
  name: z.string().optional(),
})

export type DocsSchemaType = z.infer<typeof docsSchema>

export const collections = {
  docs: defineCollection({ type: 'content', schema: docsSchema }),
}
