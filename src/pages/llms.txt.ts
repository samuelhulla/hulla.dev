import type { APIRoute } from 'astro'
import { loadAiDocs, renderLlmsTxt } from '@/lib/ai-docs'

export const GET: APIRoute = async () =>
  new Response(renderLlmsTxt(await loadAiDocs()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
