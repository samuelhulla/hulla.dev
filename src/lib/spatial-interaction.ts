export type SpatialInput = 'keyboard' | 'pointer'

export type DraggableAxis = 'both' | 'x' | 'y'
export type DraggableBoundary = 'none' | 'parent' | 'viewport'

export type SpatialPosition = {
  x: number
  y: number
}

export type DragBounds = {
  maxX: number
  maxY: number
  minX: number
  minY: number
}

export type DragEventDetail = SpatialPosition & {
  canceled: boolean
  deltaX: number
  deltaY: number
  input: SpatialInput
}

export type DraggableOptions = {
  axis?: DraggableAxis
  boundary?: DraggableBoundary
  boundaryPadding?: number
  boundarySelector?: string
  keyboardStep?: number
  onMove?: (detail: DragEventDetail) => void
  onMoveEnd?: (detail: DragEventDetail) => void
  onMoveStart?: (detail: DragEventDetail) => void
}

export type DraggableController = {
  destroy: () => void
}

export const resizeHandleEdges = [
  'north',
  'north-east',
  'east',
  'south-east',
  'south',
  'south-west',
  'west',
  'north-west',
] as const

export type ResizeHandleEdge = (typeof resizeHandleEdges)[number]

export type ResizeGeometry = {
  height: number
  offsetX: number
  offsetY: number
  width: number
}

export type ResizeLimits = {
  maxHeight: number
  maxWidth: number
  minHeight: number
  minWidth: number
}

export type ResizeEventDetail = ResizeGeometry & {
  canceled: boolean
  deltaHeight: number
  deltaWidth: number
  edge: ResizeHandleEdge
  input: SpatialInput
}

export type ResizableOptions = {
  boundary?: DraggableBoundary
  boundaryPadding?: number
  boundarySelector?: string
  keyboardStep?: number
  onResize?: (detail: ResizeEventDetail) => void
  onResizeEnd?: (detail: ResizeEventDetail) => void
  onResizeStart?: (detail: ResizeEventDetail) => void
}

export type ResizableController = {
  destroy: () => void
}

const draggableHandleSelector = '[data-hulla-drag-handle]'
const draggableRootSelector = '[data-hulla-draggable]'
const resizableHandleSelector = '[data-hulla-resize-handle]'
const resizableRootSelector = '[data-hulla-resizable]'

const dragEventNames = {
  end: 'hulla:moveend',
  move: 'hulla:move',
  start: 'hulla:movestart',
} as const

const resizeEventNames = {
  end: 'hulla:resizeend',
  move: 'hulla:resize',
  start: 'hulla:resizestart',
} as const

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const normalizedStep = (step: number | undefined) =>
  Number.isFinite(step) && Number(step) > 0 ? Number(step) : 10

const normalizedPadding = (padding: number | undefined) =>
  Number.isFinite(padding) ? Number(padding) : 0

const eventTargetElement = (event: Event) =>
  event.target instanceof Element ? event.target : undefined

const isDisabledHandle = (handle: HTMLElement) =>
  (handle instanceof HTMLButtonElement && handle.disabled) ||
  handle.getAttribute('aria-disabled') === 'true'

const readNumber = (value: string, fallback = 0) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const readCustomLength = (element: HTMLElement, property: string) =>
  readNumber(
    element.ownerDocument.defaultView
      ?.getComputedStyle(element)
      .getPropertyValue(property) ?? ''
  )

const readMaximum = (value: string) => {
  if (value === 'none') return Number.POSITIVE_INFINITY
  return readNumber(value, Number.POSITIVE_INFINITY)
}

const dispatchDetail = <Detail>(
  element: HTMLElement,
  name: string,
  detail: Detail
): CustomEvent<Detail> => {
  const EventConstructor =
    element.ownerDocument.defaultView?.CustomEvent ?? CustomEvent
  const event = new EventConstructor<Detail>(name, { bubbles: true, detail })
  element.dispatchEvent(event)
  return event
}

