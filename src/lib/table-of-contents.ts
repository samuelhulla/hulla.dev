/** Enhances an empty, framework-owned list; anchors retain native fragment navigation. */
export function connectTableOfContents(nav: HTMLElement) {
  const doc = nav.ownerDocument
  const win = doc.defaultView!
  const list = nav.querySelector<HTMLOListElement>(
    '[data-slot=table-of-contents-list]'
  )!
  let sections: HTMLElement[] = []
  let links: HTMLAnchorElement[] = []
  let frame = 0
  let destroyed = false
  let initialHashHandled = false
  let signature = ''
  let observedSections: HTMLElement[] = []

  function scrollParent(element: HTMLElement): HTMLElement | null {
    for (
      let parent = element.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      if (
        /(auto|scroll|overlay)/.test(win.getComputedStyle(parent).overflowY) &&
        parent.scrollHeight > parent.clientHeight
      )
        return parent
    }
    return null
  }

  function update() {
    frame = 0
    if (destroyed) return
    const target = doc.getElementById(nav.dataset.tocFor ?? '')
    sections = target
      ? Array.from(
          target.querySelectorAll<HTMLElement>(
            '[data-slot="table-of-contents-section"][id][data-toc-label]'
          )
        )
      : []
    sections = sections.filter((section) => {
      const hiddenAncestor = section.closest('[hidden],[inert]')
      return !hiddenAncestor || !target?.contains(hiddenAncestor)
    })
    const nextSignature = JSON.stringify(
      sections.map((section) => [section.id, section.dataset.tocLabel])
    )
    if (
      signature !== nextSignature ||
      sections.some((section, index) => section !== observedSections[index])
    ) {
      observedSections = sections
      signature = nextSignature
      links = sections.map((section) => {
        const item = doc.createElement('li')
        item.dataset.slot = 'table-of-contents-item'
        const link = doc.createElement('a')
        link.dataset.slot = 'table-of-contents-link'
        link.href = `#${encodeURIComponent(section.id)}`
        link.textContent = section.dataset.tocLabel ?? ''
        link.className =
          '-ml-px block border-l-2 border-transparent py-1.5 pl-4 pr-2 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=location]:border-primary aria-[current=location]:font-medium aria-[current=location]:text-foreground'
        item.append(link)
        return link
      })
      list.replaceChildren(...links.map((link) => link.parentElement!))
      resizeObserver?.disconnect()
      resizeObserver?.observe(doc.body)
      if (target) resizeObserver?.observe(target)
      sections.forEach((section) => resizeObserver?.observe(section))
    }

    // Native hash navigation may precede hydration or asynchronous section mounting.
    if (!initialHashHandled && sections.length) {
      let id = ''
      try {
        id = decodeURIComponent(win.location.hash.slice(1))
      } catch {
        /* malformed fragments do not identify a section */
      }
      const destination = sections.find((section) => section.id === id)
      if (destination?.getClientRects().length) {
        destination.scrollIntoView({ behavior: 'instant', block: 'start' })
        initialHashHandled = true
      } else if (!id) initialHashHandled = true
    }

    const visible = sections.filter(
      (section) =>
        section.getClientRects().length && !section.closest('[hidden],[inert]')
    )
    let active = visible[0]
    const rawOffset = Number(nav.dataset.tocOffset ?? 96)
    const offset = Number.isFinite(rawOffset) ? Math.max(0, rawOffset) : 96
    let bestScore = -1
    for (const section of visible) {
      const scroller = scrollParent(section)
      const viewportTop =
        (scroller
          ? scroller.getBoundingClientRect().top + scroller.clientTop
          : 0) + offset
      const viewportBottom = scroller
        ? scroller.getBoundingClientRect().top +
          scroller.clientTop +
          scroller.clientHeight
        : win.innerHeight
      const viewportHeight = Math.max(1, viewportBottom - viewportTop)
      const rect = section.getBoundingClientRect()
      const intersection = Math.max(
        0,
        Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop)
      )
      if (!intersection) continue

      // Visibility is the primary signal. A small leading-edge bias breaks close scores in favor
      // of the section nearest the top of the reading viewport.
      const visibleRatio = intersection / Math.max(1, rect.height)
      const leadingEdgeBias =
        rect.top < viewportTop
          ? 0
          : Math.max(0, 1 - (rect.top - viewportTop) / viewportHeight)
      const score = visibleRatio + leadingEdgeBias / 10
      if (score > bestScore) {
        bestScore = score
        active = section
      }
    }
    if (bestScore < 0) {
      // Preserve the last section the reader passed while the gap before the next one is visible.
      for (const section of visible) {
        const scroller = scrollParent(section)
        const viewportTop =
          (scroller
            ? scroller.getBoundingClientRect().top + scroller.clientTop
            : 0) + offset
        if (section.getBoundingClientRect().top <= viewportTop + 1)
          active = section
      }
    }
    const last = visible.at(-1)
    if (last) {
      const scroller = scrollParent(last)
      const viewportBottom = scroller
        ? scroller.getBoundingClientRect().top +
          scroller.clientTop +
          scroller.clientHeight
        : win.innerHeight
      const atBottom = scroller
        ? scroller.scrollTop + scroller.clientHeight >=
          scroller.scrollHeight - 1
        : win.scrollY + win.innerHeight >= doc.documentElement.scrollHeight - 1
      if (atBottom && last.getBoundingClientRect().top < viewportBottom)
        active = last
    }
    links.forEach((link, index) => {
      if (sections[index] === active)
        link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  function schedule() {
    if (!destroyed && !frame) frame = win.requestAnimationFrame(update)
  }
  const resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(schedule)
  const observer = new MutationObserver((records) => {
    if (records.some((record) => !list.contains(record.target))) schedule()
  })
  observer.observe(doc.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'id',
      'data-toc-label',
      'data-toc-for',
      'data-toc-offset',
      'hidden',
      'inert',
    ],
  })
  doc.addEventListener('scroll', schedule, { capture: true, passive: true })
  win.addEventListener('resize', schedule)
  win.addEventListener('hashchange', schedule)
  schedule()

  return {
    destroy() {
      destroyed = true
      win.cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver?.disconnect()
      doc.removeEventListener('scroll', schedule, true)
      win.removeEventListener('resize', schedule)
      win.removeEventListener('hashchange', schedule)
      list.replaceChildren()
    },
  }
}
