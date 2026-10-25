import { expect, test } from '@playwright/test'
import { apiProject } from '../../src/lib/demos/api-project'
import { styleSource } from '../../src/lib/demos/style-project'

test('arbitrary API edits are type-checked across all project files', async ({
  page,
}) => {
  await page.goto('/docs/api')
  const app = page.locator('main [data-demo="api"]')
  const project = apiProject('name', 'name')
  project['/contract.ts'] = project['/contract.ts'].replace(
    'name: string',
    'email: number'
  )
  await app
    .getByRole('textbox', { name: 'Edit contract.ts', exact: true })
    .fill(project['/contract.ts'])
  await expect(app.getByText('2 errors', { exact: true })).toBeVisible({
    timeout: 15000,
  })
  await expect(app.getByText(/Property 'name' does not exist/)).toBeVisible()
  await app.getByRole('button', { name: 'server.ts', exact: true }).click()
  await app
    .getByRole('textbox', { name: 'Edit server.ts', exact: true })
    .fill(project['/server.ts'].replace("name: 'Ada Lovelace'", 'email: 42'))
  await app.getByRole('button', { name: 'profile.ts', exact: true }).click()
  await app
    .getByRole('textbox', { name: 'Edit profile.ts', exact: true })
    .fill(
      project['/profile.ts'].replace(
        'result.body.name.toUpperCase()',
        'result.body.email.toFixed(2)'
      )
    )
  await expect(
    app.getByText('The contract, handler, and client agree.', { exact: true })
  ).toBeVisible()
  await expect(app.getByText('0 errors', { exact: true })).toBeVisible()
})

test('style source runs custom edits, preserves the last good preview, and recovers', async ({
  page,
}) => {
  await page.goto('/docs/style')
  const app = page.locator('main [data-demo="style"]')
  const editor = app.getByRole('textbox', {
    name: 'Edit style code',
    exact: true,
  })
  await editor.fill(
    styleSource
      .replace('text-primary-text', 'text-danger')
      .replaceAll("compose('px-6')", "compose('px-8')")
  )
  await expect(app.getByLabel('Composition output')).toContainText(
    'text-danger px-8'
  )
  const notice = app.getByText('Your deployment is ready.', { exact: true })
  await expect(notice).toHaveClass(/text-danger/)
  await editor.fill('export const =')
  await expect(
    app.getByText(/The preview keeps the last working result/)
  ).toBeVisible()
  await expect(notice).toHaveClass(/text-danger/)
  await app.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(app.getByText('Up to date', { exact: true })).toBeVisible()
  await expect(notice).toHaveClass(/text-primary-text/)
  await app.getByRole('button', { name: 'Measure 10,000 compositions' }).click()
  await expect(app.getByText(/ms in this browser/)).toBeVisible()
})

test('a runaway style edit is stopped without freezing the interface', async ({
  page,
}) => {
  await page.goto('/docs/style')
  const app = page.locator('main [data-demo="style"]')
  await app
    .getByRole('textbox', { name: 'Edit style code', exact: true })
    .fill('while (true) {}')
  await expect(app.getByText(/Execution stopped after 3 seconds/)).toBeVisible({
    timeout: 10000,
  })
  await app.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(app.getByText('Up to date', { exact: true })).toBeVisible()
})

test('table and client edits cross the server boundary in both directions', async ({
  page,
}) => {
  await page.goto('/docs/db')
  const app = page.locator('main [data-demo="db"]')
  await app.scrollIntoViewIfNeeded()
  await app
    .getByRole('spinbutton', {
      name: 'Database stock for product 1',
      exact: true,
    })
    .fill('10')
  const store = app.getByRole('region', {
    name: 'Client storefront',
    exact: true,
  })
  await expect(store.getByText('10 available', { exact: true })).toBeVisible()
  await store
    .getByRole('button', { name: 'Buy Studio headphones', exact: true })
    .click()
  await expect(
    app.getByRole('spinbutton', {
      name: 'Database stock for product 1',
      exact: true,
    })
  ).toHaveValue('9')
  await expect(store.getByText('9 available', { exact: true })).toBeVisible()
  await expect(
    app.getByText('Client → server → database → subscribed UI', { exact: true })
  ).toBeVisible()
  const name = store.getByRole('textbox', {
    name: 'Client name for product 1',
    exact: true,
  })
  await name.fill('')
  await name.pressSequentially('Wireless headphones')
  await expect(
    app.getByRole('textbox', {
      name: 'Database name for product 1',
      exact: true,
    })
  ).toHaveValue('Wireless headphones')
  await expect(name).toHaveValue('Wireless headphones')
  await app
    .getByRole('spinbutton', {
      name: 'Database stock for product 1',
      exact: true,
    })
    .fill('-1')
  await expect(app.getByText(/Server rejected the edit/)).toBeVisible()
  await expect(store.getByText('9 available', { exact: true })).toBeVisible()
})

test('the mobile editor stays readable and keyboard focus can leave it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/api')
  const editor = page
    .locator('main')
    .getByRole('textbox', { name: 'Edit contract.ts', exact: true })
  await expect(editor).toHaveCSS('font-size', '14px')
  await editor.click()
  await page.keyboard.press('Tab')
  await expect(editor).not.toBeFocused()
  const width = await page.locator('main [data-demo="api"]').boundingBox()
  expect(width!.width).toBeLessThanOrEqual(390)
})
