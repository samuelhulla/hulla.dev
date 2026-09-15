# hulla.dev

Samuel Hulla's personal site, package documentation, and the source of the print CV. The site is statically generated with Astro; `@hulla/ui` Astro components own the main interface and a single Solid island owns documentation search.

## Local development

```sh
bun link --cwd ../ui/packages/ui
bun install
bun run dev
```

Use `bun run verify` for the complete site gate. The temporary private dogfood workflow is documented by `bun run ui:sync -- --cli /absolute/path/to/packed/hulla --registry ../ui/generated` and `bun run ui:check -- --cli ... --registry ...`. Neither command adds a tracked `file:` dependency.

`bun run cv:pdf` exports the three-page A4 CV to `output/Samuel Hulla -CV.pdf`; pass `--include-phone` to include the private phone field.

The rendering boundary and island rubric live in `docs/architecture.md`.

The unpublished `@hulla/ui` package is a Bun development link to `../ui/packages/ui`; generated components still come from `../ui/generated`. Keep the sibling checkout available and run the link registration before installing on a new machine. To rebuild the generator itself, run its build in the UI workspace.

Dependencies use current stable releases and are locked in `bun.lock`. TypeScript 7 runs `check:native`; the `typescript` alias supplies the TypeScript 6 compatibility API required by Astro checking, ESLint, and the API audit scripts. `bun run check` runs both checkers. The native checker covers TypeScript and Solid source; the MDX component map imports `.astro` files and is checked by Astro, which understands those files.

## Documentation authoring

Write MDX in `src/content/docs`. The shared route renderer applies `src/components/mdx/components.ts` to every document. Use ordinary fenced code with a language and optional `filename="example.ts"` metadata; the build renders it through the shared code-block composition. Markdown tables and inline code also use installed UI components.

Keep page layout and Markdown classes in `src/styles/site.css`. The CLI owns `src/styles.css` and the generated components. Do not add prose-container descendant selectors or overrides targeting shared component parts.

The current API content still targets `2.0.0-beta.1`. The API coverage and example checks require that matching API revision; they intentionally fail against the redesigned 2.0.0 API until the content is migrated.

## Release guardrail

This rebuild is private local dogfood. Do not push, tag, publish packages, or deploy it until the UI, CLI, and API beta release checks pass and Samuel explicitly authorizes each public step. Before eventual deployment, replace the local UI registry with an immutable public beta tag, install exact beta versions, regenerate with the published CLI, require no meaningful diff, and repeat a clean self-contained production build.
