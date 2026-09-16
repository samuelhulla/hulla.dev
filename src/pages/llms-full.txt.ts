import type { APIRoute } from 'astro'
import { loadAiDocs, renderLlmsFull } from '@/lib/ai-docs'

export const GET: APIRoute = async () =>
  new Response(renderLlmsFull(await loadAiDocs()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
