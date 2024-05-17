---
title: 'Procedures'
---

Procedures are the most basic building blocks of your API.

Each procedure is defined by:

1. __Procedure name__ _(required)_
2. __Function call__ _(required)_
3. [Resolver](/docs/api/advanced/resolvers) _(optional)_

The goal of the procedure is to provide type-definitions for your API to use later. By themselves they are useless _(to you...)_.

## Declaration

```ts
import { api } from '@hulla/api'

const a = api()

a.procedure('hello', () => 'world') // dummy function
a.procedure('sum', (a: number, b: number) => a + b) // with args

const getUserById = async (id: string) => db.from('users').where('id', '==', id).select('*')
a.procedure('getUserById', getUserById) // async procedure (+ note we ca also pass function reference)

a.procedure('api-call', (id: string) => fetch(`<your-api>/users/${id}`)) // or a HTTP request
// ^ check out also Request integration for some more fancy stuff with HTTP requests/responses! 📢
```

You can pass pretty much anything to a procedure.

## Usage

> Procedure is not intended to be used by itself! 🚧

It just provides useful internal handlers for the package, that will come into play later, once you have [created your api](/docs/api/core-concepts/create) you can invoke your procedures via a `call`.

```ts
// later after you have created your API (i.e. exampleAPI)

exampleAPI.call('hello') // world
exampleAPi.call('sum', 1, 2) // 3
exampleAPI.call('getUserById', '123') // Promise<{ id: '123', name: 'John Doe' }>
```

## Best practices

Here's some true and tested principles that will do wonders for you in long term if you follow them.

### Server vs client

> _If you plan on using `@hulla/api` only on client, you can skip this section._

It's good to define your procedures in a way that will work always on server _(this way you can rest assured it will also work on client)_ and allows your not to repeat yourself - having to define duplicate calls for server / client.

```ts
const getAllUsers = () => db.from('users').select('*')

a.procedure('getUsers', getAllUsers) // ✅ good
a.procedure('client/theme', () => localStorage?.getItem('theme')) // 🚧 semi ok, just careful not to use on server
//             ^ may be a good idea to mark a client only call (use whichever naming scheme you want)
//               or even better, define a specific client-only router (see Router)
a.procedure('getUsersBAD', () => useQuery({ queryKey: ['getAllUsers'] queryFn: getAllUsers })) // ❌ bad
// ^ this will not work on server and it's unclear it's client only call.
// Furthermore this also means your @tanstack/query dependency gets imported on server and on every call
// even when you don't need it (yuck). Luckily there's better ways to do this (see Integrations & Adapters)
```

Two simple rules to keep in mind

1. Never have two procedures that use same function twice _(in our example: `getAllUsers`)_.
2. Never bundle client-side packages to your server-compatible APIs _(in our exampe `@tanstack/query`)_.

This way you can rest assured your code will be DRY and will work on both client and server without impacting the bundle size.

### Procedure Naming

You can name your procedures however you like - with only one rule to keep in mind.

- You cannot have procedure _(or to be precise, same methods)_  with duplicate names ⚠️

```ts
// this will throw an Error, warning you about duplicate procedure definitions ❌
// @ts-expect-error
routes: [
  a.procedure('same', () => 'abc'),
  a.procedure('same', () => null),
]
```

The reason for this is, we don't know which one of the two procedures you'd want to invoke, if you tried to `call` them. We could override them with the last/first defined one, but when you create something twice, more likely than not it's an oversight, so we'll rather throw an error for your safety. 🦸 _It's always better to create one extra name than to have non-deterministic function calls!_

One final important distinction to make:

> You can have same route names with different methods

```ts
// this is ok ✅, same key but different methods
routes: [
  // note you need the request integration for this, won't work with just const a = api()
  a.request.get('users', 'https://api.com/users'), // method: 'get'
  a.request.post('users', 'https://api.com/users'), // method: 'post'
]
```

To find out more about creating different methods, see the [custom methods](/docs/api/advanced/custom) or the specific [request integration](/docs/api/integrations/requests) we used in this example
