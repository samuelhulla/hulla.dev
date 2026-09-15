import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PDFDocument } from 'pdf-lib'

const root = join(import.meta.dir, '..')

describe('CV', () => {
  test('the exported PDF is exactly three A4 pages', async () => {
    const pdf = await PDFDocument.load(
      await readFile(join(root, 'output/Samuel Hulla -CV.pdf'))
    )
    expect(pdf.getPageCount()).toBe(3)
    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize()
      expect(width).toBeCloseTo(595.92, 0)
      expect(height).toBeCloseTo(842.88, 0)
    }
  })

  test('CV source uses bundled fonts and local icons only', async () => {
    const source = await readFile(
      join(root, 'src/pages/cv/index.astro'),
      'utf8'
    )
    expect(source).not.toContain('fonts.googleapis.com')
    expect(source).not.toContain('cdnjs.cloudflare.com')
    expect(source).not.toContain('client:')
  })
})
