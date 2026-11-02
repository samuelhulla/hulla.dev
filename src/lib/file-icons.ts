// Site-owned selection. @hulla/ui CodeBlock and Tabs accept arbitrary icon children.
const languages = new Map(
  Object.entries({
    ts: 'typescript',
    typescript: 'typescript',
    mts: 'typescript',
    cts: 'typescript',
    js: 'javascript',
    javascript: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    tsx: 'react',
    jsx: 'react',
    react: 'react',
    astro: 'astro',
    css: 'css',
    scss: 'css',
    less: 'css',
    html: 'html',
    htm: 'html',
    json: 'json',
    jsonc: 'json',
    md: 'markdown',
    mdx: 'markdown',
    markdown: 'markdown',
    rs: 'rust',
    rust: 'rust',
    vue: 'vue',
    svelte: 'svelte',
    py: 'python',
    python: 'python',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'terminal',
    bash: 'terminal',
    shell: 'terminal',
    zsh: 'terminal',
    fish: 'terminal',
    console: 'terminal',
    powershell: 'terminal',
    ps1: 'terminal',
    terminal: 'terminal',
  })
)

export function fileIcon(filename?: string, language?: string) {
  const basename = filename?.split(/[\\/]/).pop()?.toLowerCase() ?? ''
  const extension = basename.match(/\.([^.]+)$/)?.[1]
  return (
    languages.get(extension ?? '') ||
    languages.get(basename) ||
    languages.get(language?.toLowerCase() ?? '') ||
    'file'
  )
}
