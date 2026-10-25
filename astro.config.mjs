import mdx from '@astrojs/mdx'
import { unified } from '@astrojs/markdown-remark'
import solid from '@astrojs/solid-js'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { guideRedirects } from './src/data/guides'
import { remarkDocsCallouts } from './src/lib/remark-docs-callouts'
import { remarkDocsCode } from './src/lib/remark-docs-code'
export default defineConfig({
  site: 'https://hulla.dev',
  output: 'static',
  redirects: guideRedirects,
  trailingSlash: 'never',
  integrations: [mdx(), solid()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkDocsCallouts, remarkDocsCode] }),
    syntaxHighlight: false,
  },
  prefetch: true,
  vite: { plugins: [tailwindcss()] },
})
