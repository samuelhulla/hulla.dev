import { createSignal, For, onCleanup, onMount, Show, untrack } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Kbd } from '@/components/kbd'
import { Button } from '@/components/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/command'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog'
import { Spinner } from '@/components/spinner'
import { CornerDownLeftIcon, FileTextIcon, SearchIcon } from './LucideIcons'

type StaticResult = {
  title: string
  href: string
  description: string
}

type SearchResult = StaticResult & { excerpt?: string }

type PagefindResult = {
  data(): Promise<{
    url: string
    excerpt: string
    meta: { title?: string }
  }>
}

type Pagefind = {
  init(): Promise<void>
  search(query: string): Promise<{ results: PagefindResult[] }>
}

type Props = { fallback: StaticResult[] }

function textOnly(value: string) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function SearchCommand(props: Props) {
  const [open, setOpen] = createSignal(false)
  const [query, setQuery] = createSignal('')
  const [results, setResults] = createSignal<SearchResult[]>(
    untrack(() => props.fallback.slice(0, 8))
  )
  const [loading, setLoading] = createSignal(false)
  const [message, setMessage] = createSignal('Search all API documentation')
  let triggerElement: HTMLButtonElement | undefined
  let pagefind: Pagefind | undefined
  let debounce: ReturnType<typeof setTimeout> | undefined
  let focusFrame: number | undefined
  let inputElement: HTMLInputElement | undefined
  let run = 0

  const loadPagefind = async () => {
    if (pagefind) return pagefind
    try {
      const pagefindPath = '/pagefind/pagefind.js'
      pagefind = (await import(/* @vite-ignore */ pagefindPath)) as Pagefind
      await pagefind.init()
      return pagefind
    } catch {
      return undefined
    }
  }

  const openSearch = () => {
    setOpen(true)
    if (focusFrame !== undefined) cancelAnimationFrame(focusFrame)
    focusFrame = requestAnimationFrame(() => {
      inputElement?.focus({ preventScroll: true })
    })
    void loadPagefind()
  }

  const closeSearch = () => {
    setOpen(false)
    setQuery('')
    setResults(props.fallback.slice(0, 8))
    requestAnimationFrame(() => triggerElement?.focus({ preventScroll: true }))
  }

  const search = (value: string) => {
    setQuery(value)
    if (debounce) clearTimeout(debounce)
    const currentRun = ++run

    debounce = setTimeout(async () => {
      const normalized = value.trim().toLowerCase()
      if (!normalized) {
        setResults(props.fallback.slice(0, 8))
        setMessage('Search all API documentation')
        return
      }

      setLoading(true)
      const index = await loadPagefind()
      if (currentRun !== run) return

      if (index) {
        const response = await index.search(normalized)
        const resolved = await Promise.all(
          response.results.slice(0, 10).map((result) => result.data())
        )
        if (currentRun !== run) return
        setResults(
          resolved.map((result) => ({
            title: result.meta.title ?? result.url,
            href: result.url,
            description: textOnly(result.excerpt),
            excerpt: result.excerpt,
          }))
        )
      } else {
        setResults(
          props.fallback.filter((entry) =>
            `${entry.title} ${entry.description}`
              .toLowerCase()
              .includes(normalized)
          )
        )
      }
      setLoading(false)
      setMessage(
        `${results().length} result${results().length === 1 ? '' : 's'} for ${value}`
      )
    }, 160)
  }

  const select = (href: string) => {
    window.location.assign(href)
  }

  onMount(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open()) closeSearch()
        else openSearch()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    onCleanup(() => document.removeEventListener('keydown', onKeyDown))
  })

  onCleanup(() => {
    if (debounce) clearTimeout(debounce)
    if (focusFrame !== undefined) cancelAnimationFrame(focusFrame)
  })

  return (
    <>
      <Button
        ref={(element) => {
          triggerElement = element
        }}
        size="md"
        variant="secondary"
        class="site-search-trigger sm:min-w-36 sm:justify-start"
        aria-label="Search documentation"
        onClick={openSearch}>
        <SearchIcon class="size-4" aria-hidden="true" />
        <span class="hidden sm:inline">Search docs</span>
        <span class="ml-auto hidden lg:inline">
          <Kbd>⌘K</Kbd>
        </span>
      </Button>
      <Portal>
        <Dialog
          hidden={!open()}
          aria-label="Search API documentation"
          onDismiss={closeSearch}>
          <DialogHeader class="sr-only">
            <DialogTitle>Search documentation</DialogTitle>
            <DialogDescription>
              Search every page in the @hulla/api documentation.
            </DialogDescription>
          </DialogHeader>
          <Command filter={false} onSelect={select}>
            <CommandInput
              ref={(element) => {
                inputElement = element
              }}
              icon={<SearchIcon aria-hidden="true" />}
              autofocus
              value={query()}
              onInput={(event) => search(event.currentTarget.value)}
              placeholder="Search API concepts, packages, and exports…"
            />
            <p class="sr-only" aria-live="polite">
              {message()}
            </p>
            <Show when={loading()}>
              <div class="text-muted-foreground flex items-center gap-2 px-4 py-3 text-xs">
                <Spinner /> Searching the local index…
              </div>
            </Show>
            <CommandList class="max-h-[min(28rem,65vh)]">
              <CommandEmpty hidden={loading() || results().length > 0}>
                No matching documentation found.
              </CommandEmpty>
              <For each={results()}>
                {(result) => (
                  <CommandItem value={result.href} textValue={result.title}>
                    <span class="border-border bg-foreground/5 text-muted-foreground mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm border">
                      <FileTextIcon class="size-3.5" aria-hidden="true" />
                    </span>
                    <span class="min-w-0">
                      <span class="text-foreground block font-medium">
                        {result.title}
                      </span>
                      <span class="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">
                        {result.description}
                      </span>
                    </span>
                    <span class="text-muted-foreground mt-1 ml-auto">
                      <CornerDownLeftIcon class="size-3.5" aria-hidden="true" />
                    </span>
                  </CommandItem>
                )}
              </For>
            </CommandList>
          </Command>
        </Dialog>
      </Portal>
    </>
  )
}
