---
title: React Example
---

Here are few examples with react. We'll go over multiple use-cases with different variants / patterns.

> This tutorial does not go over specific react framework paradigms (i.e. nextjs fetch, or remix's loaders.)
> These frameworks however do have their separate examples, so feel free to check them out.
> This example blog focuses purely on vanilla react.

## Setup

Each of the example belows you've done the following setup. Obviously which functions / apis you export will vary. But they should look roughly in this pattern

```ts
import { api } from '@hulla/api'
import { db } from './db'

const a = api()
export const authorsAPI = a.router({
  name: 'authors',
  routes: [
    a.procedure('getAuthor', (id: string) => db.authors.get(id)),
    // ...
  ],
})
```

```ts
// src/api/notes.ts
// will skip the imports / initialization, same as above

export const notesAPI = a.router({
  name: 'notes',
  routes: [
    a.proceure('create', (note: NoteCreate) => db.notes.create(note)),
    // ...
  ],
})
```

> The example follow the equivalent of [official react docs](https://react.dev/reference/react). So you
> compare 1:1 how it looks with vanilla syntax vs with `@hulla/api`

## Server

With the release of React 18, we now have an option to fetch on server, which allows us shipping to client unnecessary dependencies and network call waterfalls. Here's how you go about using `@hulla/api` on server.

### Server components

Standard components work just as you'd expect them to. You just `await` your calls defined in your api router.

```tsx
// src/api/authors.ts
import { authorsAPI } from '@/api/authors'

export async function Author({ id }: { id: string }) {
  const author = await authorsAPI.call('getAuthor', id)
  return <span>By: {author.name}</span>
}
```

> 🔗 link to [docs equivalent](https://react.dev/reference/react)

### Server actions

There's nothing out of ordinary with server actions either.

```tsx
import { notesAPI } from '@/api/notes'
import { Button } from '@/components/Button'

function EmptyNote() {
  async function createNoteAction() {
    'use server'
    return notesAPI.call('create', { title: 'New note' })
  }

  return <Button onClick={createNoteAction}>Create Empty Note</Button>
}
```

> 🔗 link to [docs equivalent](https://react.dev/reference/rsc/server-actions)

## Client

While it's ideal to move what data-fetching you can to a server, there are certain occassions where it's beneficial to put certain logic on client for increased interactivity.

### Client components (useEffect)

For the longest time we used to fetch like this. While this should no longer be necessary with server fetching,
here's how you can do it.

```tsx
import { useState, useEffect } from 'react'
import { authorsAPI, type Author } from '@/api/authors'

export default function Page({ id }: { id: string }) {
  const [author, setAuthor] = useState<Author | null>(null)

  useEffect(() => {
    let ignore = false
    authorsAPI.call('getAuthor', id).then((result) => {
      if (!ignore) {
        setAuthor(result)
      }
    })
    return () => {
      ignore = true
    }
  }, [id])

  // ...
}
```

> 🔗 link to [docs equivalent](https://react.dev/reference/react/useEffect#what-are-good-alternatives-to-data-fetching-in-effects) - not exact 1:1, we use authors we declared above over person/bio, but you should get the idea.

### @tanstack/query

Package `@hulla/api` comes with an official `@hulla/api-query` integration, that helps you use your calls
in combination with tanstack query.

First, we'll need to ammend our api declaration

```ts ins={2}
// src/api/authors.ts
import { api } from '@hulla/api'
import { query } from '@hulla/api-query' // added this line <-

export const authorsAPI = a.router({
  name: 'authors',
  routes: [], // add routes here
  adapters: { query }, // add integration adapters
})
```

And then if we were to easy it in our client component:

```tsx
import { useQuery } from '@tanstack/react-query'
import { authorsAPI } from '@/api/authors'

export default function Page({ id }: { id: string }) {
  const { data: author } = useQuery(authorsAPI.query.call('getAuthor', id))
  // ...
}
```

> 🔗 here are the [`@hulla/api-query` docs](/docs/api/integrations/query)

See how much easier and shorter that was than the `useEffect`? 👀 And we got caching to boot!

### swr

Similar to `@tanstack/query`, an official integration of `@hulla/api-swr` exists.

First we need to ammend our api declaration

```ts ins={2}
// src/api/authors.ts
import { api } from '@hulla/api'
import { swr } from '@hulla/api-swr' // added this line <-

export const authorsAPI = a.router({
  name: 'authors',
  routes: [], // add routes here
  adapters: { swr }, // add the integration adapters
,})
```

And then if we were to easy it in our client component:

```tsx
import useSWR from 'swr'
import { authorsAPI } from '@/api/authors'

export default function Page({ id }: { id: string }) {
  const { data: author } = useSWR(authorsAPI.swr.call('getAuthor', id))
  // ...
}
```

> 🔗 here are the [`@hulla/api-swr` docs](/docs/api/integrations/swr)

## React frameworks

If you're looking for combining react with specific framework, check out their respective example in the menu located to your left. If you can't find the framework you're looking for, don't worry, chances are it will work as long as you understand how to properly define your [procedures](/docs/api/core-concepts/procedures) and your [router](/docs/api/core-concepts/router).

Also, consider please contirbuting to the documentation, if you'd like to see your framework represented!

## Demo

Here's a quick demo you can play around in with examples of all of the cases above and also all of the official integrations in combination with react.
