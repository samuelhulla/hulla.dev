# hulla.dev repository guidance

## UI composition

- Treat the components under `src/components` as the source-owned `@hulla/ui` design system for this site.
- Before creating or styling an interactive control, search the existing `@hulla/ui` components and composition utilities and use the closest available primitive.
- Preserve a shared component's standard variants, spacing, states, and accessibility behavior. Prefer composition and documented props over recreating the control with site-specific markup or CSS.
- Add a site-specific control only when no suitable `@hulla/ui` primitive exists. Build it from shared tokens and utilities, and keep the custom styling narrowly scoped to site layout or branding.
- Third-party sites may inform information architecture and hierarchy, but do not copy their control styling in a way that bypasses the `@hulla/ui` system.

## Coordinate shared UI changes

- Always coordinate changes to shared UI components, behavior, props, or theme styles with the sibling `../ui` repository. Updating the UI implementation in `hulla.dev` includes updating its canonical `@hulla/ui` source in the same task.
- Read the applicable `AGENTS.md` instructions in `../ui` before editing it. Author shared changes under `../ui/packages/components/src`, keep supported frameworks consistent, and update the relevant UI catalog examples and documentation.
- Run the UI generator to refresh `../ui/generated`; do not edit generated registry output directly. Sync the affected generated components and support files into this site, preserving its formatting and unrelated local work.
- Run the relevant UI checks and this site's `bun run ui:check` to confirm that canonical sources, generated registry output, and installed site components agree before handing off.
- Keep site-specific layout and branding changes local. If the canonical UI checkout is unavailable or cannot be updated, report the blocker explicitly rather than treating a site-only shared-component change as complete.

## Test quality and footprint

- Retain a test only when it protects intended package behavior, a meaningful public contract, or a plausible bug with an observable consequence. Identify that risk before adding coverage; a file changing is not sufficient reason to add a test.
- Prefer the cheapest effective test through the real API. Exact return values are useful when they express a contract, such as parsing, serialization, or error handling; merely recording current output, constants, trivial getters, or fixture values is not.
- Give each failure mode one primary test. Extend an existing scenario instead of repeating setup, generation, builds, or process startup. Keep coverage at additional layers only for distinct integration or runtime risks.
- Assert behavior with independent expectations. Avoid implementation-mirroring tests, source-text or class-name checks standing in for behavior, self-generated expected fixtures, and assertions that only prove a mock does what it was configured to do. Compile-time tests must actually check types.
- Temporary tests and scratch checks are welcome during investigation. Remove them, their fixtures, and any supporting setup before handoff unless they meet the same criteria as permanent regression coverage.
- For bug fixes, prefer a focused regression that fails with the bug and passes with the fix. Name the behavior and failure condition clearly; explain the risk in the change summary when it is not obvious.
- When cleaning tests, identify the redundant coverage or missing behavioral intent. Preserve distinct failure paths and public type contracts; test count and runtime alone do not justify deletion.
- Run checks appropriate to the changed behavior and report their results. Do not add permanent tests, dependencies, or CI work merely to validate a reversible edit or increase coverage numbers.
