export const toastPositions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const

export type ToastPosition = (typeof toastPositions)[number]
export type ToastVariant = 'note' | 'success' | 'warning' | 'danger'
export type ToastId = string

export type ToastActionOptions = {
  label: string
  onClick?: () => void
}

export type ToastInput = {
  action?: ToastActionOptions
  description?: string
  duration?: number
  id?: ToastId
  title: string
  variant?: ToastVariant
}

export type ToastRecord = {
  action?: ToastActionOptions
  createdAt: number
  description?: string
  duration?: number
  id: ToastId
  title: string
  variant: ToastVariant
}

export type ToastUpdate = Partial<
  Pick<ToastRecord, 'action' | 'description' | 'duration' | 'title' | 'variant'>
>

type ToastListener = (toasts: readonly ToastRecord[]) => void

let nextToastId = 0
let toastRecords: ToastRecord[] = []
const toastListeners = new Set<ToastListener>()

const emitToasts = () => {
  const snapshot = getToasts()
  toastListeners.forEach((listener) => listener(snapshot))
}

const createToastRecord = (input: ToastInput): ToastRecord => {
  const id = input.id ?? `hulla-toast-${++nextToastId}`
  return {
    action: input.action,
    createdAt: Date.now(),
    description: input.description,
    duration: input.duration,
    id,
    title: input.title,
    variant: input.variant ?? 'note',
  }
}

export const pushToast = (input: ToastInput): ToastId => {
  const record = createToastRecord(input)

  toastRecords = [
    record,
    ...toastRecords.filter((toast) => toast.id !== record.id),
  ]
  emitToasts()
  return record.id
}

export const replaceToast = (input: ToastInput): ToastId => {
  const record = createToastRecord(input)

  toastRecords = [record]
  emitToasts()
  return record.id
}

export const dismissToast = (id?: ToastId) => {
  if (id === undefined) {
    if (toastRecords.length === 0) return
    toastRecords = []
  } else {
    const nextRecords = toastRecords.filter((toast) => toast.id !== id)
    if (nextRecords.length === toastRecords.length) return
    toastRecords = nextRecords
  }
  emitToasts()
}

export const updateToast = (id: ToastId, update: ToastUpdate) => {
  let changed = false
  toastRecords = toastRecords.map((toast) => {
    if (toast.id !== id) return toast
    changed = true
    return { ...toast, ...update }
  })
  if (changed) emitToasts()
}

export const getToasts = (): readonly ToastRecord[] => toastRecords

export const subscribeToasts = (listener: ToastListener) => {
  toastListeners.add(listener)
  listener(getToasts())
  return () => toastListeners.delete(listener)
}

type ToastUtility = {
  dismiss: typeof dismissToast
  push: typeof pushToast
  replace: typeof replaceToast
  update: typeof updateToast
}

export const toast = {
  dismiss: dismissToast,
  push: pushToast,
  replace: replaceToast,
  update: updateToast,
} satisfies ToastUtility

export const toastClassNames = {
  action:
    'mt-2 inline-flex min-h-7 items-center justify-center justify-self-start rounded-sm border border-[color-mix(in_oklab,var(--toast-accent)_16%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-surface-raised)_72%,transparent)] px-2 py-1 text-xs font-medium leading-none shadow-xs backdrop-blur-md transition-colors hover:border-[color-mix(in_oklab,var(--toast-accent)_28%,var(--color-border))] hover:bg-[color-mix(in_oklab,var(--toast-accent)_6%,var(--color-surface-raised))] active:bg-[color-mix(in_oklab,var(--toast-accent)_10%,var(--color-surface-raised))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring [grid-column:1] [grid-row:2]',
  close:
    '-mt-1 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-transparent text-muted-foreground/80 transition-[background-color,border-color,color] duration-150 hover:border-border hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
  description: 'mt-1 text-[0.8125rem] leading-[1.25rem] text-muted-foreground',
  progress:
    'absolute inset-x-4 bottom-2.5 h-1 w-auto rounded-full bg-[color-mix(in_oklab,var(--toast-accent)_10%,transparent)] text-[var(--toast-accent)] opacity-75 [&::-moz-progress-bar]:origin-left [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-current [&::-moz-progress-bar]:[animation:hulla-toast-countdown_var(--hulla-toast-duration)_linear_forwards] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-[color-mix(in_oklab,var(--toast-accent)_10%,transparent)] [&::-webkit-progress-value]:origin-left [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-current [&::-webkit-progress-value]:transition-none [&::-webkit-progress-value]:[animation:hulla-toast-countdown_var(--hulla-toast-duration)_linear_forwards] group-data-[paused=true]/toast:[&::-moz-progress-bar]:[animation-play-state:paused] group-data-[paused=true]/toast:[&::-webkit-progress-value]:[animation-play-state:paused] motion-reduce:opacity-0',
  toast:
    'group/toast pointer-events-auto relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 overflow-hidden rounded-lg border border-[color-mix(in_oklab,var(--toast-accent)_14%,var(--color-border))] bg-[color-mix(in_oklab,var(--toast-accent)_3%,color-mix(in_oklab,var(--color-surface-raised)_86%,transparent))] p-4 pb-[1.625rem] text-foreground shadow-(--shadow-floating) backdrop-blur-2xl backdrop-saturate-[1.18] [animation:hulla-toast-in_180ms_cubic-bezier(0.2,0.8,0.2,1)_both] motion-reduce:animate-none dark:bg-[color-mix(in_oklab,var(--toast-accent)_4%,color-mix(in_oklab,var(--color-surface-raised)_84%,transparent))] ',
  title: 'min-w-0 text-sm font-semibold leading-5 tracking-[-0.0125em]',
  viewport:
    'pointer-events-none fixed z-[calc(var(--hulla-layer-base,1000)+200)] m-0 flex w-[min(calc(100vw-2rem),24rem)] list-none gap-2.5 p-0 data-[position^=top-]:top-[max(1rem,env(safe-area-inset-top))] data-[position^=top-]:flex-col data-[position^=top-]:[--hulla-toast-enter-y:-0.5rem] data-[position^=bottom-]:bottom-[max(1rem,env(safe-area-inset-bottom))] data-[position^=bottom-]:flex-col-reverse data-[position^=bottom-]:[--hulla-toast-enter-y:0.5rem] data-[position$=-left]:left-[max(1rem,env(safe-area-inset-left))] data-[position$=-right]:right-[max(1rem,env(safe-area-inset-right))] data-[position$=-center]:left-1/2 data-[position$=-center]:-translate-x-1/2',
} as const

export const toastVariantClassNames: Record<ToastVariant, string> = {
  danger: '[--toast-accent:var(--color-danger)]',
  note: '[--toast-accent:var(--color-primary)]',
  success: '[--toast-accent:var(--color-success)]',
  warning: '[--toast-accent:var(--color-warning)]',
}
