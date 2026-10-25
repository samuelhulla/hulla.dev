# Package positioning and demonstration notes

Reviewed 23 October 2026. This pass covers the package explorer, the home and docs catalogs, and package introduction descriptions.

## What the product pages demonstrate

[tRPC](https://trpc.io/) makes its type-safety benefit concrete by showing what happens to a client when server code changes. [oRPC](https://orpc.dev/) connects individual features to paired server/client examples and offers playgrounds. [Convex](https://www.convex.dev/demos) lets visitors modify code and interact with views and data in a browser test runtime. [shadcn/ui](https://ui.shadcn.com/) puts usable compositions of its components immediately below its introduction.

The useful pattern is a specific job, one interaction that makes the result visible, and a path into a working example. The site uses those ideas with different presentations for different jobs: direct navigation in docs, optional previews in the switcher, and visible feature stories on the homepage.

## Navigation and discovery are different jobs

[Linear](https://linear.app/) pairs large feature headings with workflow scenes and a nearby product link. [Convex](https://www.convex.dev/) puts documentation and getting started links near its opening pitch, then demonstrates specific behaviors. These are hierarchy references, not control styling templates.

- The switcher opens to a searchable, compact directory. Package names are normal links to docs; Enter navigates directly and arrow keys move between results. A separate Preview button is opt-in.
- Preview mode keeps a named documentation link in its sticky header. Changing packages updates that destination. Back returns to the filtered directory and restores focus.
- The homepage uses open feature sections with large headings, full project and inventory stages, and visible documentation links before the examples. It does not embed the switcher's tabbed layout.
- The docs landing page is a direct-link package directory. Discovery must not block a visitor who already knows which package they want.

## Direct manipulation, not preset-only demonstrations

The workspaces use readable 14px code and labels, with 16px primary output. Preset buttons are optional shortcuts that load source; visitors can write other values and logic themselves. CodeMirror supplies syntax highlighting, editing history, selection, line numbers, and inline compiler diagnostics. The installed `@hulla/ui` registry has read-only Astro code blocks but no editable-code primitive, so `DemoEditor` is a site-owned adapter using shared tokens. Shared Button and Input variants are unchanged.

- API accepts arbitrary edits to three files. A debounced real TypeScript worker checks the whole virtual project and returns actual error offsets to the editor. File buttons navigate files; they do not select a set of simulated outcomes.
- Style runs the edited TypeScript module in a disposable worker with installed `@hulla/style` and `cn` modules. Syntax and runtime failures preserve the last working preview. A three-second deadline stops runaway code. Optional timing invokes the exported `compose()` function 10,000 times and consumes its output; no cross-library speed claim is made. Preview classes use the site's installed CSS.
- DB keeps distinct database and subscribed-client snapshots. Browser message ports carry client commands to server-side validation in the local model, then carry committed snapshots back. Both table cells and client product names are editable; client purchases change database stock. Revision checks prevent stale snapshots, drafts protect in-progress typing, and a reset discards queued operations from its previous epoch. The labeled relationship bar and last-write path make the direction visible. This is a local model of writes through the server boundary, not a live PostgreSQL connection or proof of raw-SQL change detection.
- Control edits actual JSON config, args accepts command text, CLI edits an install command, and gittar edits JSON download options in a bounded local template model. Invalid edits produce output from their actual validator or modeled command parser. They do not merely switch a display between canned values.

## The standard for each example

Start with the largest practical win, then choose an input that exposes it. A button changing state is not enough evidence by itself. The visitor should be able to see what work disappeared, what error was caught, or which consumers followed one change.

- API: change the shared response shape and find the broken handler and caller before a request is sent. Real compiler diagnostics are useful feedback for a developer or a coding agent.
- Style: a variant helper and a class helper can apply different composition rules in the same codebase. Show one configured processor acting inside `vn()` and at the final `cn()` boundary, with independently composed tone and spacing maps. Change a shared definition across three consumers. Measure real local work rather than claim a speed advantage without a comparison benchmark.
- DB: edit the database table and watch subscribed availability change; buy or rename a product in the client and watch the committed table update through the server boundary.
- UI: use an actual component composition to add and complete release tasks, including keyboard navigation through the form.
- Control: turn a thrown syntax error and an expected domain failure into the same explicit result boundary; show the later work that was not reached.
- Args: distinguish invalid values from omitted options, show number coercion, and keep raw/detected metadata available for application-owned policy.
- Gittar: create independent editable projects from a shared cached snapshot; editing the first copy must not pollute the next starter.
- CLI: make the install command and source ownership tangible through framework-specific component paths.

## Competitor reference and demonstrated value

These are overlapping tools, not feature-exclusive claims. Third-party pages inform hierarchy and the kind of evidence to show. Controls remain the site's source-owned `@hulla/ui` primitives.

| Package          | Reference                                                                                                                                       | What the example proves                                                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@hulla/api`     | [tRPC](https://trpc.io/), [oRPC](https://orpc.dev/docs/contract-first)                                                                          | Arbitrary editable project source is checked by a real TypeScript worker. A contract rename can produce TS2353 in the handler and TS2339 in the client; fixing either file updates the diagnostics.        |
| `@hulla/style`   | [CVA variants](https://cva.style/docs/getting-started/variants), [CVA composition](https://cva.style/docs/getting-started/composing-components) | Installed `vn()` and `cn()` share a configured processor. Trace conflicting padding inside a variant and at the caller override, change three consumers together, and measure 10,000 compositions locally. |
| `@hulla/db`      | [Convex demos](https://www.convex.dev/demos), [Drizzle](https://orm.drizzle.team/)                                                              | Separate editable table and client snapshots exchange validated writes and committed results through a local server model. The real package retains PostgreSQL and reruns affected declared queries.       |
| `@hulla/ui`      | [shadcn/ui](https://ui.shadcn.com/)                                                                                                             | A working release checklist uses the installed Solid components and their standard form and keyboard behavior.                                                                                             |
| `@hulla/control` | [neverthrow](https://github.com/supermacro/neverthrow)                                                                                          | The published package converts parsing exceptions to results and keeps explicit validation failures out of subsequent work.                                                                                |
| `@hulla/args`    | [Commander](https://github.com/tj/commander.js), [citty](https://github.com/unjs/citty)                                                         | The published parser + Zod reject a bad port, coerce a valid one to a number, and preserve omission metadata for a caller-chosen fallback.                                                                 |
| `@hulla/gittar`  | [giget](https://github.com/unjs/giget)                                                                                                          | A local filesystem model separates cached templates from editable project copies. Selecting a folder reduces copied files, not the repository download size.                                               |
| `hulla` CLI      | [shadcn CLI](https://ui.shadcn.com/docs/cli)                                                                                                    | A command preview exposes the framework-specific component source that will enter a configured project.                                                                                                    |

## Execution boundaries

The interactive logic is shared by optional picker previews, homepage feature stages, and package introductions. The docs catalog is a directory of direct links. Each example identifies its boundary; Markdown exports preserve it too.

- The API example runs the installed TypeScript compiler in an on-demand Web Worker. It checks three user-editable in-memory files against real declaration files emitted from the canonical `@hulla/api` source. It does not execute the package runtime, make an API request, or call an AI agent. Example shortcuts load project source and check it again; users can also repair the source directly. The compiler asset is not requested until the visitor starts checking.
- `scripts/sync-demo-api-types.mjs` refreshes the checked-in declaration snapshot. The snapshot records package version and a SHA-256 of the input source and includes Standard Schema declarations. Normal builds require no sibling repositories. License notices live beside the snapshot. Refresh this fixture when the demonstrated API changes.
- Style executes installed `@hulla/style` and the site's installed `cn` Tailwind composer. Its timing measures one browser run, includes output consumption, and is not a cross-library benchmark or a production latency promise. Default `@hulla/style` deduplicates exact tokens; Tailwind-aware conflict resolution comes from the configured optional composer.
- Control runs published `@hulla/control@0.0.3` using `tcf`, `ok`, `err`, narrowing, and `match`. It does not assume unreleased mapping methods exist in that published version.
- Args runs published `@hulla/args@0.0.4` and Zod. The input is explicitly space-separated tokens, not a shell parser. Nothing starts a server.
- UI runs the installed Solid controls in a working form.
- DB uses distinct local database and client snapshots connected by message ports to model committed writes and subscribed query results. There is no PostgreSQL connection or multi-user service. The guide covers the real runtime and deployment requirements.
- Gittar models the filesystem workflow locally. No repository is downloaded and no project files are written. The real tool needs Bun and its documented system tools.
- CLI generates an install-plan preview. It does not run a command, copy files, or promise an automatic merge of future upstream changes.
