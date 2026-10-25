import type { APIRoute } from 'astro'
import { loadAiDocs, markdownResponse } from '@/lib/ai-docs'

export async function getStaticPaths() {
  return (await loadAiDocs())
    .filter((doc) => doc.pathname.startsWith('/guides/'))
    .map((doc) => ({
      params: { slug: doc.pathname.slice('/guides/'.length) },
      props: { doc },
    }))
}
export const GET: APIRoute = ({ props }) => markdownResponse(props.doc)
