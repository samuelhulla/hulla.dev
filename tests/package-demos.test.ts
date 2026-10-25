import { describe, expect, test } from 'bun:test'
import { readFileSync, readdirSync } from 'node:fs'
import { apiProject } from '../src/lib/demos/api-project'
import { evaluateStyle } from '../src/lib/demos/evaluate-style'
import { styleSource } from '../src/lib/demos/style-project'
import { commitInventory, initialInventory } from '../src/lib/demos/inventory'
import {
  installPlan,
  templateOptions,
  templateSource,
} from '../src/lib/demos/workflow-models'
import { createApiChecker } from '../src/lib/demos/api-checker'
import {
  deploymentConfig,
  previewArguments,
} from '../src/lib/demos/input-workflows'

describe('package benefit demonstrations', () => {
  test('the real compiler catches both broken consumers, then accepts the repair', () => {
    const root = new URL(
      '../node_modules/@typescript/old/lib/',
      import.meta.url
    )
    const libraries = Object.fromEntries(
      readdirSync(root)
        .filter((name) => /^lib.*\.d\.ts$/.test(name))
        .map((name) => [
          `/lib/${name}`,
          readFileSync(new URL(name, root), 'utf8'),
        ])
    )
    const check = createApiChecker(libraries)
    expect(check(apiProject('name', 'name'))).toEqual([])
    const custom = apiProject('name', 'name')
    custom['/contract.ts'] = custom['/contract.ts'].replace(
      'name: string',
      'email: number'
    )
    expect(check(custom).map((error) => error.file)).toEqual([
      'server.ts',
      'profile.ts',
    ])
    custom['/server.ts'] = custom['/server.ts'].replace(
      "name: 'Ada Lovelace'",
      'email: 42'
    )
    custom['/profile.ts'] = custom['/profile.ts'].replace(
      'result.body.name.toUpperCase()',
      'result.body.email.toFixed(2)'
    )
    expect(check(custom)).toEqual([])
    custom['/contract.ts'] = 'export const ='
    expect(check(custom).some((error) => error.file === 'contract.ts')).toBe(
      true
    )
    for (const field of ['displayName', 'handle'] as const) {
      const errors = check(apiProject(field, 'name'))
      expect(errors.map(({ file, code }) => ({ file, code }))).toEqual([
        { file: 'server.ts', code: 2353 },
        { file: 'profile.ts', code: 2339 },
      ])
      expect(errors.every(({ message }) => message.includes(field))).toBe(true)
      expect(check(apiProject(field, field))).toEqual([])
    }
    // Returning to an earlier contract must invalidate the service cache too.
    expect(check(apiProject('name', 'handle')).length).toBe(2)
    expect(check(apiProject('name', 'name'))).toEqual([])
  })

  test('editable style source executes both custom logic and the configured processor', () => {
    const basic = evaluateStyle(styleSource)
    expect(basic.trace.variant).toBe('px-4')
    const edited = evaluateStyle(
      styleSource
        .replace('text-primary-text', 'text-danger')
        .replace("compose('px-6')", "compose('px-8')")
    )
    expect(edited.preview.notice).toContain('text-danger')
    expect(edited.preview.cell).toContain('px-8')
    const unmerged = evaluateStyle(
      styleSource.replace('style({ composer: mergeClasses })', 'style()')
    )
    expect(unmerged.trace.variant).toBe('px-2 px-4')
    expect(unmerged.preview.cell).toContain('px-2 px-4 px-6')
    const timing = evaluateStyle(styleSource, true)
    expect(timing.elapsed).toBeGreaterThanOrEqual(0)
    expect(timing.characters).toBeGreaterThan(10000)
    expect(() => evaluateStyle('export const =')).toThrow()
    expect(() => evaluateStyle('export const preview = {}')).toThrow()
  })

  test('server commits validate writes and purchases against the current database', () => {
    const original = initialInventory()
    const stock = commitInventory(original, { kind: 'stock', id: 1, stock: 10 })
    expect(stock.products[0]!.stock).toBe(10)
    expect(original[0]!.stock).toBe(5)
    const bought = commitInventory(stock.products, { kind: 'buy', id: 1 })
    expect(bought.products[0]!.stock).toBe(9)
    expect(commitInventory(original, { kind: 'buy', id: 3 }).error).toContain(
      'sold out'
    )
    for (const value of [-1, 1.5, 10001, NaN]) {
      const rejected = commitInventory(original, {
        kind: 'stock',
        id: 1,
        stock: value,
      })
      expect(rejected.error).toBeTruthy()
      expect(rejected.products).toEqual(original)
    }
    expect(
      commitInventory(original, { kind: 'rename', id: 1, name: '' }).error
    ).toBeTruthy()
    expect(
      commitInventory(original, {
        kind: 'rename',
        id: 1,
        name: 'Wireless headphones',
      }).products[0]!.name
    ).toBe('Wireless headphones')
  })

  test('editable install and download options validate the modeled workflows', () => {
    expect(templateOptions(templateSource)).toMatchObject({
      subpath: 'web',
      update: 'never',
    })
    expect(() => templateOptions('{"subpath":"missing"}')).toThrow()
    expect(
      installPlan('hulla ui add --framework solid button dialog')
    ).toContain('src/components/dialog/dialog.tsx')
    expect(installPlan('hulla ui add --framework astro button')).toContain(
      'src/components/button/button.astro'
    )
    expect(() =>
      installPlan('hulla ui add --framework unknown button')
    ).toThrow()
  })

  test('syntax and domain failures stop later deployment work', () => {
    const syntax = deploymentConfig('{')
    expect(syntax.result.isErr()).toBe(true)
    expect(syntax.steps).toEqual(['Parse JSON'])
    for (const value of [
      'null',
      '{}',
      '{"replicas":0}',
      '{"replicas":2.5}',
      '{"replicas":"3"}',
      '{"replicas":11}',
    ]) {
      const domain = deploymentConfig(value)
      expect(domain.result.isErr()).toBe(true)
      expect(domain.steps).toEqual(['Parse JSON', 'Validate config'])
    }
    const valid = deploymentConfig('{"replicas":3}')
    expect(valid.result.isOk()).toBe(true)
    expect(
      valid.result.match(
        (value) => value,
        (error) => error.message
      )
    ).toBe('3 replicas ready for deployment')
    expect(valid.steps).toContain('Build deployment plan')
  })

  test('actual argument parsing distinguishes supplied, absent, and invalid ports', () => {
    expect(previewArguments('storefront --port 8080 --open')).toMatchObject({
      values: { project: 'storefront', port: 8080, open: true },
      metadata: { portDetected: true },
    })
    expect(previewArguments('storefront')).toMatchObject({
      values: { project: 'storefront', port: 3000, open: false },
      metadata: { portDetected: false },
    })
    for (const args of [
      '',
      'storefront --port nope',
      'storefront --port 0',
      'storefront --port 65536',
      'storefront --unknown',
    ]) {
      expect(previewArguments(args).error).toBeTruthy()
      expect(previewArguments(args).values).toBeUndefined()
    }
  })
})
