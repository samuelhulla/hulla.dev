---
title: Nextjs example
---

Since Next is a React framework, it's going to share a lot of common ground with the [React examples](react).

That being said, there are some common patterns in Next which slightly differ from the vanilla react experience.

> We will mirror each possible concept in the [`Data Fetching`](https://nextjs.org/docs/app/building-your-application/data-fetching)

## Server

We will use the [app router](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration) version of nextjs routing, since it's
the premier way to work with server actions and components.

### fetch

Next.js extends the native [`fetch` web API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) what some of their own primitives for caching and revalidation.
Since `@hulla/api` delegates the data-fetching to the frameworks and is not opinionated about fetching logic, you can define your procedure just fine.

```ts
import { api } from '@hulla/api'

const a = api()
export const exampleAPI = a.router({
  name: 'example',
  routes: [
    a.procedure('example', () =>
      fetch('https://api.com/example', { cache: 'force-cache' })
    ),
  ]
})
```

or with [request integration](/docs/api/integrations/requests)

```ts
routes: [
  a.request.get('example', {
    url: 'https://api.com/example',
    cache: 'force-cache',
  }),
]
```

and then just call it on server

```ts
import { exampleAPI } from '@/api/example'

async function Page() {
  const data = await exampleAPI.call('example')
  // ...
}
```

### Server actions

Similar to the server fetch, you can define your server actions.

```ts
async function example() {
  'use server'
  return exampleAPI.call('example')
}
```

Wether you define your server actions inside a server component or a separate `actions.ts` makes no difference, both approach work.

### Third party libraries

These obviously depend on which library you use and how server compatible it is. Just keep in mind `@hulla/api` just provides a way to organize your calls
and does not override anything.

In case you have something like your database client, you can use it as normal

```ts
routes: [a.procedure('getUserById', (id: string) => db.users.get(id))]
```

or the `react cache API`

```ts
import { cache } from 'react'

export const getUserById = cache(async (id: string) => {
  const user = await db.users.get(id)
  return user
})

// then in router definition
routes: [a.procedure('getUserById', getUserById)]
```

and then you can use the [route segment config options](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) for cache/revalidation options on specific route segment.

```ts
export const dynamic = 'auto'
export const fetchCache = 'auto'
export const revalidate = 'false'

export default async function Page() {
  await usersAPI.call('getUserById', '1')
}
```

## Client

While you should ideally fetch what you can on server, there are some times when you do need to fetch some data on the client.

### Route handlers

You can also call your API procedures in [route handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

This technically blurs the boundary between client and server, since the route itself runs on server and hydrates data to the client,
but at least the official Nextjs docs categorizes this pattern under client side fetching.

```ts
export async function GET() {
  const res = exampleAPI.call('example')
  const data = await res.json()

  return Response.json({ data })
}
```

### @tanstack/query

All the common client-side fetching patterns will work. The quickest way to transform your API calls to a `useQuery` query options,
is with the official [@tanstack/query integration](/docs/api/integrations/query).

```ts
import { api } from '@hulla/api'
import { query } from '@hulla/api-query'
import { db } from '../db'

const a = api()
export const usersAPI = a.router({
  name: 'users',
  routes: [a.procedure('getAllUsers', () => db.users.get())],
  adapters: { query }, // added the query adapter here
})
```

and then

```ts
import { useQuery } from '@tanstack/react-query'
import { usersAPI } from '@/api/users'

export function ClientComponent() {
  const { data } = useQuery(usersAPI.query.call('getAllusers'))
}
```

> Note: @tanstack/query also has an experimental server hydration API, that mainly uses `prefetchQuery` (and some additional configuration).
> This should still be 100% compatible, check out the [official docs](https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr)

### swr

Similar to `@tanstack/query` integration above, `swr` is an alternative for data fetching. We will use the recommended
[swr integration](/docs/api/integrations/swr) to transform our procedures to `useSWR` arguments.

```ts
import { api } from '@hulla/api'
import { swr } from '@hulla/api-swr'
import { db } from '../db'

const a = api()
export const usersAPI = a.router({
  name: 'users',
  routes: [a.procedure('getAllUsers', () => db.users.get())],
  adapters: { swr }, // added the query adapter here
})
```

and then

```ts
import useSWR from 'swr'
import { usersAPI } from '@/api/users'

export function ClientComponent() {
  const { data } = useSWR(...usersAPI.swr.call('getAllusers'))
}
```

## Demo

Here's a quick interactive demo you can play around with:

