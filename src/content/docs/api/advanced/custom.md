---
title: Custom Methods
---

Custom methods are an advanced concept for creating your own methods that define routes in the [router](/docs/api/core-concepts/router).

## What are methods?

They are a way intreracting with your router calls. Each defined route call has it's specified method.
For example, each [procedure](/docs/api/core-concepts/procedures) has a hard-coded method under the hood with value `call`

This method is the user-facing way of invoking individual procedures

```ts
myAPI.call(...) // method === 'call' (accessing procedure)
```

If you're familiar with the [request](/docs/api/integrations/requests) integration, each exported method of `request` is a specific HTTP method,
i.e.

```ts
routes: [
  request.get(...) // method === 'get'
]
// later:
myAPI.get(...) // accessing method 'get'
```

## Usage

Defining custom methods can be quite simple when you just want to change the method, but can get relatively complex once you need to create
your own method creation syntax like `procedure`.

### When you just want to change the method

The package exports a utility function called `method` that helps you override your methods

It takes two arguments:

1. Name of the `method` _(`string`)_
2. The route to override method of (i.e. `procedure`)

```ts
import { api, method } from '@hulla/api'

const a = api()

const router = a.router({
  name: 'custom method',
  routes: [
    method('custom', a.procedure('foo', () => 'bar'))
  ]
})
const example = a.create(router)

example.custom('foo') // 'bar'
//       ^ note the custom method, 
```

### When you need specific implementation logic for custom methods

But what if I want to access calls with my own methods? Well that's where it gets more complicated, because
you need to type out all the individual types of a route. Here's a blueprint

We essentially are defining or own version of a procedure

> Fun fact: This is similar to how the request calls in the [request integration](/docs/api/integrations/requests) are implemented.
> So this pattern is powerful enough to create your own integrations. But you must understand the internal workings/types of the package to make use of it.

```ts
import type { Call, Args, Context, Obj, Resolver, Fn, Resolver, Context } from '@hulla/api'
import { api } from '@hulla/api'

// context needs to be the first parsed generic argument, otherwise we wouldn't be able
// to provide full type information about custom context to the Resolver
export function custom<const CTX extends Obj>(context: CTX) {
  // and we'll curry the function for creating a Call (route)
  // we'll hardcore a method of 'custom', but you can use a generic, function parameter, etc.
  return <const N extend string, CTX extends Obj, const A extends Args, const R, const R2 = R>(
    route: N,
    fn: Fn<A, R>,
    resolver?: Resolver<CTX & Context<N, 'custom' A>, R, R2>
  ): Call<N, 'custom', CTX & Context<N, 'custom', A>, A, R, R2> => {
    doSomething()
    return {
      route,
      fn,
      resolver,
      method: 'custom'
    }
  }
}

// Then we need to initialize our api with a custom method:
const a = api({
  context: { foo: 'foo' }, // you don't need to define custom context, but including it for type-safety demonstration
  methods: ctx => ({
    custom
  })
})
```

