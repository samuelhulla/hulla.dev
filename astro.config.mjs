import mdx from '@astrojs/mdx'
import { unified } from '@astrojs/markdown-remark'
import solid from '@astrojs/solid-js'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { remarkDocsCode } from './src/lib/remark-docs-code'
export default defineConfig({
  site: 'https://hulla.dev',
  output: 'static',
  trailingSlash: 'never',
  integrations: [mdx(), solid()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkDocsCode] }),
    syntaxHighlight: false,
  },
  prefetch: true,
  vite: { plugins: [tailwindcss()] },
})
