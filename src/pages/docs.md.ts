import type { APIRoute } from 'astro'
import { loadAiDocs, markdownResponse } from '@/lib/ai-docs'

export const GET: APIRoute = async () => {
  const docs = await loadAiDocs()
  return markdownResponse(docs[0]!)
}