const matchingHandle = (
  event: Event,
  root: HTMLElement,
  handleSelector: string,
  rootSelector: string
) => {
  const handle = eventTargetElement(event)?.closest<HTMLElement>(handleSelector)
  if (
    !handle ||
    handle.closest(rootSelector) !== root ||
    isDisabledHandle(handle)
  )
    return
  return handle
}

const dragDetail = (
  position: SpatialPosition,
  start: SpatialPosition,
  input: SpatialInput,
  canceled = false
): DragEventDetail => ({
  ...position,
  canceled,
  deltaX: position.x - start.x,
  deltaY: position.y - start.y,
  input,
})

const resizeDetail = (
  geometry: ResizeGeometry,
  start: ResizeGeometry,
  edge: ResizeHandleEdge,
  input: SpatialInput,
  canceled = false
): ResizeEventDetail => ({
  ...geometry,
  canceled,
  deltaHeight: geometry.height - start.height,
  deltaWidth: geometry.width - start.width,
  edge,
  input,
})

export function resolveDragPosition(
  start: SpatialPosition,
  delta: SpatialPosition,
  axis: DraggableAxis,
  bounds: DragBounds
): SpatialPosition {
  const x =
    axis === 'y' ? start.x : clamp(start.x + delta.x, bounds.minX, bounds.maxX)
  const y =
    axis === 'x' ? start.y : clamp(start.y + delta.y, bounds.minY, bounds.maxY)
  return { x, y }
}

export function resolveResizeGeometry(
  start: ResizeGeometry,
  delta: SpatialPosition,
  edge: ResizeHandleEdge,
  limits: ResizeLimits
): ResizeGeometry {
  const movesEast = edge.includes('east')
  const movesNorth = edge.includes('north')
  const movesSouth = edge.includes('south')
  const movesWest = edge.includes('west')

  const width = movesEast
    ? clamp(start.width + delta.x, limits.minWidth, limits.maxWidth)
    : movesWest
      ? clamp(start.width - delta.x, limits.minWidth, limits.maxWidth)
      : start.width
  const height = movesSouth
    ? clamp(start.height + delta.y, limits.minHeight, limits.maxHeight)
    : movesNorth
      ? clamp(start.height - delta.y, limits.minHeight, limits.maxHeight)
      : start.height

  return {
    height,
    offsetX: movesWest ? start.offsetX + start.width - width : start.offsetX,
    offsetY: movesNorth ? start.offsetY + start.height - height : start.offsetY,
    width,
  }
}

const readDragPosition = (root: HTMLElement): SpatialPosition => ({
  x: readCustomLength(root, '--hulla-drag-x'),
  y: readCustomLength(root, '--hulla-drag-y'),
})

const writeDragPosition = (root: HTMLElement, position: SpatialPosition) => {
  root.style.setProperty('--hulla-drag-x', `${position.x}px`)
  root.style.setProperty('--hulla-drag-y', `${position.y}px`)
  root.dataset.positionX = String(position.x)
  root.dataset.positionY = String(position.y)
}

const unconstrainedDragBounds = (): DragBounds => ({
  maxX: Number.POSITIVE_INFINITY,
  maxY: Number.POSITIVE_INFINITY,
  minX: Number.NEGATIVE_INFINITY,
  minY: Number.NEGATIVE_INFINITY,
})

type SpatialRect = {
  bottom: number
  left: number
  right: number
  top: number
}

const elementContentRect = (element: HTMLElement): SpatialRect => {
  const rect = element.getBoundingClientRect()
  const left = rect.left + element.clientLeft
  const top = rect.top + element.clientTop
  return {
    bottom: top + element.clientHeight,
    left,
    right: left + element.clientWidth,
    top,
  }
}

const matchingBoundaryElement = (root: HTMLElement, selector: string) => {
  try {
    return (
      root.parentElement?.closest<HTMLElement>(selector) ??
      root.ownerDocument.querySelector<HTMLElement>(selector)
    )
  } catch {
    return undefined
  }
}

