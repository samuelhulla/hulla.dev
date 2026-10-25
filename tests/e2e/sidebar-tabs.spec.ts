import { expect, test } from '@playwright/test'

test('sidebar tabs fill the rail and stay visible while navigation scrolls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 600 })
  await page.goto('/docs/api')
  const sidebar = page.locator('.docs-sidebar-rail [data-slot="sidebar"]')
  const list = sidebar.getByRole('tablist', { name: 'Documentation area' })
  const tabs = list.getByRole('tab')
  const railBox = (await sidebar.boundingBox())!
  const listBox = (await list.boundingBox())!
  expect(listBox.x).toBe(railBox.x)
  expect(listBox.width).toBeCloseTo(railBox.width - 1, 0)
  for (const tab of await tabs.all()) {
    expect((await tab.boundingBox())!.width).toBeCloseTo(listBox.width / 3, 0)
  }

  // Open real navigation branches to force the content area to overflow.
  for (const group of await sidebar
    .locator('[data-docs-sidebar-group] > summary')
    .all()) {
    if (await group.isVisible()) {
      if ((await group.getAttribute('aria-expanded')) !== 'true')
        await group.click()
    }
  }
  const content = sidebar.locator('[data-slot="sidebar-content"]')
  await page.evaluate(() => window.scrollTo(0, 0))
  const beforeScroll = (await list.boundingBox())!
  await content.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await expect
    .poll(() => content.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0)
  expect((await list.boundingBox())!.y).toBe(beforeScroll.y)
  await tabs.getByText('Guides', { exact: true }).click()
  await expect(
    sidebar.getByRole('tabpanel', { name: 'Guides', exact: true })
  ).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.getByText('Reference', { exact: true })).toBeFocused()
  await expect(
    sidebar.getByRole('tabpanel', { name: 'Reference', exact: true })
  ).toBeVisible()
  await page.keyboard.press('Home')
  await expect(tabs.getByText('Docs', { exact: true })).toBeFocused()
})

test('inset desktop sidebar blends into the page in both themes', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.addInitScript(
      (value) => localStorage.setItem('hulla-theme', value),
      theme
    )
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/docs/api')
    const sidebar = page.locator('.docs-sidebar-rail [data-slot="sidebar"]')
    expect((await sidebar.boundingBox())!.x).toBeGreaterThan(0)
    await expect(sidebar).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await page.screenshot({ path: `output/playwright/sidebar-${theme}.png` })
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(sidebar).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  }
})
