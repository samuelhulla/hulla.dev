---
title: Interceptors
---

> Before writing interceptors, if you need to mutate/transform specific procedure results, or run middleware only on specific routes - check out [resolvers](resolvers) first.
>
> __Interceptors are intended to be used when you need to execute something on every single defined route!__

Interceptors provide a way to

- mutate your passed `arguments`
- mutate your result _(be it of `fn` or `resolver`)_
- add input / output validators or transformers
- implement middleware or logging

## Declaration

Interceptors are defined at the [router](/docs/api/core-concepts/router) level.

Interceptors are passed as an object. The object has 3 optional properties, each of which is a function which has context available as it's first argument _(this is passed automatically from the package)_.

| Name | Type | Description |
| --- | --- | --- |
| `args` | `(context:`[`Context`](context)`) => RouteArgs` | Must return same type as args _(use `context.args` to access them)_ |
| `fn` | `(context:`[`ContextWithResult`](context)`) => PossibleFnReturns` | Must return same type as the function _(use `context.result` to access it)_ |
| `resolver` | `(context:`[`ContextWithResult`](context)`) => PossibleResReturns` | Must return same type as the resolver _(use `context.result` to access it)_ |

```ts
import { api } from '@hulla/api'

const a = api()
export const interceptorAPI = a.router({
  name: 'example',
  routes: [],
  // define them here!
  interceptors: {
    // obviously can do more with them than just return, but here's the most minimal version
    args: ctx => ctx.args, // must return arguments type
    fn: ctx => ctx.result, // must return fn result type
    resolver: ctx => ctx.result, // must return resolver result type
  }
})
```

## Usage

Interceptors are a very powerful tool that can be used in various ways

### As Middleware

```ts
// A quick example to check if we're fetching the posts 
// for the same user as currently authenticated
import { api } from '@hulla/api'
import { db } from './db'
import { isAuthenticated } from './queries/users'

const getUserPosts = (id: string) => db.from('posts').where('author.id', '==', id).select('*')

const a = api({ context })
export const protectedAPI = a.router({
  name: 'protected',
  routes: [a.procedure('getPosts', getUserPosts)],
  interceptors: {
    fn: (ctx) => {
      if (!isAuthenticated()) {
        throw new Error('Please log in first!')
      }
      return ctx.result // now every single call will check for authentication
    }
  }
})
```

### As Validator

```ts
import { api } from '@hulla/api'
import { z } from 'zod'

type User = { name: string, email: string, id: number, phone?: string }
const createUser = (user: Omit<User, 'id'>) => db.from('users').insert(user)

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
})

const a = api()
export const validatedAPI = a.router({
  name: 'validated',
  routes: [a.procedure('createUser', createUser)],
  interceptors: {
    args: (ctx) => {
      // this interceptor presume every single route has a first argument of type User
      return schema.parse(ctx.args[0])
      // 💡 note: in practice if you had to do this for specific routes,
      // it feels like you should be writing a Resolver instead (check the docs out)
    }
  }
})
```

### As Transformer

```ts
import { api } from '@hulla/api'

const a = api()
export const exampleAPI = a.router({
  name: 'plus1',
  routes: [a.procedure('sum', (a: number, b: number) => a + b)],
  interceptors: {
    fn: (ctx) => ctx.result + 1 // 🤷
  }
})

exampleAPI.call('sum', 1, 1) // 3 (2 [fn sum 1 + 1] + 1 [interceptor])
```

## Caveat: Resolver interceptor

Due to the nature of procedure definitions, `args` and `fn` with always be defined. However it's possible to define a [procedure](/docs/api/core-concepts/procedures) without a [resolver](resolvers).
For this reason, one thing to keep in mind, a `resolver interceptor` will only run on procedures where a resolver is defined.

```ts
import { api } from '@hulla/api'

const a = api()
const num = (a: number) => a

export const exampleAPI = a.router({
  name: 'plus1',
  routes: [
    a.procedure('num', num)
    a.procedure('numRes', num, res => res.toString())
  ],
  interceptors: {
    resolver: (ctx) => `${ctx.result}example` 
  }
})

exampleAPI.call('num', 1) // 1 (resolver interceptor didn't fire - no resolver provided)
exampleAPI.call('numRes', 1) // '1example' (resolver interceptor fired)
// note: if 'fn' or 'args' interceptors were defined, they would fire for both!
```

