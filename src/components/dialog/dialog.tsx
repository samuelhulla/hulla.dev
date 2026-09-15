import { vn, cn } from '@/lib/style'
import { createMutableRef, exposeRef, onMountEffect } from '@/lib/solid'
import { mergeProps, splitProps, type JSX } from 'solid-js'
import { Backdrop } from '../backdrop/backdrop'
import {
  connectDialog,
  onDialogDismiss,
  type DialogDismissReason,
} from '@/lib/dialog'

const $overlayVariant = vn({
  compact:
    'p-4 [&[hidden]>[data-slot=dialog]]:[transform:translateY(4px)_scale(0.98)]',
  workspace:
    'p-2 sm:p-6 [&[hidden]>[data-slot=dialog]]:[transform:translateY(4px)]',
  fullscreen: 'p-0',
})
const $variant = vn({
  compact:
    'starting:[transform:translateY(4px)_scale(0.98)] max-w-lg rounded-lg border border-border p-6 shadow-(--shadow-overlay) has-[>[data-slot=command]]:max-w-2xl has-[>[data-slot=command]]:p-0 [&>[data-slot=command]]:rounded-[inherit] [&>[data-slot=command]]:border-0 [&>[data-slot=command]]:shadow-none dark:border-foreground/15 dark:bg-surface-raised/84 dark:backdrop-blur-2xl',
  workspace:
    'starting:[transform:translateY(4px)] flex h-[calc(100dvh-1rem)] max-w-[90rem] flex-col rounded-lg border border-border shadow-(--shadow-overlay) dark:border-foreground/15 dark:bg-surface-raised/88 dark:backdrop-blur-2xl sm:h-[calc(100dvh-3rem)]',
  fullscreen:
    'flex h-dvh max-w-none flex-col rounded-none border-0 shadow-none',
})

export type DialogProps = Omit<JSX.IntrinsicElements['div'], 'onDismiss'> & {
  contentClassName?: string
  contentStyle?: JSX.CSSProperties
  dismissible?: boolean
  onDismiss?: (reason: DialogDismissReason) => void
  variant?: typeof $variant.infer
}

export function Dialog(props: DialogProps) {
  const [local, rest] = splitProps(
    mergeProps(
      {
        'aria-modal': true,
        dismissible: true,
        hidden: false,
        role: 'dialog',
        tabIndex: -1,
        variant: 'compact',
      } as const,
      props
    ),
    [
      'aria-modal',
      'children',
      'class',
      'contentClassName',
      'contentStyle',
      'dismissible',
      'hidden',
      'onDismiss',
      'role',
      'style',
      'tabIndex',
      'variant',
    ]
  )

  const elementRef = createMutableRef<HTMLDivElement>(null)
  exposeRef(rest.ref, () => elementRef.current as HTMLDivElement, [])
  onMountEffect(() => {
    const element = elementRef.current
    if (!element) return

    const controller = connectDialog(element)
    const removeDismissListener = onDialogDismiss(element, (event) => {
      local.onDismiss?.(event.detail.reason)
    })

    return () => {
      removeDismissListener()
      controller.destroy()
    }
  })

  return (
    <div
      {...rest}
      ref={elementRef}
      aria-modal={local['aria-modal']}
      data-dismissible={local.dismissible}
      data-slot="dialog-overlay"
      data-state={local.hidden ? 'closed' : 'open'}
      data-variant={local.variant}
      hidden={local.hidden}
      role={local.role}
      tabindex={local.tabIndex}
      style={
        typeof local.style === 'string'
          ? `${local.style};z-index:calc(var(--hulla-layer-base, 1000) + var(--hulla-layer-order, 0))`
          : {
              'z-index':
                'calc(var(--hulla-layer-base, 1000) + var(--hulla-layer-order, 0))',
              ...local.style,
            }
      }
      class={cn(
        'fixed inset-0 grid max-h-dvh place-items-center overflow-y-auto overscroll-contain transition-[display] [transition-behavior:allow-discrete] duration-160 focus:outline-none motion-reduce:transition-none [&[hidden]]:pointer-events-none [&[hidden]]:hidden [&[hidden]>[data-slot=backdrop]]:opacity-0 [&[hidden]>[data-slot=dialog]]:opacity-0',
        $overlayVariant(local.variant),
        local.class
      )}>
      <Backdrop />
      <div
        data-slot="dialog"
        data-variant={local.variant}
        tabindex={-1}
        style={local.contentStyle}
        class={cn(
          'group/dialog bg-surface-raised text-foreground relative my-auto w-full overflow-hidden transition-[opacity,transform] duration-160 ease-out focus:outline-none motion-reduce:transition-none starting:opacity-0',
          $variant(local.variant),
          local.contentClassName
        )}>
        {local.children}
      </div>
    </div>
  )
}