const boundaryRectFor = (
  root: HTMLElement,
  boundary: DraggableBoundary,
  boundarySelector: string | undefined,
  boundaryPadding: number
): SpatialRect | undefined => {
  if (boundary === 'none' && !boundarySelector) return

  const selectedBoundary = boundarySelector
    ? matchingBoundaryElement(root, boundarySelector)
    : undefined
  const boundaryElement =
    selectedBoundary ?? (boundary === 'parent' ? root.parentElement : undefined)
  const rect = boundaryElement
    ? elementContentRect(boundaryElement)
    : boundary === 'viewport'
      ? {
          bottom: root.ownerDocument.documentElement.clientHeight,
          left: 0,
          right: root.ownerDocument.documentElement.clientWidth,
          top: 0,
        }
      : undefined

  if (!rect) return
  return {
    bottom: rect.bottom - boundaryPadding,
    left: rect.left + boundaryPadding,
    right: rect.right - boundaryPadding,
    top: rect.top + boundaryPadding,
  }
}

const visualDragRect = (root: HTMLElement): SpatialRect => {
  const rects = [root, ...root.querySelectorAll<HTMLElement>('*')]
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 || rect.height > 0)

  const rootRect = root.getBoundingClientRect()
  if (rects.length === 0) return rootRect

  return {
    bottom: Math.max(...rects.map((rect) => rect.bottom)),
    left: Math.min(...rects.map((rect) => rect.left)),
    right: Math.max(...rects.map((rect) => rect.right)),
    top: Math.min(...rects.map((rect) => rect.top)),
  }
}

const dragBoundsFor = (
  root: HTMLElement,
  boundary: DraggableBoundary,
  boundarySelector: string | undefined,
  boundaryPadding: number,
  position: SpatialPosition
): DragBounds => {
  const boundaryRect = boundaryRectFor(
    root,
    boundary,
    boundarySelector,
    boundaryPadding
  )
  if (!boundaryRect) return unconstrainedDragBounds()

  const rootRect = visualDragRect(root)
  const minX = position.x + boundaryRect.left - rootRect.left
  const maxX = position.x + boundaryRect.right - rootRect.right
  const minY = position.y + boundaryRect.top - rootRect.top
  const maxY = position.y + boundaryRect.bottom - rootRect.bottom

  return {
    maxX: maxX < minX ? position.x : maxX,
    maxY: maxY < minY ? position.y : maxY,
    minX: maxX < minX ? position.x : minX,
    minY: maxY < minY ? position.y : minY,
  }
}

