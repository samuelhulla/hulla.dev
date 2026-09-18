import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const route of ['/', '/docs/api', '/docs/ui']) {
  test(`${route} is responsive and accessible`, async ({ page }) => {
    await page.goto(route)
    await expect(page.locator('main h1')).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    if (route === '/') await expect(page.locator('astro-island')).toHaveCount(0)
  })
}

test('Markdown does not change embedded component appearance in either theme', async ({
  page,
}) => {
  await page.goto('/docs/ui')
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value
    }, theme)
    const result = await page.evaluate(() => {
      const examples = [...document.querySelectorAll('[data-fidelity-example]')]
      const props = [
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'letter-spacing',
        'color',
        'background-color',
        'border-top-color',
        'border-top-width',
        'border-radius',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'box-shadow',
      ]
      const read = (root: Element) =>
        [...root.querySelectorAll('[data-slot], button')].map((el) =>
          Object.fromEntries(
            props.map((prop) => [
              prop,
              getComputedStyle(el).getPropertyValue(prop),
            ])
          )
        )
      return [read(examples[0]!), read(examples[1]!)]
    })
    expect(result[0]?.length).toBeGreaterThan(5)
    expect(result[0]).toEqual(result[1])
  }
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

test('architecture overview and package preferences remain functional', async ({
  page,
}) => {
  await page.goto('/docs/api/mental-model')
  const architecture = page.getByRole('region', {
    name: '@hulla/api architecture',
  })
  await expect(architecture).toBeVisible()
  await expect(
    architecture.getByText('Typed client', { exact: true })
  ).toBeVisible()
  await expect(
    architecture.getByText('Implementation', { exact: true })
  ).toBeVisible()
  await expect(
    architecture.getByText('Your application owns:', { exact: true })
  ).toBeVisible()
  await expect(
    architecture.getByText('@hulla/api owns:', { exact: true })
  ).toBeVisible()
  await page.goto('/docs/api/installation')
  const commands = page.locator('[data-package-manager-tabs]')
  await commands.first().getByRole('tab', { name: 'Use pnpm' }).click()
  for (const command of await commands.all()) {
    await expect(
      command.getByRole('tab', { name: 'Use pnpm' })
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      command.locator('[data-slot="tabs-content"]:visible')
    ).toContainText('pnpm add')
  }
  await page.reload()
  await expect(
    commands.first().getByRole('tab', { name: 'Use pnpm' })
  ).toHaveAttribute('aria-selected', 'true')
})

test('mobile navigation opens and closes with Escape', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile navigation')
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
}, info) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport:
      info.project.name === 'mobile'
        ? { width: 390, height: 844 }
        : { width: 1440, height: 900 },
  })
  const page = await context.newPage()
  await page.goto('/docs/api')
  if (info.project.name === 'mobile')
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
