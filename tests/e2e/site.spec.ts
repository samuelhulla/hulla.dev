import { expect, test } from '@playwright/test'

test('copy writes the visible code sample to the clipboard', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/guides/api/quick-start')
  const block = page
    .locator('[data-slot="code-block"]')
    .filter({ visible: true })
    .first()
  const source = await block.locator('pre code').innerText()

  await block.getByRole('button', { name: /^Copy / }).click()

  await expect(block.getByText('Copied', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source)
})

test('search opens, finds indexed content, and restores focus', async ({
  page,
}) => {
  await page.goto('/docs/api')
  const trigger = page.getByRole('button', { name: 'Search documentation' })
  await trigger.click()
  const input = page.getByPlaceholder(
    'Search API concepts, packages, and exports…'
  )
  await expect(input).toBeFocused()
  await input.fill('API Gateway HTTP API v2')
  await expect(
    page.getByRole('option', { name: /AWS Lambda/ }).first()
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('package manager preference syncs across commands and reloads', async ({
  page,
}) => {
  await page.goto('/docs/api/installation')
  const commands = page.locator('[data-package-manager-tabs]')
  await commands.first().getByRole('tab', { name: 'Use pnpm' }).click()
  for (const command of await commands.all()) {
    await expect(
      command.getByRole('tab', { name: 'Use pnpm' })
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      command.locator('[data-slot="tabs-content"][data-value="pnpm"]')
    ).toBeVisible()
  }
  await page.reload()
  await expect(
    commands.first().getByRole('tab', { name: 'Use pnpm' })
  ).toHaveAttribute('aria-selected', 'true')
})

test('mobile navigation opens and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/api')
  await page
    .getByRole('button', { name: 'Open documentation navigation' })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Documentation navigation' })
  await expect(dialog).toBeVisible()
  await expect(
    dialog.locator('[data-slot="sidebar-menu-link"][aria-current="page"]')
  ).toHaveAttribute('href', '/docs/api')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('documentation remains navigable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await page.goto('/docs/api')
  await page.getByText('Browse documentation', { exact: true }).click()
  const navigation = page
    .getByRole('navigation', { name: 'Sidebar navigation', exact: true })
    .filter({ visible: true })
  await expect(navigation.locator('a[aria-current="page"]')).toHaveAttribute(
    'href',
    '/docs/api'
  )
  await context.close()
})