export function connectDraggable(
  root: HTMLElement,
  options: DraggableOptions = {}
): DraggableController {
  const ownerWindow = root.ownerDocument.defaultView ?? window
  const axis = options.axis ?? 'both'
  const boundary = options.boundary ?? 'parent'
  const boundaryPadding = normalizedPadding(options.boundaryPadding)
  const boundarySelector = options.boundarySelector
  const keyboardStep = normalizedStep(options.keyboardStep)
  let frame = 0
  let active:
    | {
        bounds: DragBounds
        handle: HTMLElement
        pointerId: number
        startClient: SpatialPosition
        startPosition: SpatialPosition
      }
    | undefined
  let pendingClient: SpatialPosition | undefined

  root.dataset.hullaDraggable = ''
  root.dataset.state = 'idle'

  const emit = (
    phase: keyof typeof dragEventNames,
    detail: DragEventDetail
  ) => {
    if (phase === 'start') options.onMoveStart?.(detail)
    if (phase === 'move') options.onMove?.(detail)
    if (phase === 'end') options.onMoveEnd?.(detail)
    dispatchDetail(root, dragEventNames[phase], detail)
  }

  const applyPointerPosition = (client: SpatialPosition) => {
    if (!active) return
    const position = resolveDragPosition(
      active.startPosition,
      {
        x: client.x - active.startClient.x,
        y: client.y - active.startClient.y,
      },
      axis,
      active.bounds
    )
    writeDragPosition(root, position)
    emit('move', dragDetail(position, active.startPosition, 'pointer'))
  }

  const flushPointerPosition = () => {
    frame = 0
    if (!pendingClient) return
    const client = pendingClient
    pendingClient = undefined
    applyPointerPosition(client)
  }

  const finishPointer = (canceled: boolean, client?: SpatialPosition) => {
    if (!active) return
    ownerWindow.removeEventListener('pointermove', onPointerMove)
    ownerWindow.removeEventListener('pointerup', onPointerUp)
    ownerWindow.removeEventListener('pointercancel', onPointerCancel)
    if (frame) {
      ownerWindow.cancelAnimationFrame(frame)
      frame = 0
    }
    pendingClient = undefined
    if (client) applyPointerPosition(client)

    const completed = active
    const position = readDragPosition(root)
    active = undefined
    root.dataset.state = 'idle'
    completed.handle.dataset.state = 'idle'
    try {
      if (completed.handle.hasPointerCapture(completed.pointerId)) {
        completed.handle.releasePointerCapture(completed.pointerId)
      }
    } catch {
      // Pointer capture can already be released after cancellation or DOM removal.
    }
    emit(
      'end',
      dragDetail(position, completed.startPosition, 'pointer', canceled)
    )
  }

  const onPointerDown = (event: PointerEvent) => {
    const handle = matchingHandle(
      event,
      root,
      draggableHandleSelector,
      draggableRootSelector
    )
    if (
      !handle ||
      active ||
      !event.isPrimary ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return
    }

    const startPosition = readDragPosition(root)
    active = {
      bounds: dragBoundsFor(
        root,
        boundary,
        boundarySelector,
        boundaryPadding,
        startPosition
      ),
      handle,
      pointerId: event.pointerId,
      startClient: { x: event.clientX, y: event.clientY },
      startPosition,
    }
    root.dataset.state = 'dragging'
    handle.dataset.state = 'dragging'
    emit('start', dragDetail(startPosition, startPosition, 'pointer'))
    ownerWindow.addEventListener('pointermove', onPointerMove)
    ownerWindow.addEventListener('pointerup', onPointerUp)
    ownerWindow.addEventListener('pointercancel', onPointerCancel)
    try {
      handle.setPointerCapture(event.pointerId)
    } catch {
      // The interaction still works while the pointer remains over the handle.
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return
    pendingClient = { x: event.clientX, y: event.clientY }
    if (!frame) frame = ownerWindow.requestAnimationFrame(flushPointerPosition)
  }

  const onPointerUp = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return
    finishPointer(false, { x: event.clientX, y: event.clientY })
  }

  const onPointerCancel = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return
    finishPointer(true)
  }

  const onLostPointerCapture = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return
    finishPointer(true)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const handle = matchingHandle(
      event,
      root,
      draggableHandleSelector,
      draggableRootSelector
    )
    if (!handle || event.altKey || event.ctrlKey || event.metaKey) return

    const direction =
      event.key === 'ArrowLeft'
        ? { x: -1, y: 0 }
        : event.key === 'ArrowRight'
          ? { x: 1, y: 0 }
          : event.key === 'ArrowUp'
            ? { x: 0, y: -1 }
            : event.key === 'ArrowDown'
              ? { x: 0, y: 1 }
              : undefined
    if (!direction) return

    event.preventDefault()
    const startPosition = readDragPosition(root)
    const multiplier = event.shiftKey ? 10 : 1
    const position = resolveDragPosition(
      startPosition,
      {
        x: direction.x * keyboardStep * multiplier,
        y: direction.y * keyboardStep * multiplier,
      },
      axis,
      dragBoundsFor(
        root,
        boundary,
        boundarySelector,
        boundaryPadding,
        startPosition
      )
    )
    root.dataset.state = 'dragging'
    handle.dataset.state = 'dragging'
    emit('start', dragDetail(startPosition, startPosition, 'keyboard'))
    writeDragPosition(root, position)
    const detail = dragDetail(position, startPosition, 'keyboard')
    emit('move', detail)
    root.dataset.state = 'idle'
    handle.dataset.state = 'idle'
    emit('end', detail)
  }

  const onWindowBlur = () => finishPointer(true)

  root.addEventListener('pointerdown', onPointerDown)
  root.addEventListener('lostpointercapture', onLostPointerCapture)
  root.addEventListener('keydown', onKeyDown)
  ownerWindow.addEventListener('blur', onWindowBlur)

  return {
    destroy: () => {
      finishPointer(true)
      if (frame) ownerWindow.cancelAnimationFrame(frame)
      delete root.dataset.hullaDraggable
      delete root.dataset.positionX
      delete root.dataset.positionY
      delete root.dataset.state
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('lostpointercapture', onLostPointerCapture)
      root.removeEventListener('keydown', onKeyDown)
      ownerWindow.removeEventListener('pointermove', onPointerMove)
      ownerWindow.removeEventListener('pointerup', onPointerUp)
      ownerWindow.removeEventListener('pointercancel', onPointerCancel)
      ownerWindow.removeEventListener('blur', onWindowBlur)
    },
  }
}

