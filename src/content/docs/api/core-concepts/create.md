---
title: Create API
---

The final step of any API creation. Any api creation consists of the following arguments

1. [__Router__](router) _(required)_
2. [__Adapters__](/docs/api/advanced/adapters) _(optional)_

## Declaration

Here's a very minimal API definition example:

```ts
// path: src/api/users.ts
import { api } from '@hulla/api'

const getAllUsers = () => db.from('users').select('*')
const getUserById = (id: string) => db.from('users').where('id', '==', id).selectFirst('*')

const a = api()
const router = a.router({
  name: 'users',
  routes: [
    a.procedure('all', getAllUsers),
    a.procedure('byId', getUserById),
  ]
})

export const usersAPI = a.create(router) // note we export it for futher usage
```

And we're ready to start rocking! 🎸

## Usage

Considering the declaration above, we can use our newly defined API in a following way:

```ts
// path: any-where-you-want.ts
import { usersAPI } from '@/src/api/users' // (points to your exported API creation)

const allUsers = await usersAPI.call('all') // [{ id: '0', name: 'John'}, { id: '1', name: 'Jane' }] ✅
const john = await usersAPI.call('byId', '0') // { id: '0', name: 'John' } ✅

// @ts-expect-error purposely bad call - super easy to miss (number arg vs string arg)
const badCall = await usersAPI('byId', 0) // ❌ type error
//                                     ^ expected 'string', got 'number'
```

## Examples reference

| Library/Framework/Package | Server | Client |
| --- | --- | --- |
| [React](react) | ✅ | ✅ |
| [Solid](solid) | ✅  | ✅  |
| [Vue (Nuxt)](vue) | ✅  | ✅  |
| [Astro](astro) | ✅  | ✅  |
| [@tanstack/query](query) | N/A | ✅  |
| [swr](swr) | N/A | ✅  |
| [Express/Node/Bun/Hono/...](server) | ✅ | N/A |
| [Remix](remix) | ✅ | ✅ |
| [Next](next) | ✅ | ✅ |
| [React Native](native) | N/A | ✅ |

__Even if your favourite framework isn't listed here, as long as it's capable of executing a function, then `@hulla/api` should be compatible__ -- all the package does is organize the calls for you. It does not implement any fetching logic under the hood, that's up to you to provide!

## Usage - server

If you followed best practices, your API should work on both server and client.

### React

```ts
// react:
async function getUserById(id: string) {
  'use server'
  return usersAPI.call('byId', id) // can obviously also be a form action instead
}

async function Example() {
  await getUserbyId('0')
}
```

### Astro

```astro
---
// astro:
const users = await usersAPI.call('all')
---
<div>{users.map(...)}</div>
```

### Vue (nuxt)

> See [Nuxt Integration](nuxt) for a better solution!

```vue
<script setup>
  // vue:
  async function getUserById(id: string) {
    await usersAPI.call('byId', id)
  }

  // 💡 there's a more elegant solution available with @hulla/api/integration-nuxt
  const { data } = useAsyncData('byId', (id: string) => usersAPI.call('byId', id))
</script>
```

### Node/Express/Bun/etc

```ts
// node/express/bun/etc
await usersAPI.call('all') // duhh.... 🤷
```

## Usage - client

If you followed best practices, your API should work on both server and client.

### React

```ts
// react:
function Example() {
  const [users, setUsers] = useState<User[] | null>(null)

  useEffect(() => {
    const getUsers = async () => {
      const allUsers = await usersAPI.call('byId', '0')
      setUsers(allUsers)
    }
    getUsers()
  }, [])
}
```

### Astro

```astro
---
// astro:
---
<script>
  document.addEventListener('click', () => {
    const user = await usersAPI.call('byId', '0')
    const { colorPreference } = user
    document.documentElement.classList.add(colorPreference === 'dark' ? 'dark' : 'light')
  })
</script>

```

### Vue (nuxt)

> See [Nuxt Integration](nuxt) for a better solution!

```vue
<script setup>
  // vue:
  // 💡 there's a more elegant solution available with @hulla/api/integration-nuxt
  const { data } = useAsyncData('byId', (id: string) => usersAPi.call('byId', id), { server: false })
</script>
```

### @tanstack/query

> See [Query Integration](query) for a better solution!

```ts
// @tanstack/query
import { useQuery } from '@tanstack/query' // (can be react-query, vue-query, etc.)
// 💡 there's a more elegant solution available with @hulla/api/integration-query
useQuery({ queryKey: ['all'], queryFn: () => usersAPI.call('all')})
```

### swr
>
> See [SWR Integration](swr) for a better solution!

```ts
// @tanstack/query
import useSWR from '@tanstack/query' // (can be react-query, vue-query, etc.)
// 💡 there's a more elegant solution available with @hulla/api/integration-query
useSWR('all', () => usersAPI.call('all')})
```
