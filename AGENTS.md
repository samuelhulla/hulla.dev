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