const readResizeGeometry = (root: HTMLElement): ResizeGeometry => {
  const rect = root.getBoundingClientRect()
  return {
    height: rect.height,
    offsetX: readCustomLength(root, '--hulla-resize-x'),
    offsetY: readCustomLength(root, '--hulla-resize-y'),
    width: rect.width,
  }
}

const resizeLimitsFor = (
  root: HTMLElement,
  edge: ResizeHandleEdge,
  boundary: DraggableBoundary,
  boundarySelector: string | undefined,
  boundaryPadding: number
): ResizeLimits => {
  const computed = root.ownerDocument.defaultView?.getComputedStyle(root)
  const limits = {
    maxHeight: computed
      ? readMaximum(computed.maxHeight)
      : Number.POSITIVE_INFINITY,
    maxWidth: computed
      ? readMaximum(computed.maxWidth)
      : Number.POSITIVE_INFINITY,
    minHeight: computed ? readNumber(computed.minHeight) : 0,
    minWidth: computed ? readNumber(computed.minWidth) : 0,
  }

  const boundaryRect = boundaryRectFor(
    root,
    boundary,
    boundarySelector,
    boundaryPadding
  )
  if (!boundaryRect) return limits

  const rect = root.getBoundingClientRect()
  const boundaryMaxWidth = edge.includes('west')
    ? rect.width + rect.left - boundaryRect.left
    : edge.includes('east')
      ? boundaryRect.right - rect.left
      : Number.POSITIVE_INFINITY
  const boundaryMaxHeight = edge.includes('north')
    ? rect.height + rect.top - boundaryRect.top
    : edge.includes('south')
      ? boundaryRect.bottom - rect.top
      : Number.POSITIVE_INFINITY

  return {
    ...limits,
    maxHeight: Math.max(
      limits.minHeight,
      Math.min(limits.maxHeight, boundaryMaxHeight)
    ),
    maxWidth: Math.max(
      limits.minWidth,
      Math.min(limits.maxWidth, boundaryMaxWidth)
    ),
  }
}

const edgeMovesHorizontally = (edge: ResizeHandleEdge) =>
  edge.includes('east') || edge.includes('west')

const edgeMovesVertically = (edge: ResizeHandleEdge) =>
  edge.includes('north') || edge.includes('south')

