---
title: 'Installation'
---

Installing `@hulla/api` is super simple. It has 0 dependencies and works pretty much anywhere.

| Package manager | Command                                                               |
| --------------- | --------------------------------------------------------------------- |
| `pnpm`          | `pnpm add @hulla/api`                                                 |
| `bun`           | `bun add @hulla/api`                                                  |
| `yarn`          | `yarn add @hulla/api`                                                 |
| `npm`           | `npm install @hulla/api`                                              |
| `deno`          | `import { api } from 'https://deno.land/x/hulla_api@v1.0.4/index.ts'` |

And we're good to go! 🚀

## Where to next?

If you're not sure where to start, either check the [Quick start](quickstart) or check out the Guide section.<br/>
At the very least you'll need to understand the following:

1. [Procedure](/docs/api/core-concepts/procedures)
2. [Router](/docs/api/core-concepts/router)
3. [Create API](/docs/api/core-concepts/create)

Or if you are familiar with api/rpc managers, feel free to check specific examples straight away.

## Example reference

| Library/Framework/Package           | Server | Client |
| ----------------------------------- | ------ | ------ |
| [React](react)                      | ✅     | ✅     |
| [Solid](solid)                      | ✅     | ✅     |
| [Vue (Nuxt)](vue)                   | ✅     | ✅     |
| [Astro](astro)                      | ✅     | ✅     |
| [@tanstack/query](query)            | N/A    | ✅     |
| [swr](swr)                          | N/A    | ✅     |
| [Express/Node/Bun/Hono/...](server) | ✅     | N/A    |
| [Remix](remix)                      | ✅     | ✅     |
| [Next](next)                        | ✅     | ✅     |
| [React Native](native)              | N/A    | ✅     |
