---
name: update-hulla-docs
description: Assess documentation impact for an @hulla/* package change or PR and prepare the matching hulla.dev documentation update. Use when asked to document package changes, prepare or link a website docs PR, or explain why website docs are unnecessary.
---

# Update website docs for an `@hulla/*` change

Produce a focused website documentation update tied to the package change, or a concrete explanation that no website change is needed. A docs PR is an advisory review convention, not a release or merge gate.

## Establish the change

- Start from the supplied package PR, branch, commit range, or working diff. Verify the actual head and base instead of assuming that the checkout is the PR head.
- Read the affected public API, tests, examples, and existing documentation. Package version labels alone do not determine documentation impact: a patch can change behavior that readers need to know about.
- Locate the website checkout through the workspace or its remote `samuelhulla/hulla.dev`. Read its instructions and `skills/write-hulla-docs/SKILL.md` for its editorial and component conventions when available.

## Decide whether docs help

Changes to public APIs, configuration, defaults, observable behavior, support requirements, installation, or examples usually need documentation. Internal refactors, tests, CI changes, and fixes that restore already documented behavior often do not.

If the current docs remain correct and sufficient, give a specific reason and a ready-to-paste entry for the package PR, such as `No website docs change needed: restores the documented retry behavior without changing the API.` Do not create an empty or cosmetic docs PR merely to tick a box. Honor an explicit request for additional explanation even when the change would not normally require it.

## Prepare the smallest useful update

- Find the existing page and update the affected explanation and example. Create a page only when the information has no suitable home; check the site's navigation/data model when adding one. Use the exact package name, including the `hulla` CLI where appropriate.
- Verify the website's `scripts/sync-api-docs.mjs` mapping before editing an API guide. For mapped pages, update the canonical package guide as part of the package change and derive the corresponding website MDX so a future release sync does not undo the change. Run the importer in an isolated directory if it would rewrite unrelated or curated work, then bring back only the intended pages. Curated pages outside the mapping remain owned by the site.
- Describe behavior and availability accurately. Do not imply that an unreleased feature is already available from the current stable package. Keep rollout details, package-PR links, and verification notes in the PR description rather than reader-facing prose unless readers need a version requirement.
- Exercise real public components and APIs in examples. Follow the website's existing writing skill for source fidelity and presentation; avoid fabricated previews and unnecessary visual redesign.
- Validate proportionally: formatting, relevant links/navigation, and the changed examples. Build the site for MDX or rendering changes when dependencies are available. Do not run every sibling package's checks or benchmarks for a prose update. Report checks that could not be run without claiming success.

## Deliver and link

Follow the user's requested output and current Git authorization. For a local docs edit, return the changed files and documentation decision. When a docs PR is requested, create a draft PR in `samuelhulla/hulla.dev` using an isolated branch if the checkout contains other work; include a link to the package PR, consumer-facing impact, and validation. Return its URL for the package PR's Website documentation section.

When the user requests linking the PRs, update only the package PR's documentation section, preserving its other content. When no website update is needed, fill the reason instead. Do not merge, publish, or alter repository protection settings as part of this skill.
