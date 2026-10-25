import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
const schema = z.object({
  title: z.string(),
  description: z.string(),
  usefulFor: z.array(z.string()).default([]),
  tutorial: z
    .object({
      outcome: z.string(),
      prerequisites: z.array(
        z.object({ title: z.string(), href: z.string().optional() })
      ),
    })
    .optional(),
})
const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema,
})
const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema,
})
export const collections = { docs, guides }
