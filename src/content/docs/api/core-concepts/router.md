---
title: Router
---

Router is the brains of your operations. It creates your API definitions for you and packs some useful utilities along the way!

## Declaration

The declaration of router is straight-forward. You pass a configuration objects which can contain following properties:

| Argument       | Type                                                                                          | Status   | Description                                       |
| -------------- | --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- |
| **name**       | `string`                                                                                      | Required | Used for request deduping, key encoding           |
| **routes**     | `readonly [`[`Procedures`](/docs/api/core-concepts/procedures), or other [custom methods](/docs/api/advanced/custom)`]` | Required | Routes definitions, calls you'll be executing     |
| _interceptors_ | `{ args: Interceptor, fn: Interceptor, resolver: Interceptor }`                               | Optional | Utility functions ran when given part is executed |

Here's how it looks in practice

```ts
import { api } from '@hulla/api'

// can pass a function reference, or just define it inside the call definition
const getAllUsers = () => db.from('users').select('*')
const getPokemon = (name: string) => `https://pokeapi.co/api/v2/pokemon/${name}`

const a = api()
const router = a.router({
  name: 'example', // first the router name!
  routes: [ // then the routes - can be the followng
    a.procedure('all', getAllUsers), // procedure
    a.procedure('foo', () => 'foo'),
    a.request.get('poke', getPokemon), // request integration, can be custom methods, not only procedures
    // ...etc
  ]
)
```

## Usage

> Router is not intended to be used by itself! 🚧

It just provides useful internal handlers for the package, that will come into play later, once you have [created your api](/docs/api/core-concepts/create).

## Best practices

Router doesn't really have any gotchas. The only good practice to keep in mind is

- Keep your routers minimal

This way when you import your API accross the application, you don't import unnecessary calls and heavens-forbid unnecessary dependencies. Usually it's good idea to separate routers by their subject matter.

```ts
// even though posts have relation to users (i.e. user has multiple posts). You probably
// don't need all the API calls related to posts when fetching a user's profile.

// path: src/api/users.ts
a.router({
  name: 'users',
  routes: [
    /*...*/
  ],
})
// path: src/api/posts.ts
a.router({
  name: 'posts',
  routes: [
    /*...*/
  ],
})
```

This also makes it easier to distinguish and navigate individual routes, rather than having 200 calls all in one api export.

## Routes definitions

In the code example above, i've purposely defined `routes` inside the `a.router` definition. Like so:

```ts
a.router({ name: 'users', routes: [a.procedure('all', getAllUsers)] }) // ✅ ok
```

This is due to a fairly common gotcha, caused by typescript treating `const x = []` declarations as arrays instead of tuples by default.

```ts
const routes = [a.procedure('all', getAllUsers)] // => Call<...>[]
a.router({ name: 'users', routes }) // ❌ ERROR: Breaks type inference - array not a tuple
```

Since `@hulla/api` heavily relies on typescript ([which is why has 97.6% smaller bundle size](/docs/api#how-come-the-package-size-is-so-drastically-different)) compared to similar packages, it's a small price we pay for this luxury -- and you'll have to fix it accordingly:

If you for whatever-reason want to define your routes outside of the router, remember to use the `as const` assertion.<br/>This tells TypeScript it's a tuple and not an array - _(note this has nothing to do with the package, but with how TS treats declarations)_

```ts
const routes = [api.procedure('all', getAllUsers)] as const // => [Call<...>] :: note the as const
api.router({ name: 'users', routes }) // ✅ now it works
```
