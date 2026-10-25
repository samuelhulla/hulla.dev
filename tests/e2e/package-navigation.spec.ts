import { expect, test } from '@playwright/test'

test('package search opens docs directly with Enter', async ({ page }) => {
  await page.goto('/docs/api')
  await page
    .getByRole('button', { name: 'Choose package, current package @hulla/api' })
    .click()
  const picker = page.getByRole('dialog', {
    name: 'Switch package',
    exact: true,
  })
  const search = picker.getByRole('searchbox', { name: 'Find a package' })
  await expect(search).toBeFocused()
  await expect(picker.locator('[data-package-quick-link]:visible')).toHaveCount(
    8
  )
  await expect(picker.locator('[data-demo]:visible')).toHaveCount(0)
  // "cli" must prioritize the package over summaries containing "client".
  await search.fill('cli')
  await expect(picker.locator('[data-package-quick-link]:visible')).toHaveCount(
    1
  )
  await search.press('Enter')
  await expect(page).toHaveURL(/\/docs\/cli\/?$/)
})

test('preview retains a visible docs destination and returns to the quick list', async ({
  page,
}) => {
  await page.goto('/docs/api')
  const trigger = page.getByRole('button', {
    name: 'Choose package, current package @hulla/api',
  })
  await trigger.click()
  await page
    .getByRole('button', { name: 'Preview @hulla/style', exact: true })
    .click()
  const preview = page.getByRole('dialog', {
    name: 'Package preview',
    exact: true,
  })
  await expect(
    preview.getByRole('link', { name: 'Read @hulla/style docs', exact: true })
  ).toBeVisible()
  await expect(
    preview.getByRole('link', { name: 'Read @hulla/style docs', exact: true })
  ).toHaveAttribute('href', /\/docs\/style$/)
  await preview
    .getByRole('tab', {
      name: '@hulla/db PostgreSQL & live queries',
      exact: true,
    })
    .click()
  await expect(
    preview.getByRole('link', { name: 'Read @hulla/db docs', exact: true })
  ).toHaveAttribute('href', /\/docs\/db$/)
  await preview
    .getByRole('button', { name: 'All packages', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Preview @hulla/style', exact: true })
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-package-chooser-dialog]')).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('quick switching and preview work inside the mobile navigation layer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/api')
  await page
    .getByRole('button', { name: 'Open documentation navigation' })
    .click()
  const trigger = page.getByRole('button', {
    name: 'Choose package, current package @hulla/api',
  })
  await trigger.click()
  const search = page.getByRole('searchbox', { name: 'Find a package' })
  await search.fill('database')
  await page
    .getByRole('button', { name: 'Preview @hulla/db', exact: true })
    .click()
  const preview = page.getByRole('dialog', {
    name: 'Package preview',
    exact: true,
  })
  await expect(
    preview.getByRole('link', { name: 'Read @hulla/db docs', exact: true })
  ).toBeVisible()
  const bounds = await preview.locator('[data-slot="dialog"]').boundingBox()
  expect(bounds!.width).toBeLessThanOrEqual(390)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(
    page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  ).toBeVisible()
})

test('home discovery and docs directory have direct links without a picker layout', async ({
  page,
}) => {
  await page.goto('/#showcase-api')
  await expect(page.locator('.package-explorer')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /^Read .+ docs$/ })).toHaveCount(
    8
  )
  await expect(page.getByLabel('Live TypeScript project')).toBeVisible()
  await page.goto('/docs')
  const directory = page.getByRole('navigation', {
    name: 'Package documentation',
    exact: true,
  })
  await expect(directory.getByRole('link')).toHaveCount(8)
  await directory.getByRole('link', { name: /@hulla\/style/ }).click()
  await expect(page).toHaveURL(/\/docs\/style\/?$/)
})
