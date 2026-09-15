export const TAG_ADD_EVENT = 'hulla-tag-add'

export type TagAddDetail = { value: string }

/** Returns false from onTagAdd, or cancels hulla-tag-add, to retain the draft. */
export function handleTagInputKeyDown(
  event: Pick<
    KeyboardEvent,
    | 'key'
    | 'isComposing'
    | 'keyCode'
    | 'repeat'
    | 'defaultPrevented'
    | 'preventDefault'
  >,
  input: HTMLInputElement,
  onTagAdd?: (value: string) => boolean | void
) {
  if (
    event.defaultPrevented ||
    event.isComposing ||
    event.keyCode === 229 ||
    event.repeat
  )
    return
  if (input.matches(':disabled') || input.readOnly) return

  if (event.key === 'Backspace' && !input.value) {
    const root = input.closest("[data-slot='tag-input']")
    const buttons = Array.from(
      root?.querySelectorAll<HTMLButtonElement>(
        "[data-slot='tag-input-remove']"
      ) ?? []
    )
    const last = buttons
      .filter(
        (button) =>
          button.closest('[data-slot=tag-input]') === root &&
          !button.matches(':disabled') &&
          !button.closest('[hidden], [inert]') &&
          button.getAttribute('aria-disabled') !== 'true'
      )
      .at(-1)
    if (last) {
      event.preventDefault()
      last.focus()
    }
    return
  }

  const value = input.value.trim()
  if (event.key !== 'Enter' || !value) return
  event.preventDefault()
  if (!input.checkValidity()) {
    input.reportValidity()
    return
  }
  const accepted = input.dispatchEvent(
    new CustomEvent<TagAddDetail>(TAG_ADD_EVENT, {
      bubbles: true,
      cancelable: true,
      detail: { value },
    })
  )
  if (!accepted || onTagAdd?.(value) === false) return

  // Use the native setter so React's value tracker sees the following input event.
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )?.set
  if (setter) setter.call(input, '')
  else input.value = ''
  input.dispatchEvent(new Event('input', { bubbles: true }))
}
