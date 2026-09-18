# `@hulla/api` documentation quality guide

This document is the editorial and information-architecture review contract for the
`@hulla/api` documentation. The reusable authoring rules live in
`skills/write-hulla-docs/SKILL.md`; this guide adds the comparison research, the initial audit of
the current API docs, and the standards reviewers should apply page by page.

The goal is not shorter documentation at any cost. The goal is documentation in which every section
helps a reader understand a concept, complete a task, make a choice, verify a result, or avoid a real
failure.

## What the reference docs teach

The following pages are useful for different reasons:

- [Drizzle Kit: `generate`](https://orm.drizzle.team/docs/drizzle-kit-generate) connects a command
  to its inputs, internal sequence, generated files, and common variations. Readers can see what
  changes after they run it.
- [Why Neon?](https://neon.com/docs/get-started/why-neon) explains architectural mechanisms before
  claiming their benefits. Separating compute and storage is defined concretely, then connected to
  scaling, availability, and cost.
- [oRPC: Getting Started](https://orpc.dev/docs/getting-started) names the problem, defines its core
  terms in ordinary language, previews the journey, and completes one end-to-end lifecycle in the
  order a new reader needs it.

Do not copy their visual design or voice. Reuse the underlying techniques:

1. State the page's outcome on the first screen.
2. Give readers a mental model before a large API surface.
3. For task pages, show the shortest complete path before variants.
4. Put explanation beside the code or decision it explains.
5. Show inputs, outputs, ownership, and observable consequences.
6. Move exhaustive lookup material and implementation evidence out of the primary learning path.

## Initial audit of the current API docs

> Audit snapshot: September 16, 2026. Recheck the page and its inbound links before acting on a
> finding. The findings are a rewrite queue, not permanent claims about the site.

The current docs contain a large amount of accurate implementation knowledge. Their main weakness is
not a lack of facts; it is that facts with different readers and purposes are often presented at the
same level.

### Internal evidence appears in reader-facing guides

`reference/adapter-conformance.mdx` documents test harnesses, package tarball checks, CI profiles,
and an integration completion checklist. The final paragraphs of several adapter pages also narrate
conformance suites and packed consumers. That material can help maintainers, but it does not help an
application developer mount the adapter or decide whether its behavior fits their application.

Keep the user-visible consequence: supported representations, host-owned behavior, limits,
cancellation, and known differences. Move commands, suite registration, fixture provenance, and
release evidence to contributor documentation or a clearly labelled maintainer reference.

### Architecture mixes a mental model with an implementation ledger

`reference/architecture.mdx` begins with useful request and response lifecycles, then moves into
caches, internal compilation choices, source-check commands, package dependency ownership, and a
long inventory of every adapter. It competes with `mental-model.mdx` while also trying to record
implementation decisions.

Keep one reader-facing concept page for the lifecycle and boundaries. Put stable public invariants in
reference. Move internal dependency and test architecture into repository documentation.

### Broad pages postpone the reader's next action

`core/servers.mdx` covers the first implementation, request context, native context, middleware,
fragments, composition, shared statuses, adapter execution, request lifetime, and body ownership.
The page is valuable as source material, but a reader looking for their first server must navigate
advanced composition before knowing which parts apply to them.

Split when a section introduces a different task or a different prerequisite. A page should not
remain large merely because all its topics share one top-level export.

### Some pages show syntax without a complete use

Short integration pages such as `servers/nestjs.mdx` show the mount call, then compress dependency
injection, decorators, native context, parsing, streaming, routing, and test evidence into prose.
They do not lead one concrete route from an existing contract through a running host to a client or
observable response.

An integration guide should show where the file lives, what already exists, how the host registers
it, how a consumer reaches it, and which behavior remains owned by the host.

### Dense paragraphs hide independent decisions

Long paragraphs frequently combine defaults, exceptions, ownership boundaries, and verification
notes. Even accurate prose becomes hard to use when a reader cannot tell which sentence answers
their question.

Use:

- a short table for choices compared across the same dimensions;
- a numbered list for a lifecycle or required sequence;
- bullets for independent constraints;
- a subsection when the reader's task changes.

Keep prose when the sentences form one causal explanation. Do not turn a coherent explanation into
decorative bullets.

### Page order sometimes contradicts the journey

`core/contracts.mdx` currently reaches “Next steps” before “Validation direction.” A next-steps
section must close the page. Material after it either belongs earlier or on the linked destination.

Review heading order as information architecture, not formatting. A correct section in the wrong
place is still a documentation defect.

### Repeated integration structure is not yet a shared content model

Server, runtime, and full-stack pages repeat prerequisites, mounting, client use, native context,
errors, and scope. Repetition is acceptable when each page remains self-contained, but identical
boilerplate and internal verification prose make important host differences harder to find.

Use the same reader-question outline across integrations, then spend prose on the differences:
routing, context, parsing, streaming, limits, deployment, and lifecycle ownership.

### Package-manager commands bypass the shared docs component

Some pages hard-code `bun add` even when Bun, npm, pnpm, and Yarn are equivalent. Use
`DocsPackageManagerCommand` for package-manager-bound commands. Keep package-independent CLI
commands as ordinary terminal blocks.

Canonical `@hulla/api` Markdown cannot import the site component directly. Put
`<!-- docs:package-manager -->` immediately before one `sh` fence with `# Bun`, `# npm`,
`# pnpm`, and `# Yarn` commands in that order. The sync script converts that block into
`DocsPackageManagerCommand`; the canonical page remains readable in GitHub and generated Markdown.

## Choose one page job

Classify every page before revising it. Use the detailed models in
`skills/write-hulla-docs/references/editorial-model.md`.

| Page type    | Reader's job                                            | Opening obligation                                   |
| ------------ | ------------------------------------------------------- | ---------------------------------------------------- |
| Introduction | Decide whether the package fits and choose a path       | Problem, promise, boundaries, and next route         |
| Quickstart   | Produce one working result                              | Finished outcome, prerequisites, and step preview    |
| Concept      | Understand a mechanism or boundary                      | Problem resolved and a concrete relationship         |
| Task guide   | Complete one defined operation                          | Who needs it, final result, and starting state       |
| Integration  | Connect `@hulla/api` to another host or tool            | Added capability and ownership on each side          |
| Reference    | Look up an exact option, export, default, or constraint | Scope and the lookup dimensions the page covers      |
| Maintainer   | Verify, release, or extend the implementation           | Intended maintainer, trigger, commands, and evidence |

If two rows describe substantial parts of the same page, propose a split before polishing sentences.
If two pages answer the same reader question, propose a merge and preserve redirect or navigation
behavior.

## Build the page around real reader questions

Before drafting, write down:

- **Reader:** Who is this page for?
- **Situation:** What have they already installed, declared, or understood?
- **Outcome:** What can they do or decide after reading?
- **First mistake:** What are they most likely to misunderstand?
- **Evidence:** What code, response, type narrowing, generated artifact, or host behavior proves the
  explanation?

For task and integration pages, a useful default order is:

1. outcome and prerequisites;
2. smallest complete setup;
3. observable success signal;
4. consequential choices;
5. host or application ownership;
6. failure modes and next decision.

Concept and reference pages should use the page models appropriate to them rather than forcing a
tutorial sequence.

### Protect the first successful path

A quickstart is not a catalogue of valid architectures. Choose one contract shape, one server
implementation style, and one client boundary, then carry that path through to an observable result.
Do not introduce a same-process client and replace it with Fetch later in the same quickstart, or
mount the same implementation through several frameworks to prove portability. Those are next
decisions after the first call works.

The example's domain should be easier than the API concept being taught. A required task title is
enough to demonstrate runtime validation. Slug regexes, duplicate detection, persistence rules,
multi-status branching, transforms, and codecs should appear only on pages whose job is to explain
those features.

Describe completeness locally. “This contract has one route, so the implementation has one
handler” is accurate without suggesting that every application must build one global handler tree.
Point growing applications to fragments and composition after the basic flow is clear.

## Write concrete prose

### Name the actor and the boundary

Prefer:

- “`defineContract()` records the method, path, inputs, and declared responses.”
- “The Express adapter registers the compiled routes on the Express router.”
- “The application configures multipart parsing before the adapter reads the parsed body.”
- “`fetchTransport()` sends one `Request` and decodes the declared response.”

Avoid passive claims that leave ownership unclear, and never use “Hulla” as a standalone software
actor. Name `@hulla/api`, the export, adapter, host framework, or application.

### Replace labels with mechanisms and consequences

Weak:

> The integration provides robust, seamless, production-ready streaming.

Useful:

> The adapter writes each response chunk with the host's native writer and cancels the source stream
> when the client disconnects.

Words such as _powerful_, _robust_, _seamless_, _flexible_, _advanced_, _simple_, _obvious_,
_production-ready_, and _first-class_ are prompts to add evidence or delete the sentence.

### Keep one purpose per paragraph

The first sentence should name the point. The remaining sentences should explain, qualify, or
demonstrate it. Start a new paragraph when the reader's question changes.

A short transition is useful when it explains the relationship between sections. Do not keep an
empty transition merely to make the page sound polished.

Most paragraphs should stop after two or three sentences. This is a pacing heuristic, not a hard
character limit: a fourth sentence is fine when it completes the same causal explanation, but not
when it introduces another default, exception, or ownership boundary.

Alternate explanation with evidence. After introducing an abstraction, show the call, response,
focused line, diff, alert, or decision that makes it concrete before stacking another abstraction
on top.

### Sound like a maintainer, not an inventory

Use direct, situational language: “Use the Fetch adapter when the host already speaks `Request` and
`Response`.” Name tradeoffs and say when an ordinary function or framework-owned client is the
better tool.

Avoid a repeated cadence of “X provides Y,” “This allows,” and “The application owns.” Those phrases
are useful when they resolve a real ambiguity, but mechanical repetition makes correct prose feel
generated. Prefer concrete verbs, contractions where natural, and transitions that follow the
reader's decision.

### Define terms where they become useful

Define contract, selection, implementation, adapter, client, transport, representation, and codec in
the first context where a reader needs each term. Do not alternate through synonyms for variety.

Use the ecosystem name `@hulla/*`, the exact package name when known, and lowercase `hulla` only
for CLI commands.

## Make code prove the explanation

Every example must make these facts discoverable nearby:

1. the file or runtime where it belongs;
2. imports and setup that must already exist;
3. input and observable result;
4. why this API is used instead of the nearest alternative;
5. the boundary crossed: in-process, HTTP, IPC, framework, or generation;
6. the later call or consumer that uses the declared value.

Use real public exports from the installed packages. Verify behavior against implementation, types,
tests, and current package versions. Do not invent a simplified API or a preview-only facsimile.

Keep code copy-ready with two-space indentation. The first example should avoid plugins, converter
internals, opaque metadata, and advanced generic types unless the page is specifically about them.

## Use documentation components to explain, not decorate

The site owns its `@hulla/ui` primitives under `src/components`. Use those components and their
public composition instead of local imitations or custom interactive markup.

### Package-manager commands

Use `DocsPackageManagerCommand` whenever Bun, npm, pnpm, and Yarn perform the same installation or
execution. Do not make the reader translate a Bun-only command.

### Alerts

Use the shared Alert parts when ignoring the message changes the outcome:

- a prerequisite that invalidates the next step;
- a version or runtime constraint;
- a destructive or incompatible action;
- a host behavior that differs from the portable contract.

Place the alert immediately before the affected step. Do not use alerts for ordinary transitions,
marketing claims, or facts already stated in the main prose.

### Tabs

Use shared Tabs only for equivalent ways to complete the same task, such as framework variants. Each
tab must begin from the same state and reach the same outcome. Keep shared explanation outside the
tabs.

Do not hide sequential steps, unrelated topics, or materially different architectures in tabs.

### Collapsibles and accordions

Use the shared Collapsible composition for optional depth that would interrupt the primary task:
uncommon host setup, generated output anatomy, or advanced troubleshooting.

Never hide prerequisites, required steps, default behavior, safety warnings, or information readers
must compare.

### Blockquotes

Use the MDX blockquote component for a short governing invariant or a literal quotation. Routine
notes belong in prose; consequential notes belong in alerts.

### Concept visuals

Use `DocsConceptFlow` for a sequence or lifecycle whose stages are easier to retain visually. Use
`DocsProjectBoundary` only when file placement and browser/server ownership are the concept being
taught. A visual must supplement a textual explanation and expose the same information to assistive
technology.

### Lists and tables

Use numbered lists for order, bullets for parallel constraints, and tables only when every row can
be compared across the same columns. Do not put paragraphs into narrow table cells.

If a cell wraps into a paragraph, the table has stopped being a comparison. Split the material into
subsections or compare fewer, shorter dimensions. A reader should be able to scan a row without
holding several exceptions in working memory.

### Code focus and diffs

Use fence metadata to point at the lines the paragraph discusses. A bare `{3-6}` highlights those
lines; `focus={3-6}` dims the surrounding context; `ins={3-6}` and `del={3-6}` mark an authored
change. `diff` fences infer inserted and deleted lines from their prefixes.

Use one complete block to establish a working baseline. If the next section modifies that baseline,
show only enough context to locate the change and mark the changed lines with a `diff` fence. Follow
the diff with its observable consequence: a different inferred type, an earlier runtime failure, a
new owner, or a different value on the other side of the boundary.

A code block longer than roughly 15 lines must earn its length. Either split it at a real conceptual
boundary, focus the lines that answer the section's question, or turn repeated versions into a
baseline-plus-diff progression. A long copy-ready integration may stay intact, but its registration,
boundary, and first observable call should be focused so readers can scan the lifecycle before
copying it.

Highlights must teach the comparison, not decorate it. Do not mark an import merely because it is
easy to highlight, and do not mark most of a block. When a focused line already carries the point,
do not repeat the entire snippet in prose.

A page with many alerts, tabs, or collapsibles usually has a structure problem. Components should
reduce cognitive work, not turn documentation into a component showcase.

## Decide when to split, merge, or move

Split a page when:

- the primary reader or prerequisite changes;
- a beginner path is interrupted by advanced composition or internals;
- sections answer separate tasks that can be completed independently;
- internal verification or release evidence dominates user behavior.

Merge pages when:

- both explain the same mental model at different levels without a clear lookup boundary;
- one page is too shallow to complete its promised task;
- readers must bounce between them to complete one basic workflow.

Move material out of reader-facing docs when it exists to prove CI coverage, package publication,
source layout, or contributor completion. Preserve the user-facing consequence and link to
maintainer evidence only when readers need to audit it.

Do not reorganize routes in bulk. Rewrite one page or tightly related group, update navigation and
inbound links, and verify redirects or generated group pages before starting the next group.

## Page-level review checklist

### Opening

- Can a reader answer what problem the feature solves?
- Can they tell when to choose it?
- Do they know where the first code belongs?
- Do they know what happens after they run or call it?
- Is the next concept or decision clear?

### Structure

- Does the page have one primary reader and job?
- Are definitions presented before they are required?
- For a task page, is the shortest complete path visible before variants?
- Does “Next steps” actually end the page?
- Should any section split, merge, or move to maintainer docs?

### Accuracy

- Does every claim match current public behavior and released availability?
- Are defaults, errors, side effects, and ownership boundaries explicit?
- Do examples use real exports and real docs components?
- Does the reader see an observable result or success signal?
- Are host-specific differences placed next to the affected step?

### Prose

- Does each paragraph teach, instruct, distinguish, warn, or prove something?
- Can an adjective be replaced by a mechanism or result?
- Are terms and actors named consistently?
- Can a sentence be deleted without losing meaning? If so, delete it.
- Has internal test or release narration leaked into the reader journey?

### Presentation

- Does each component materially improve understanding?
- Is required information visible rather than hidden?
- Are equivalent variants aligned across tabs?
- Does every long code block have a deliberate reading cue, or should it be split?
- When two examples differ by only a few lines, is the second shown as a diff with its consequence?
- Is the page still readable as generated Markdown for LLM and text consumers?

## Incremental rewrite and review workflow

Use this sequence for each page or tightly related page group:

1. Read the current page, its navigation entry, inbound links, public implementation, types, tests,
   and examples that establish its claims.
2. Identify the reader, page type, outcome, first mistake, and evidence.
3. Audit overlap with neighboring pages and propose any split, merge, or move.
4. Draft the outline before rewriting sentences.
5. Write the primary path or concept, then add only the reference and edge cases the page owns.
6. Verify code, links, MDX component use, and generated Markdown output.
7. Run an API-factual review and a separate adversarial editorial review.
8. Run proportional validation:
   - `bunx prettier --check <changed-files>`;
   - `bun run api:check` for API pages and examples;
   - `bun run check` for MDX or component changes;
   - `bun run build` when navigation, rendering, or shared docs components change.

The adversarial reviewer should actively look for padding, hidden assumptions, repeated ideas,
unexplained advanced APIs, misplaced sections, component overuse, and pages that still serve more
than one reader. A draft is not complete merely because it is accurate.

## First rewrite priorities

Use the following order unless new factual dependencies change it:

1. **Completed:** `reference/adapter-conformance.mdx` now compares user-visible adapter behavior;
   CI suites, package checks, and contributor completion evidence were removed from the reader page.
2. **Completed:** `mental-model.mdx` owns the learning journey, while
   `reference/architecture.mdx` is the focused public `@hulla/api/compiler` reference.
3. **Completed:** `core/servers.mdx` now owns the first complete implementation and mounted
   request; `core/server-context.mdx` owns context and middleware; and
   `core/server-composition.mdx` owns handler modules, fragments, and composition.
4. **Completed:** `core/contracts.mdx` now keeps validation choices before final next steps,
   maps route keys to effective endpoints, and sends package setup to the Installation page's
   shared package-manager component.
5. **Completed:** Upgrade short adapter and runtime pages so each completes one real host
   lifecycle; remove test narration that does not change a user's decision.
   - **Completed:** `servers/nestjs.mdx` now carries one request from contract declaration through a
     generated controller and observable HTTP response, then separates the DI path and host-owned
     policy without test-suite narration.
   - **Completed:** `servers/koa.mdx` now carries one request from contract declaration through
     terminal Koa middleware and a real HTTP response, then separates typed state, body ownership,
     and late-stream behavior without maintainer validation commands.
   - **Completed:** `servers/elysia.mdx` now carries one request through Elysia's native router,
     then separates typed host context, request-body ownership, error boundaries, and cancellation
     without repeating the general client tutorial.
   - **Completed:** `servers/express.mdx` now carries one JSON request through native Express
     routing, puts parser and middleware order beside the mount, and distinguishes Express-owned
     middleware failures from adapter errors without unrelated server-listen machinery.
   - **Completed:** `servers/fastify.mdx` now verifies one request through native injection, makes
     plugin encapsulation the central mounting choice, and separates Fastify parsing, schema, and
     error ownership from adapter validation.
   - **Completed:** `servers/hono.mdx` now proves one request through Hono's native router and
     middleware, explains cached-helper versus raw-body ownership, and corrects the boundary between
     adapter failures and Hono's error handler.
   - **Completed:** `servers/h3.mdx` now pins the H3 v2 runtime requirements, verifies one request
     through `app.request()`, explains router parameters and request-body cloning, and corrects the
     boundary between adapter failures and H3's error pipeline.
   - **Completed:** `servers/node-http.mdx` now carries one request through a caller-owned Node
     server, explains catch-all routing and one-shot body ownership, and separates adapter failures
     from connection and server policy.
   - **Completed:** the former combined Cloudflare guide is now focused `runtimes/cloudflare.mdx`
     and `runtimes/cloudflare-pages.mdx` task guides. Workers owns the Module Worker lifecycle;
     Pages owns file routing, contract misses, and static-asset fallback boundaries.
   - **Completed:** `runtimes/aws-lambda.mdx` now proves one payload-v2 event-to-result lifecycle,
     makes custom-domain path mapping and buffered response behavior explicit, and removes the
     repeated general client tutorial.
   - **Completed:** `runtimes/azure-functions.mdx` now proves the native request-to-response
     lifecycle, makes `routePrefix` and contract `basePath` alignment explicit, and documents
     Azure-owned trigger selection, streaming, limits, and cancellation behavior.
   - **Completed:** `runtimes/google-cloud-functions.mdx` now proves one Functions Framework HTTP
     entrypoint, separates the target name from the contract path, and documents raw-body
     precedence, native streaming, cancellation, and response-commit constraints.
   - **Completed:** `runtimes/netlify-functions.mdx` now proves one custom-path request through
     Netlify Dev, separates host routing and parameters from contract routing and parameters, and
     documents Web body ownership, native context, streaming, and background-function boundaries.
   - **Completed:** the former Bun, Deno, and Vercel fixture note is now a durable
     `runtimes/runtime-hosts.mdx` chooser plus focused `runtimes/bun.mdx`, `runtimes/deno.mdx`, and
     `runtimes/vercel.mdx` task guides. The chooser owns the shared Fetch boundary and ownership
     model; each host page owns its actual entrypoint, local success path, routing, permissions, and
     deployment constraints. Internal fixture and CI narration was removed.
6. **Completed:** Review the repeated server, runtime, and full-stack outlines as a family while
   preserving host-specific differences.
   - **Completed:** `full-stack/hybrid-rendering.mdx` is now a focused transport-selection concept
     guide. It compares browser Fetch, colocated in-process calls, framework-owned functions, and
     remote HTTP calls; explains module, credential, middleware, and native-context boundaries; and
     replaces fixture links, test evidence, and framework mini-tutorials with direct task-guide
     routing.
   - **Completed:** the overloaded Next.js guide is now a focused App Router integration page plus
     `full-stack/next-data.mdx`. The first page owns Route Handler mounting, an observable request,
     native context, method constraints, and runtime ownership. The second separates Next Data
     Cache policy and invalidation from Cache Components and browser query caches, with explicit
     Next 15/16 boundaries.
   - **Completed:** `full-stack/react-router.mdx` now establishes the Framework Mode integration
     pattern with a complete resource-route lifecycle, observable read and mutation results, a
     registered colocated loader path, and explicit HTTP, revalidation, native-context, error, and
     fragment boundaries.
   - **Completed:** `full-stack/tanstack-start.mdx` now proves a complete wildcard server-route
     lifecycle, separates external Fetch from application-local server functions and in-process
     calls, preserves Start's isomorphic-loader boundary, and documents native context, method-map,
     error, cache, and fragment ownership without incomplete examples.
   - **Completed:** `full-stack/solid-start.mdx` now proves a complete catch-all API-route lifecycle,
     exports only the contract's actual HTTP methods, and separates browser HTTP from Solid Router
     server queries, actions, and in-process calls. It preserves SolidStart's `HEAD`, native
     `APIEvent`, request-local, error, and fragment boundaries without turning the page into a
     general Solid Router tutorial.
   - **Completed:** the overloaded SvelteKit guide is now a focused endpoint and enhanced-Fetch
     guide plus `full-stack/sveltekit-remote-functions.mdx`. The endpoint page proves a complete
     HTTP lifecycle and preserves static method exports, `HEAD`, `QUERY`, native `RequestEvent`,
     error, and fragment boundaries. The remote-functions page separates SvelteKit's generated
     browser protocol from the adapter's zero-Fetch in-server dispatch and documents experimental
     configuration, validation, status mapping, request context, and prerender constraints.
   - **Completed:** `full-stack/nuxt.mdx` now proves the complete Nitro catch-all route lifecycle,
     including an observable HTTP boundary, a request-aware client, `useAsyncData`, event-driven
     mutations, native H3 context, error ownership, and fragment boundaries. It distinguishes
     Nuxt 3 and Nuxt 4 file placement, removes speculative integration claims, and keeps all
     examples complete and copyable.
   - **Completed:** `full-stack/astro.mdx` now proves a complete on-demand endpoint lifecycle and
     distinguishes browser Fetch, server-rendered in-process calls, and deferred server islands.
     It includes observable responses, correct rest-route and deployment behavior, native Astro
     context, endpoint-only error hooks, and fragment constraints without importing server code
     into browser-reachable modules.
7. **Completed:** the former combined query-library page is now a concise chooser plus focused
   `integrations/tanstack-query.mdx` and `integrations/swr.mdx` task guides. The chooser owns the
   package decision and shared cache-key model; each focused page proves one read, mutation, and
   browser-cache refresh while keeping HTTP statuses, transport failures, cancellation, SSR, and
   server-cache ownership explicit.
8. **Completed:** the overloaded OpenAPI page is now a source-of-truth chooser plus focused export
   and import task guides. Export proves a contract-and-sidecar-to-YAML workflow and separates
   generation from serving, UI, authentication, and deployment. Import proves document-to-contract
   generation, an actual client call, exact drift checking, overwrite behavior, and lossy conversion
   boundaries.
9. **Completed:** the transport landing now compares Fetch, in-process, MessagePort, WebSocket, and
   desktop boundaries by the condition for choosing them and the policy the application still owns.
   `transports/message-port.mdx` and `transports/websocket.mdx` each prove one complete call before
   lifecycle, representation, streaming, and failure details. `transports/desktop-bridges.mdx`
   separates Electron port transfer from Tauri, Dioxus, and custom string relays; it makes the
   application-owned native relay and security boundary explicit and removes internal test
   narration.
10. **Completed:** the migration material is split by reader job and covers the stable 1.x release
    path only. `start/migration.mdx` moves one stable procedure through a shared contract,
    exhaustive implementation, host mount, explicit transport, and observable client result.
    `reference/migration.mdx` is the old-to-new lookup for stable package moves, validation,
    lifecycle, ownership, and query changes. Pre-release beta history is intentionally excluded
    from the user journey.
11. **Completed:** run a corpus-level completion audit after the page-family rewrites instead of
    assuming that individually improved pages form a complete manual.
    - **Completed:** the public-package audit found that `@hulla/api-control` had no focused guide.
      It now has `integrations/control.mdx`, with installation, a complete request, exact `Result`
      outcomes, stream and callback boundaries, and query-library tradeoffs. Navigation,
      installation, export reference, and API coverage point to that guide.
    - **Completed:** the example audit repaired undefined identifiers and contextless fragments in
      client authoring, errors, request representations, and value round trips. Each distinction is
      now attached to a declared contract or an earlier named module, and the examples show an
      observable result where that changes understanding.
    - **Completed:** the short-path audit made Quick start, Fetch, and in-process calls observable
      instead of stopping after construction. Their examples now show the status narrowing and
      output a user should expect.
    - **Completed:** the navigation audit found no orphaned leaf pages or broken internal targets.
      It also removed an apparent duplicate NestJS routing classification by distinguishing native
      controller routing from the framework's unsupported `QUERY` method.
    - **Completed:** remove the remaining maintainer-facing fixture and focused-test narration from
      runtime guides. Direct handler invocation stays only where it gives an application developer
      a useful local verification path.

Treat this queue as a starting hypothesis. Verify each page against the current `@hulla/api`
implementation before editing it.
