# Site architecture

The site renders static Astro HTML. The homepage, docs index, and shared layouts are rebuilt around CLI-installed `@hulla/ui` source. The printable CV remains independent of the site shell.

## Shared design

`src/styles.css` and the installed component/support files belong to the UI generator. Do not add site rules there. `src/styles/site.css` owns page layout and explicit Markdown classes; it must not target shared `data-slot` parts or change component appearance. Compose public variants and put layout constraints on surrounding wrappers.

Run `bun run ui:sync --cli ../cli/dist/bin.js` against a built CLI and the configured local registry. Run `bun run ui:check --cli ../cli/dist/bin.js` to compare an isolated regeneration, including the shared theme. Production builds do not import sibling repositories.

## Markdown rendering

Author documentation in `src/content/docs`. `src/pages/docs/[...slug].astro` renders the collection with the single map in `src/components/mdx/components.ts`; existing API URLs are preserved. Group indexes come from `src/data/docs.ts`.

Paragraphs, headings, links, and lists receive their own explicit Markdown classes. No typography is applied to the content container or arbitrary descendants. Inline code, tables, and table-of-contents sections use shared components. Heading IDs remain available as fragment targets.

`remarkDocsCode` converts fenced code to `DocsCodeBlock` at build time. Use a language after the opening fence and optional `filename="example.ts"` metadata. Unknown languages fall back to plain code. Explicit `DocsCodeBlock` remains available for compositions. Highlighting runs at build time; only clipboard behavior reaches the browser.

## Interaction

Tabs, dialogs, navigation, and table-of-contents tracking use the generated controllers. Small scripts handle theme persistence, clipboard feedback, and synchronized package-manager preferences. The only Solid island is search (`client:load`), which loads Pagefind on demand and supports keyboard selection. The homepage and CV do not hydrate Solid.

The UI docs page contains the same composition in ordinary content and a Markdown blockquote, providing a browser fixture for inherited-style regression checks. Existing route, accessibility, search, navigation, and CV tests accompany the rebuild.
