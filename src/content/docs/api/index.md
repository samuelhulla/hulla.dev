---
title: '@hulla/api'
name: 'About'
---

Welcome to the documentation of `@hulla/api`.

If you want to get started straight away and don't need motivation why to use the package, nor the comparisons with similar packages, feel free to proceed to the [Installation](api/getting-started/installation) page instead!

## About

What is it?

- RPC manager that organizes API _(or any other calls)_ for you ✅
- Platform agnostic - client, server, serverless or all of the combined? No problem! 💎
- Framework agnostic - will work in any _(js/ts based)_ language/library/framework.🏆
- An advanced typescript checker enforcing best practices and prevents mistakes 🦸
- Minimal - [97.7% smaller than comparable packages](#caveat-package-size) _(with same/better functionality)_ 🤯
- Extensible - Comes with official [integrations](api/integrations), or allows you to even create your own [methods](/docs/api/advanced/custom) & [adapters](/docs/api/advanced/adapters) 🧩

What is it not?

- **A fetching/back-end tool**. It does not implement any new nor override any native methods or fetching logic - how your data is fetchied is up to you to define in your [procedures](api/core-concepts/procedures). However there are solutions to some most common patterns like [requests](api/integrations/requests), [@tanstack/query](api/integrations/query), [swr](api/integrations/swr) -- check out the list of [integrations](api/integrations) or even writing your [custom methods](api/advanced/custom) & [adapters](api/advanced/adapters). Think of it as a tool that helps you organize and scale your API, not as a tool that implements fetching/caching or helps you write back-end.
- **A documentation tool**. It does not generate any openAPI / swagger docs. It simply is a manager and expects that you already have these defined. _If you're looking into generating them, check out my other package: [`@hulla/docs`](/docs/docs)_

## Comparison

| Functionality                 | `@hulla/api` | `@trpc` | `axios` | `superagent` |
| ----------------------------- | ------------ | ------- | ------- | ------------ |
| Bundle size (minified)        | 1.2 KB       | 31 KB   | 52 KB   | 138 KB       |
| Framework agnostic            | ✅           | ✅      | ✅      | ✅           |
| Type-safe                     | ✅           | ✅      | ❌      | ❌           |
| Server actions                | ✅           | ❌      | ❌      | ❌           |
| Requests                      | ✅           | ✅      | ✅      | ✅           |
| Procedures                    | ✅           | ✅      | ❌      | ❌           |
| Integrations/Adapters         | ✅           | ✅      | ❌      | ❌           |
| Middleware                    | ✅           | ✅      | ❌      | ❌           |
| Interceptors                  | ✅           | ❌      | ✅      | ❌           |
| Native                        | ✅           | ❌      | ❌      | ❌           |
| Dependencies                  | 0            | 0       | 3       | 9            |
| Learning curve _(subjective)_ | Medium       | Hard    | Medium  | Easy         |

<p class="text-xs text-right">- Last updated: 25.5.2024</p>

## Motivation

Fetching has been a mess for the longest time in JavaScript. So much so, that entire languages and frameworks have been built around primarily improving handling and organization of the calls.
Over the past decade, we've made huge strides towards first adding api management (`axios`) which helped immensly, but was too big and lacked type safety.

Then came `@trpc`, which addressed most of my gripes with axios. For some time, it was the perfect solution. However technology always progresses without compromise and with the invention of server components and actions,
trpc has become "not very compatible" _(due to no fault of it's own)_. And now making it work with server actions and client has become a head-ache

When creating the package, I've set the following goals:

- Must be framework/library agnostic
- Must be easy to learn _(within minutes)_
- Must be 100% type-safe _(on par with trpc)_
- Must have server-actions first approach
- Must improve DX _(on both client and server)_
- Must reduce the package size bloat _(minimal but extensible)_

## Caveat: Package size

You may call it boasting. But size matters! _At least when it comes to your javascript bundles_ 😅
So how come the package size is so drastically different when the package claims to do as much as similar tooling?

1. Advanced type inferrence. Essentially we let the types (0 KB when served to client) do the heavy lifting instead of the JavaScript.
2. The package is not bloated with "swiss-knife" approaches that aim to do too much and must be bundled even though 90% of times you don't need them. The philosophy when creating the package was to keep it minimal but extensible.
3. It does not implement any special "package-isms" that override behaviour. It's just pure TypeScript built on top of `Functions` and `Promises`. How you define your procedures is up to you.

For full disclosure, the core of `@hulla/api` does not provide any "extra fetching logic" which is part of both trpc and axios. If you've read [motivation](#motivation) section, one of my goals was to make the package minimal but extensible. You can still
do fetch calls with just [procedures](/docs/api/core-concepts/procedures) just fine, but I guess if you want to be truly pedantic, the recommended [integration for requests](/docs/api/integrations/requests) -- `@hulla/api-request` comes in at whopping 1.3 KB. So even with that included _(2.5 KB combined)_, it's still 95.19% smaller than axios, or 91.94% smaller than trpc.
