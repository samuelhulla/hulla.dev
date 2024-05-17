import { CATEGORIES } from '@/lib/constants'
import { defineCollection, z } from 'astro:content'

const docsSchema = z.object({
  title: z.string(),
  category: z.enum(CATEGORIES).default('Getting Started'),
  name: z.string().optional(),
})

export const collections = {
  docs: defineCollection({ type: 'content', schema: docsSchema }),
}
