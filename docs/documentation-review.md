# Documentation review — 23 October 2026

The review covers the documentation collection, package navigation, shared page layout,
search/Markdown exports, internal destinations, and the public APIs used in the new examples.
Reference pages remain lookup material. Tutorials lead to an observable result before
introducing alternatives.

## Package coverage

| Package        | Content pages | Main change                                                                             |
| -------------- | ------------: | --------------------------------------------------------------------------------------- |
| @hulla/api     |            57 | Runnable quick start; clearer validation, transport, SSR, and cache explanations.       |
| @hulla/ui      |             4 | Reading-counter tutorial, composition guide, component chooser, and full navigation.    |
| @hulla/gittar  |             4 | Introduction, template-downloader tutorial, cache guide, and public API reference.      |
| @hulla/args    |             8 | Persistent notes CLI, explicit Zod 3 setup, shorter parsing reference.                  |
| @hulla/control |             8 | Config-checker tutorial, runnable quick start, clearer mapping and cleanup behavior.    |
| @hulla/style   |             6 | Rendered button demo, type-helper pitfall, shorter hook reference.                      |
| hulla CLI      |             7 | Component-to-page handoff, visible legacy warning, cache refresh steps.                 |
| @hulla/db      |            24 | Prerequisite card, duplicate Astro setup removed, clearer SSR, auth, and date pitfalls. |

The sibling `ci` checkout is private and contains unfinished hook code, without a usable
consumer entrypoint. The sibling `test` checkout contains project tooling, not a public
package. Neither has been presented as an installable library.

## Editorial and structure decisions

- Give build-along projects their own `/guides/...` pages and sidebar list. Keep concept,
  integration, and reference pages in Docs; cross-link them without listing a page twice.
- Link section headings, prerequisites, and concepts where readers need them. Keep a collapsible
  page outline available below the width where the right contents rail disappears.
- Split paragraphs that combine unrelated defaults, exceptions, and lifecycle rules.
- Compose tutorial setup and callouts from Alert, Card, Stepper, and navigation parts.
  The coordinated typography pass adds an optional shared prose stylesheet in `../ui`
  and generates it for Astro, React, and Solid. Markdown uses ordinary paragraph and list
  elements inside a prose container; component boundaries preserve shared UI styling.
- Preserve the setup and callout meaning in the Markdown/LLM editions.
- Mirror mapped API prose edits in the canonical `api/docs` guides. Preserve unrelated
  upstream working changes; do not run a bulk sync over curated website examples.

## Opening review

Reviewed the title, description, and first paragraphs of all 118 content pages, plus the
generated navigation pages. Rewrote openings that repeated the hero, listed technical
responsibilities, or led with secondary details. Kept direct explanations that already worked.

The server/browser page now starts with two clients and when to use them. Its credentials and
context caveats follow those examples. Runtime version requirements sit in installation sections;
the argument-casing warning sits beside matching options; the OpenAPI overwrite warning sits
beside the generation command. The CLI's legacy API warning stays at the top because it determines
whether that page applies.

Tutorial setup cards show prerequisites without repeating the promised outcome. Catalog copy
matches the page descriptions, and the authoring guidance distinguishes a good opening from the
information that must appear somewhere in the complete page.

## Verification

- Extracted and ran the config, notes, style, and API tutorial files, including failure paths.
  Their strict TypeScript checks passed against local package declarations. The args example
  needs Zod 3; Zod 4 produced overload errors with that release's declarations.
- Checked the reading-counter's pointer and keyboard interactions in an isolated Astro app.
  The style demo also bundled from its documented HTML entrypoint.
- Checked tutorial layouts at phone and desktop widths, including light/dark contrast and
  horizontal overflow. These were temporary checks, not a new permanent browser matrix.
- Site builds, Markdown exports, UI integrity, API coverage/example checks, and an isolated
  self-contained build passed during the review. Routine `verify` now builds once; optional
  browser and sibling-package audits remain separate, following the coordinated test cleanup.
- `bun run docs:links` validates page, section, and Markdown targets throughout the built
  documentation and guides. The content has 108 documentation pages and 10 tutorials.

PostgreSQL-backed examples need a provisioned database and native runtime to execute.
Their editorial review and build checks do not replace that integration test. The template
downloader's extraction, cache reuse, metadata, and subdirectory-copy checks passed with a local
archive. Live provider availability and credentials remain environment-specific.
