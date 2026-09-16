import { appSessionStorage } from '@/lib/session-storage'

export function connectDocsSidebarState(root: ParentNode = document) {
  const groups = Array.from(
    root.querySelectorAll<HTMLDetailsElement>(
      'details[data-docs-sidebar-group][data-docs-sidebar-package]'
    )
  )
  if (groups.length === 0) return { destroy() {} }

  const state = appSessionStorage.get('docsSidebar')
  const packages = new Set(
    groups.map((group) => group.dataset.docsSidebarPackage ?? '')
  )

  for (const packageName of packages) {
    const packageGroups = groups.filter(
      (group) => group.dataset.docsSidebarPackage === packageName
    )
    const hasSavedState = Object.hasOwn(state, packageName)
    const openGroups = new Set(
      hasSavedState
        ? state[packageName]
        : packageGroups
            .filter((group) => group.open)
            .map((group) => group.dataset.docsSidebarGroup ?? '')
    )

    for (const group of packageGroups) {
      if (group.dataset.docsSidebarActive === 'true') {
        openGroups.add(group.dataset.docsSidebarGroup ?? '')
      }
    }

    state[packageName] = [...openGroups].filter(Boolean)
    for (const group of packageGroups) {
      group.open = openGroups.has(group.dataset.docsSidebarGroup ?? '')
    }
  }

  appSessionStorage.set('docsSidebar', state)

  const onToggle = (event: Event) => {
    const source = event.currentTarget
    if (!(source instanceof HTMLDetailsElement)) return

    const packageName = source.dataset.docsSidebarPackage
    const groupName = source.dataset.docsSidebarGroup
    if (!packageName || !groupName) return

    const openGroups = new Set(state[packageName] ?? [])
    if (source.open) openGroups.add(groupName)
    else openGroups.delete(groupName)
    state[packageName] = [...openGroups]

    for (const group of groups) {
      if (
        group !== source &&
        group.dataset.docsSidebarPackage === packageName &&
        group.dataset.docsSidebarGroup === groupName &&
        group.open !== source.open
      ) {
        group.open = source.open
      }
    }

    appSessionStorage.set('docsSidebar', state)
  }

  for (const group of groups) group.addEventListener('toggle', onToggle)

  return {
    destroy() {
      for (const group of groups) group.removeEventListener('toggle', onToggle)
    },
  }
}
