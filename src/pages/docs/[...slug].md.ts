import type { APIRoute } from 'astro'
import { guides } from '@/data/guides'
import { loadAiDocs, markdownResponse } from '@/lib/ai-docs'

export async function getStaticPaths() {
  const docs = await loadAiDocs()
  return [
    ...docs
      .filter((doc) => doc.pathname.startsWith('/docs/'))
      .map((doc) => ({
        params: { slug: doc.pathname.slice('/docs/'.length) },
        props: { doc },
      })),
    // Keep existing Markdown links readable without listing aliases in navigation.
    ...guides.map((guide) => ({
      params: { slug: guide.id },
      props: { doc: docs.find((doc) => doc.pathname === guide.href)! },
    })),
  ]
}

export const GET: APIRoute = ({ props }) => markdownResponse(props.doc)