const writeResizeGeometry = (
  root: HTMLElement,
  geometry: ResizeGeometry,
  edge: ResizeHandleEdge,
  anchorRect: SpatialRect
): ResizeGeometry => {
  const applied = { ...geometry }
  if (edgeMovesHorizontally(edge)) root.style.width = `${geometry.width}px`
  if (edgeMovesVertically(edge)) root.style.height = `${geometry.height}px`
  root.style.setProperty('--hulla-resize-x', `${geometry.offsetX}px`)
  root.style.setProperty('--hulla-resize-y', `${geometry.offsetY}px`)

  const rect = root.getBoundingClientRect()
  if (edge.includes('west')) applied.offsetX += anchorRect.right - rect.right
  else if (edge.includes('east')) applied.offsetX += anchorRect.left - rect.left
  if (edge.includes('north')) applied.offsetY += anchorRect.bottom - rect.bottom
  else if (edge.includes('south')) applied.offsetY += anchorRect.top - rect.top

  root.style.setProperty('--hulla-resize-x', `${applied.offsetX}px`)
  root.style.setProperty('--hulla-resize-y', `${applied.offsetY}px`)
  root.dataset.width = String(applied.width)
  root.dataset.height = String(applied.height)
  return applied
}

const edgeFromHandle = (handle: HTMLElement): ResizeHandleEdge | undefined => {
  const edge = handle.dataset.edge
  return resizeHandleEdges.find((candidate) => candidate === edge)
}

