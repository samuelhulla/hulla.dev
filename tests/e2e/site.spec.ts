import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const route of [
  '/',
  '/docs',
  '/docs/api',
  '/docs/api/core/contracts',
  '/docs/ui',
]) {
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
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(200)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  }
  await expect(
    page.locator('.md-table [data-slot="table-container"]')
  ).toHaveAttribute('tabindex', '0')
  await expect(page.locator('.md-table table')).toHaveCSS('display', 'table')
  await expect(
    page.locator('[data-slot="code-block-code"]').first()
  ).toContainText("import Button from '@/components/button/button.astro'")
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

test('boundary tree and package preferences remain functional', async ({
  page,
}) => {
  await page.goto('/docs/api')
  await page.getByRole('treeitem', { name: /implementation\.ts/ }).click()
  await expect(page.locator('[data-boundary-title]')).toHaveText(
    'implementation.ts'
  )
  await expect(page.locator('[data-boundary-scope]')).toHaveText('Server only')
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

test('breadcrumbs preserve existing group routes', async ({ page }) => {
  await page.goto('/docs/api/core/contracts')
  const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(crumbs.getByRole('listitem')).toHaveText([
    'Docs',
    '@hulla/api',
    'Core API',
    'Contracts',
  ])
  await crumbs.getByRole('link', { name: 'Core API' }).click()
  await expect(page).toHaveURL(/\/docs\/api\/core\/?$/)
  await expect(
    page.locator('#docs-content').getByRole('link', { name: /Contracts/ })
  ).toBeVisible()
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
    dialog.getByRole('link', { name: 'Typed clients' })
  ).toBeVisible()
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
    .getByRole('navigation', { name: 'Documentation', exact: true })
    .filter({ visible: true })
  await expect(
    navigation.getByRole('link', { name: 'Migration guide' })
  ).toHaveAttribute('href', '/docs/api/start/migration')
  await context.close()
})

test('CV preserves its isolated visual layout', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Existing printable CV baseline')
  await page.goto('/cv')
  await expect(page.locator('.container')).toHaveScreenshot('cv.png', {
    animations: 'disabled',
  })
})
