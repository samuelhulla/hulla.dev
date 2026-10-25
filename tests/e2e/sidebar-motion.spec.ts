import { expect, test } from '@playwright/test'

test('sidebar navigation restores open branches without replaying disclosure motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.addInitScript(() => {
    document.addEventListener('transitionrun', (event) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest('[data-docs-sidebar-group]') ||
        ![
          'block-size',
          'content-visibility',
          'opacity',
          'translate',
          'rotate',
          'transform',
        ].includes(event.propertyName)
      )
        return
      const root = document.documentElement
      root.dataset.sidebarTransitions = String(
        Number(root.dataset.sidebarTransitions ?? 0) + 1
      )
    })
  })
  const transitionCount = () =>
    page.evaluate(() =>
      Number(document.documentElement.dataset.sidebarTransitions ?? 0)
    )
  const section = page
    .locator('[data-docs-sidebar-group="section:server"]')
    .filter({ visible: true })
  const adapters = page
    .locator('[data-docs-sidebar-group="/docs/api/servers"]')
    .filter({ visible: true })

  await page.goto('/docs/api')
  expect(await transitionCount()).toBe(0)
  await section.locator(':scope > summary').click()
  await adapters.locator(':scope > summary').click()
  await expect(adapters).toHaveJSProperty('open', true)
  expect(await transitionCount()).toBeGreaterThan(0)

  await adapters.getByRole('link', { name: 'Express', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/api\/servers\/express$/)
  await expect(section).toHaveJSProperty('open', true)
  await expect(adapters).toHaveJSProperty('open', true)
  expect(await transitionCount()).toBe(0)

  await page.reload()
  await expect(adapters).toHaveJSProperty('open', true)
  expect(await transitionCount()).toBe(0)
})