export function connectResizable(
  root: HTMLElement,
  options: ResizableOptions = {}
): ResizableController {
  const ownerWindow = root.ownerDocument.defaultView ?? window
  const boundary = options.boundary ?? 'parent'
  const boundaryPadding = normalizedPadding(options.boundaryPadding)
  const boundarySelector = options.boundarySelector
  const keyboardStep = normalizedStep(options.keyboardStep)
  let frame = 0
  let active:
    | {
        edge: ResizeHandleEdge
        handle: HTMLElement
        limits: ResizeLimits
        pointerId: number
        startRect: SpatialRect
        startClient: SpatialPosition
        startGeometry: ResizeGeometry
      }
    | undefined
  let pendingClient: SpatialPosition | undefined

  root.dataset.hullaResizable = ''
  root.dataset.state = 'idle'

  const emit = (
    phase: keyof typeof resizeEventNames,
    detail: ResizeEventDetail
  ) => {
    if (phase === 'start') options.onResizeStart?.(detail)
    if (phase === 'move') options.onResize?.(detail)
    if (phase === 'end') options.onResizeEnd?.(detail)
    dispatchDetail(root, resizeEventNames[phase], detail)
  }

  const applyPointerGeometry = (client: SpatialPosition) => {
    if (!active) return
    const geometry = writeResizeGeometry(
      root,
      resolveResizeGeometry(
        active.startGeometry,
        {
          x: client.x - active.startClient.x,
          y: client.y - active.startClient.y,
        },
        active.edge,
        active.limits
      ),
      active.edge,
      active.startRect
    )
    emit(
      'move',
      resizeDetail(geometry, active.startGeometry, active.edge, 'pointer')
    )
  }

  const flushPointerGeometry = () => {
    frame = 0
    if (!pendingClient) return
    const client = pendingClient
    pendingClient = undefined
    applyPointerGeometry(client)
  }

  const finishPointer = (canceled: boolean, client?: SpatialPosition) => {
    if (!active) return
    ownerWindow.removeEventListener('pointermove', onPointerMove)
    ownerWindow.removeEventListener('pointerup', onPointerUp)
    ownerWindow.removeEventListener('pointercancel', onPointerCancel)
    if (frame) {
      ownerWindow.cancelAnimationFrame(frame)
      frame = 0
    }
    pendingClient = undefined
    if (client) applyPointerGeometry(client)

    const completed = active
    const geometry = readResizeGeometry(root)
    active = undefined
    root.dataset.state = 'idle'
    completed.handle.dataset.state = 'idle'
    try {
      if (completed.handle.hasPointerCapture(completed.pointerId)) {
        completed.handle.releasePointerCapture(completed.pointerId)
      }
    } catch {
      // Pointer capture can already be released after cancellation or DOM removal.
    }
    emit(
      'end',
      resizeDetail(
        geometry,
        completed.startGeometry,
        completed.edge,
        'pointer',
        canceled
      )
    )
  }

  const onPointerDown = (event: PointerEvent) => {
    const handle = matchingHandle(
      event,
      root,
      resizableHandleSelector,
      resizableRootSelector
    )
    const edge = handle ? edgeFromHandle(handle) : undefined
    if (
      !handle ||
      !edge ||
      active ||
      !event.isPrimary ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return
    }

    const startGeometry = readResizeGeometry(root)
    active = {
      edge,
      handle,
      limits: resizeLimitsFor(
        root,
        edge,
        boundary,
        boundarySelector,
        boundaryPadding
      ),
      pointerId: event.pointerId,
      startRect: root.getBoundingClientRect(),
      startClient: { x: event.clientX, y: event.clientY },
      startGeometry,
    }
    root.dataset.state = 'resizing'
    handle.dataset.state = 'resizing'
    emit('start', resizeDetail(startGeometry, startGeometry, edge, 'pointer'))
    ownerWindow.addEventListener('pointermove', onPointerMove)
    ownerWindow.addEventListener('pointerup', onPointerUp)
    ownerWindow.addEventListener('pointercancel', onPointerCancel)
    try {
      handle.setPointerCapture(event.pointerId)
    } catch {
      // The interaction still works while the pointer remains over the handle.
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return
    pendingClient = { x: event.clientX, y: event.clientY }
    if (!frame) frame = ownerWindow.requestAnimationFrame(flushPointerGeometry)
  }

  const onPointerUp = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return
    finishPointer(false, { x: event.clientX, y: event.clientY })
  }

  const onPointerCancel = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return
    finishPointer(true)
  }

  const onLostPointerCapture = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return
    finishPointer(true)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const handle = matchingHandle(
      event,
      root,
      resizableHandleSelector,
      resizableRootSelector
    )
    const edge = handle ? edgeFromHandle(handle) : undefined
    if (!handle || !edge || event.altKey || event.ctrlKey || event.metaKey)
      return

    const direction =
      event.key === 'ArrowLeft'
        ? { x: -1, y: 0 }
        : event.key === 'ArrowRight'
          ? { x: 1, y: 0 }
          : event.key === 'ArrowUp'
            ? { x: 0, y: -1 }
            : event.key === 'ArrowDown'
              ? { x: 0, y: 1 }
              : undefined
    if (!direction) return

    event.preventDefault()
    const startGeometry = readResizeGeometry(root)
    const startRect = root.getBoundingClientRect()
    const multiplier = event.shiftKey ? 10 : 1
    const geometry = writeResizeGeometry(
      root,
      resolveResizeGeometry(
        startGeometry,
        {
          x: direction.x * keyboardStep * multiplier,
          y: direction.y * keyboardStep * multiplier,
        },
        edge,
        resizeLimitsFor(root, edge, boundary, boundarySelector, boundaryPadding)
      ),
      edge,
      startRect
    )
    root.dataset.state = 'resizing'
    handle.dataset.state = 'resizing'
    emit('start', resizeDetail(startGeometry, startGeometry, edge, 'keyboard'))
    const detail = resizeDetail(geometry, startGeometry, edge, 'keyboard')
    emit('move', detail)
    root.dataset.state = 'idle'
    handle.dataset.state = 'idle'
    emit('end', detail)
  }

  const onWindowBlur = () => finishPointer(true)

  root.addEventListener('pointerdown', onPointerDown)
  root.addEventListener('lostpointercapture', onLostPointerCapture)
  root.addEventListener('keydown', onKeyDown)
  ownerWindow.addEventListener('blur', onWindowBlur)

  return {
    destroy: () => {
      finishPointer(true)
      if (frame) ownerWindow.cancelAnimationFrame(frame)
      delete root.dataset.hullaResizable
      delete root.dataset.width
      delete root.dataset.height
      delete root.dataset.state
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('lostpointercapture', onLostPointerCapture)
      root.removeEventListener('keydown', onKeyDown)
      ownerWindow.removeEventListener('pointermove', onPointerMove)
      ownerWindow.removeEventListener('pointerup', onPointerUp)
      ownerWindow.removeEventListener('pointercancel', onPointerCancel)
      ownerWindow.removeEventListener('blur', onWindowBlur)
    },
  }
}
