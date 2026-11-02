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

for (const width of [1280, 390]) {
  test(`package preview preserves nested editor tabs at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const theme of ['light', 'dark']) {
      await page.goto('/docs/api')
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value
      }, theme)
      const docs = page.locator('main [data-demo="api"]')
      await expect(
        docs.getByRole('textbox', { name: 'Edit contract.ts', exact: true })
      ).toBeVisible()
      const measureTabs = (root: typeof docs) =>
        root
          .locator('[data-slot="code-block-header"] > [data-slot="tabs-list"]')
          .evaluateAll((lists) =>
            lists.map((list) => {
              const style = getComputedStyle(list)
              const tab = list.querySelector('[role="tab"]')!
              return {
                display: style.display,
                position: style.position,
                padding: style.padding,
                listHeight: list.getBoundingClientRect().height,
                tabHeight: tab.getBoundingClientRect().height,
              }
            })
          )
      const expected = await measureTabs(docs)
      if (width < 900)
        await page
          .getByRole('button', { name: 'Open documentation navigation' })
          .click()
      await page
        .getByRole('button', {
          name: 'Choose package, current package @hulla/api',
        })
        .click()
      await page
        .getByRole('button', { name: 'Preview @hulla/api', exact: true })
        .click()
      const preview = page.getByRole('dialog', {
        name: 'Package preview',
        exact: true,
      })
      const editor = preview.locator('[data-demo="api"]')
      await expect(
        editor.getByRole('textbox', { name: 'Edit contract.ts', exact: true })
      ).toBeVisible()
      expect(await measureTabs(editor)).toEqual(expected)
      await editor.getByRole('tab', { name: 'server.ts', exact: true }).click()
      await expect(
        editor.getByRole('textbox', { name: 'Edit server.ts', exact: true })
      ).toBeVisible()
      await editor
        .getByRole('tab', { name: 'server.ts', exact: true })
        .press('ArrowRight')
      await expect(
        editor.getByRole('tab', { name: 'profile.ts', exact: true })
      ).toBeFocused()
    }
  })
}
