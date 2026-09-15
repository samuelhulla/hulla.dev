import { createEffect, on, onCleanup, onMount, untrack } from 'solid-js'

export type MutableElementRef<T> = ((value: T) => void) & { current: T }

export function createMutableRef<T>(initial: T): MutableElementRef<T>
export function createMutableRef<T>(
  initial: null | undefined
): MutableElementRef<T | null | undefined>
export function createMutableRef<T>(
  initial: T | null | undefined
): MutableElementRef<T | null | undefined> {
  const ref = ((value: T) => {
    ref.current = value
  }) as MutableElementRef<T | null | undefined>
  ref.current = initial
  return ref
}

export function exposeRef<T>(
  ref: unknown,
  factory: () => T,
  dependencies?: readonly unknown[]
): void {
  void dependencies
  onMount(() => {
    if (typeof ref === 'function') (ref as (value: T) => void)(factory())
  })
}

export function callEventHandler<T>(handler: unknown, event: T): void {
  if (typeof handler === 'function') (handler as (event: T) => void)(event)
}

export function onMountEffect(effect: () => void | (() => void)): void {
  onMount(() => {
    const cleanup = untrack(effect)
    if (typeof cleanup === 'function') onCleanup(cleanup)
  })
}

export function createLifecycleEffect(
  effect: () => void | (() => void),
  dependencies: () => readonly unknown[]
): void {
  createEffect(
    on(dependencies, () => {
      const cleanup = untrack(effect)
      if (typeof cleanup === 'function') onCleanup(cleanup)
    })
  )
}
