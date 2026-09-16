import type { APIRoute } from 'astro'
import { loadAiDocs, markdownResponse } from '@/lib/ai-docs'

export async function getStaticPaths() {
  const docs = await loadAiDocs()
  return docs
    .filter((doc) => doc.pathname !== '/docs')
    .map((doc) => ({
      params: { slug: doc.pathname.slice('/docs/'.length) },
      props: { doc },
    }))
}

export const GET: APIRoute = ({ props }) => markdownResponse(props.doc)