If you need an interceptor to run on every call, use the `fn interceptor` instead.

## Caveat: Type safety

### TL/DR

Unlike [resolvers](resolvers), __interceptors do not override return types__ As long as you don't attempt to override them, you will not run into any issues.

```ts
const a = api()
export const gotchaAPI = a.router({
  name: 'return types',
  routes: [
    a.procedure('what do i return?', () => 1, res => res.toString())
  ],
  interceptors: {
    // @ts-expect-error Typeguard will try to prevent you from overriding resolver return type
    resolver: ctx => !!ctx.result // ❌ package correctly tries to warn you (string -> boolean)
  }
})

const d = gotchaAPI.call('what do i return?') // Well... what do I return? 🤔

// What happens:
// 1. Fn returns 1 (number)
// 2. Resolver returns '1' (string)
// 3. Interceptor takes resolver return '1' and transforms it to true (boolean)

// However! Interceptors do not mutate type, so the correct answer is:
// d === true
// typeof d === string 
// (this obviously does not reflect reality, but interceptors do not override types)
```

As you can see, this is not a ideal, luckily shouldn't happen to you _(keep in mind we ignored a correctly raised error with `// @ts-expect-error`)_ but there is a good reason for this behaviour _(keep reading further if you're interested why)_.
But if I were to sum it up in one sentence:

> If you need to override return type or take actions only on specific routes, use a [resolver](resolvers) instead!

When creating the package, I kind of had to _"pick my own poision"_ when it came to implementing interceptors.

### Architectural choices (why?)

Why? __Type safety of return types__. We could use generics to make sure that they match the exact route names and methods, __but then you need to narrow
down the interceptor return type for every single route in your api!__

```ts
// with generic (INTERNAL BUILD, THIS WON'T HAPPEN WHEN YOU TRY IT 🧪):
interceptors: {
  fn: (ctx) => {
    doSomething()
    return ctx.result // ❌ TypeError (INTERNAL BUILD, THIS WON'T HAPPEN WHEN YOU TRY IT 🧪):
    // Type 'Result' could be instantiated with an arbitratry type
    // which could be unrelated to type typeof ctx.result

    // You'd need to write type narrowers for every route i.e.
    // isCtxRoute<Routes, BaseContext, CustomContext, Method>(ctx: ...): ctx is ... 
    // (narrow result type) this is fairly advanced typescript with multiple generics and 
    // if you have a router with 10+ routes this gets annoying real quick 
    // as you would need to narrow it PER ROUTE STRING for exact returns!
  }
}
```

I've experimented with both versions in couple of projects, and I've came to conclusion, it's better to keep interceptor return types vague -
they should just match whatever the possible return types are from the procedures.

```ts
// This is what actually happens 🚀
routes: [
  a.procedure('foo', () => 'string'),
  a.procedure('bar', () => 100),
  a.procedure('baz', () => 100, res => !!res)
],
interceptors: {
  fn: (ctx) => ctx.result // string | number
  resolver: (ctx) => ctx.result // boolean
}
```

Essentially you just need to narrow the type down if you want to do any result transformations

```ts
interceptors: {
  fn: (ctx) => {
    // Note: if you need to do this in practice, it sounds like you're better off with a resolver
    // interceptors don't make that much sense when they execute only for 1 specific route
    if (ctx.route === 'bar') {
      // return ctx.result + 1 // (would be TypeError ❌)
      // TypeError: Operator '+' cannot be applied to types 'string | number' and 'number'.

      // need to do type assertion instead (but need to be careful to cast it correctly)
      return (ctx.result as number) + 1 // ✅ works
    }
    return ctx.result
  }
}
```

So it comes down to a trade-off, where we don't have the full type-safety, but for majority of use-cases makes interceptors less of a pain to write.
Hopefully this helps you understand the thought process more and why the "executive decision" was made to define the interceptor return type as is.

From my own experience, most common interceptors are:

- middlware that executes on every call _(so we don't care about type, cause we always just do `return ctx.result`)_
- only on specific route type calls (i.e. only on GET requests) _(so we just carefuly cast it `ctx.result as ...`)_

> If you are attempting to write a interceptor for specific route (i.e. `if (ctx.route === 'something') {...}`), it's almot always a dead give-away that you probably should be using [resolvers](resolvers) instead! You can put whatever logic you were going to pass to the specific route inteceptor to the route's resolver instead and as a bonus you get the full type safety.
