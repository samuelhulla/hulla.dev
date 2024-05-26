---
title: 'Quick-start'
---


> This section presumes you've already [installed the package](installation)

## Creating your API

`@hulla/api` provides a lot of advanced functionality, such as [Resolvers](/docs/api/advanced/resolvers), [Context](/docs/api/advanced/context), [Adapters](/docs/api/advanced/adapters), [Interceptors](/docs/api/advanced/interceptors) and much more.
In this example we'll ignore them all, and focus only on the 2 minimal building blocks - [Procedures](/docs/api/core-concepts/procedures), [Router](/docs/api/core-concepts/router)

1. First we'll import and initialize our API SDK

```ts
// location: src/api/users.ts
import { api } from '@hulla/api'

const a = api() // initialize the api
```

2. We'll define our [router](/docs/api/core-concepts/router) and routes. We'll use [procedures](/docs/api/core-concepts/procedures) for routes.

```ts
function getAllUsers() {
  return db.from('users').select('*') // Promise<{ name: string, id: string}[]>
} 
function getUserById(id: string) {
  return db.query('users').where('id', '==', id) // Promise<{ name: string, id: string}>
}

// use the created api toolkit ("const a") to create our router
export const usersAPI = a.router({
  name: 'users',
  routes: [
    // pass our defined functions
    a.procedure('getAllUsers', getAllUsers),
    a.procedure('getUserById', getUserById),
    a.procedure('sum', (a: number, b: number) => a + b), // or just declare it here
  ],
})
```

> You don't have to worry about distinguishing between client and server, this will work everywhere _(as long as your function doesn't execute client-side only code)_


That's it! We're ready to start using our API now.

## Usage

```ts
import { usersAPI } from './src/api/users' // using api from example above
/* ------------------------------- server -------------------------------- */
// Just await / execute your function
const allUsers = await usersAPI.call('getUserById', '0') // { name: 'John', id: '0' }
const quiz = usersAPI.call('sum', 40, 2) // 42

/* ---------------------------- or on client ----------------------------- */
// doesn't have to be react, check out other examples if you're not familiar with it
const [users, setUsers] = useState([])
useEffect(() => {
  const getAllUsers = () =>
    usersAPI.call('getAllUsers').then((users) => setUsers(users))
  getAllUsers()
}, [])

/* ----------------------- or with an integration ------------------------ */
// in this example @tanstack/query, but there are others as well!
// @hulla/api-query automatically encodes and dedupes queryKeys and constructs queryFn for you! 🔥
import { useQuery } from '@tanstack/query'
const { data } = useQuery(usersAPI.query.call('getAllUsers')) // 💡 see Integrations documentation
```

And that's all you need to know to get your very minimal API definition up and running. Here's a comprehensive list of examples, so it's clearer with the technology you love using.

## Examples reference

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

**Even if your favourite framework isn't listed here, 99% chance it's compatible with `@hulla/api`** -- all the package does is organize the calls for you. It does not implement any fetching logic under the hood, that's up to you to provide! If you follow best practices it will work anywhere, be it server, client or a service worker.
