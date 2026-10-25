import type { APIRoute } from 'astro'
import { loadAiDocs, markdownResponse } from '@/lib/ai-docs'

export const GET: APIRoute = async () =>
  markdownResponse(
    (await loadAiDocs()).find((doc) => doc.pathname === '/guides')!
  )
