# hulla.dev repository guidance

## UI composition

- Treat the components under `src/components` as the source-owned `@hulla/ui` design system for this site.
- Before creating or styling an interactive control, search the existing `@hulla/ui` components and composition utilities and use the closest available primitive.
- Preserve a shared component's standard variants, spacing, states, and accessibility behavior. Prefer composition and documented props over recreating the control with site-specific markup or CSS.
- Add a site-specific control only when no suitable `@hulla/ui` primitive exists. Build it from shared tokens and utilities, and keep the custom styling narrowly scoped to site layout or branding.
- Third-party sites may inform information architecture and hierarchy, but do not copy their control styling in a way that bypasses the `@hulla/ui` system.
