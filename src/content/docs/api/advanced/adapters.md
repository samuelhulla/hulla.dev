---
title: Adapters
---

Adapters are a way of extending your exported API functionality with custom functions that execute on top of your defined router.

There are many options as to what you can do with an adapter, some of the use-cases include:

- Modifying calls to mutate result or arguments
- Extending functionality of existing calls _(like [query integration](/docs/api/integrations/query) or [swr integration](/docs/api/integrations/swr))_
- Adding middleware
- Adding constants

## Declaration & Usage

Adapters are defined as second argument of the [create](create) functionality.

```ts
import { api } from '@hulla/api'

const a = api()
const router = a.router({ name: 'example', routes: [] })
const withAdapters = a.create(router, { logRouterName: (adapter) => () => console.log(adapter.routerName) })

withAdapters.logRouterName() // 'example'
```

## Router Adapter API

One thing that warrants a special mention is the fact, that router contains __not only all of the methods of your [created API](/docs/api/core-concepts/create)__, but also the following internal methods, that can help you write more effective adapters:

- `find` - utility function that returns a `{ route: string, call: Function }` object.
- `invoke` - utility function, call `find` and invokes the function with args and any possible [interceptors](interceptors)
- `mappedRouter` - nested object that encodes individual methods with functions - i.e. `{ call: { foo: Function }}`

Check out the [Adapter API Reference](/docs/api/reference/adapters) for more info

## Adapter declaration syntax

If you studied the initial example with a keen eye, you may have noticed, that the adapter `logRouterName` is a curried callback - a function that returns a function. This is intentional, to prevent a common mistake a lot of people make when writing their adapters. Consider this:

```ts
const usersAPI = a.create(router, { isAuthenticated: (_adapter) => db.auth() }) // 😱 DON'T DO THIS
// note we don't need adapter arg here, just making it explicit it's available if necessary
```

Looks relatively ok on first glance, and you'd expect it to work as `usersAPI.isAuthenticated // boolean`  but this is actually a mistake! Adapters are executed at the `create` call with the passed router and this means, every time you tried using `usersAPI` it would execute the `db.auth()`, which could potentially be an issue, especially if you are using it inside client JSX that continually hydrates. For this reason, the line above actually  __a type error__!

The proper way to do this would be:

```ts
const usersAPI = a.create(router, { isAuthenticated: (_adapter) => () => db.auth() })
//                                      note the extra callback here ^
```

Now instead of ~~`usersAPI.isAuthenticated`~~ we call `usersAPI.isAuthenticated()` - this executed the `db.auth()` only when we need it to, instead of every time the `usersAPI` is accessed.

## Declaring constants (override)

As mentioned, you will get a type error if you attempt to create a constant instead of curried function.

This is to prevent you some pesky hydration errors and racking up your cloud service provider bills. That being said, if you despite the warnings want to override this, the package does give you the power to do it.

```ts
// @ts-expect-error i know what i'm doing and am aware it will run on every call
const your = a.create(router, { FAVORITE_PACKAGE: () => '@hulla/api' })

your.FAVORITE_PACKAGE // '@hulla/api'
```
