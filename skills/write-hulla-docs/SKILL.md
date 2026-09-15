---
name: write-hulla-docs
description: Create or refactor @hulla/* package documentation so readers understand what a feature solves, why to choose it, how it works, and how to use it safely. Use for @hulla/* MDX pages, package introductions, quickstarts, guides, concepts, integration docs, API references, navigation copy, code examples, and docs UI/content audits that must stay faithful to the real @hulla/ui catalog primitives.
---

# Write `@hulla/*` docs

Write for a developer evaluating a tool, not an implementer proving API coverage.

## Workflow

1. Read the public implementation, types, tests, and existing examples that govern the page. Never infer behavior from names alone.
2. Classify the page as introduction, quickstart, concept, task guide, integration, or reference.
3. State the reader's problem and the feature's useful outcome before showing configuration or types.
4. Decide whether the reader needs an explicit purpose cue. When it adds information, add two or three concrete `usefulFor` items to frontmatter and let the shared layout label them for the page type. Omit the cue when the title and opening already make the page's job obvious. Never repeat the items verbatim in the opening paragraph.
5. Follow the page shape in [references/editorial-model.md](references/editorial-model.md).
6. Use the smallest example that proves the page's first promise. Introduce advanced behavior only after the basic mechanism is understood.
7. Explain every example's context: where the code belongs, what must already exist, what it produces, and why the chosen API matters.
8. End with constraints, tradeoffs, or the next decision. Do not finish on an unexplained code block.
9. Verify code against the installed package and run the repository's docs checks.

## Writing rules

- Refer to the ecosystem as `@hulla/*` and prefer the exact package name, such as `@hulla/api` or `@hulla/ui`, whenever it is known.
- Never use “Hulla” as a standalone software noun or actor. Name the package, export, component, adapter, or command responsible for the behavior.
- Reserve lowercase `hulla` for CLI commands, and call it the `hulla` CLI when prose could be ambiguous.
- Prefer “Use X when…” and concrete outcomes over adjectives such as powerful, seamless, robust, frozen, or advanced.
- Make headings answer a reader question or mark a real stage in a workflow. Do not promote disconnected bullet points into sections.
- Explain one new idea per section. Connect it to the previous section with cause and effect.
- Keep the first screen beginner-safe. Move plugin hooks, converter internals, metadata, and edge cases below the primary path unless the page is specifically about them.
- Separate responsibilities explicitly: server code, generated code, client code, build configuration, and framework integration.
- Show the lifecycle of an API, not only its declaration. Pair definitions with the call, rendered result, generated artifact, or later consumer that makes the example useful.
- Prefer “show, then explain” for concepts with observable structure or state. Lead with a compact example, result, comparison, or interactive visual, then name the rule the reader just saw.
- For APIs with meaningful variants, teach them as a progression: simplest valid form, common form, composed form, then constraints.
- Say why an abstraction exists and when not to use it.
- Prefer a short table for choices, a numbered list for a sequence, and bullets for independent constraints.
- Use exact package names, imports, routes, file paths, and expected results.
- Avoid release-process narration, private dogfood notes, source hashes, and internal verification language in reader-facing pages.

## UI fidelity

- Compose docs UI from the installed `@hulla/ui` primitives exactly as catalog examples do.
- Use Lucide icons. Do not substitute dots, letter badges, hand-drawn SVGs, or decorative glyphs when a semantic icon exists.
- Keep product-component styling in the primitive. Limit docs-local CSS to page layout, prose rhythm, and Markdown presentation.
- If docs need behavior the installed component cannot express, verify the catalog and generated source before adding an override.
- Keep code indentation at two spaces and preserve copy-ready source. Use the official language mark for known languages and Lucide for actions, files, or terminal commands.
- Render package-manager-bound commands through the shared persisted package-manager command component. Do not hard-code one package manager when equivalent Bun, npm, pnpm, and Yarn commands exist. Keep package-independent `hulla` CLI commands as ordinary terminal blocks.
- Use real `@hulla/ui` components for compact lifecycle diagrams, comparisons, outcomes, and state changes when they teach a relationship more clearly than prose.
- Use restrained motion to reveal sequence, causality, or state changes. Respect reduced-motion preferences and never animate decoration that does not teach.

## Quality gate

Reject a page if a reader cannot answer all of these after its opening section:

- What problem does this feature solve?
- When should I choose it?
- Where does the shown code live?
- What happens after I run or call it?
- Which concept should I understand next?

Reject empty flavor sections, unsupported claims, duplicate intros, unexplained advanced APIs, and examples that only demonstrate syntax.
