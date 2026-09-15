import { spawn } from 'node:child_process'
import { mkdir, readFile, stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'
import { PDFDocument } from 'pdf-lib'

const rootDir = process.cwd()
const distDir = path.join(rootDir, 'dist')
const outputDir = path.join(rootDir, 'output')
const outputPath = path.join(outputDir, 'Samuel Hulla -CV.pdf')
const port = 4321
const origin = `http://127.0.0.1:${port}`
const includePhone = process.argv.includes('--include-phone')
const phoneNumber = '+420 602 329 073'

await run('bun', ['run', 'build'])
await mkdir(outputDir, { recursive: true })

const server = createStaticServer(distDir)
await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(port, '127.0.0.1', resolve)
})

const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 2200 },
  })
  await page.goto(`${origin}/cv`, { waitUntil: 'networkidle' })
  await page.evaluate(
    ({ includePhone, phoneNumber }) => {
      document.body.classList.add('pdf-export')
      if (!includePhone) return

      const contact = document.querySelector('.contact-info')
      const email = contact?.querySelector('a[href^="mailto:"]')?.closest('p')
      if (!contact || !email)
        throw new Error('Could not find CV contact information')

      const phone = document.createElement('p')
      const icon = document.createElement('i')
      icon.className = 'fa-solid fa-phone'
      phone.append(icon, document.createTextNode(` ${phoneNumber}`))
      contact.insertBefore(phone, email)
    },
    { includePhone, phoneNumber }
  )
  await page.evaluate(() => document.fonts.ready)

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' },
    scale: 0.95,
  })

  const document = await PDFDocument.load(await readFile(outputPath))
  if (document.getPageCount() !== 3) {
    throw new Error(
      `CV must render as exactly 3 A4 pages; received ${document.getPageCount()}`
    )
  }

  console.log(
    `PDF written to ${path.relative(rootDir, outputPath)} (3 A4 pages)`
  )
} finally {
  await browser.close()
  await new Promise((resolve) => server.close(resolve))
}

function createStaticServer(root) {
  return http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url ?? '/', origin).pathname
      )
      const normalized = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
      let file = path.join(root, normalized)
      const fileStats = await stat(file).catch(() => undefined)
      if (normalized.endsWith('/') || fileStats?.isDirectory())
        file = path.join(file, 'index.html')
      else if (!path.extname(file)) file = path.join(file, 'index.html')

      const body = await readFile(file)
      response.writeHead(200, {
        'content-type': contentType(file),
        'cache-control': 'no-store',
      })
      response.end(body)
    } catch (error) {
      response.writeHead(error?.code === 'ENOENT' ? 404 : 500, {
        'content-type': 'text/plain',
      })
      response.end(
        error?.code === 'ENOENT' ? 'Not found' : 'Internal server error'
      )
    }
  })
}

function contentType(file) {
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    }[path.extname(file)] ?? 'application/octet-stream'
  )
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: rootDir, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(' ')} exited ${code}`))
    )
  })
}
