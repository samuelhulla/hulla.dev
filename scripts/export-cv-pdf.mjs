import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import http from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const rootDir = process.cwd()
const distDir = path.join(rootDir, 'dist')
const outputDir = path.join(rootDir, 'output')
const outputPath = path.join(outputDir, 'cv.pdf')
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const debugPort = 9222
const sitePort = 4321
const siteOrigin = `http://127.0.0.1:${sitePort}`
const cvUrl = `${siteOrigin}/cv/`
const phoneNumber = '+420 602 329 073'
const includePhone = process.argv.slice(2).includes('--include-phone')

async function main() {
  await mkdir(outputDir, { recursive: true })

  await runCommand('bun', ['run', 'build'])

  const server = createStaticServer(distDir)
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(sitePort, '127.0.0.1', resolve)
  })

  const profileDir = await mkdtemp(path.join(tmpdir(), 'cv-pdf-chrome-'))
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ],
    {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  try {
    await waitForDebugger()
    const target = await createTarget(cvUrl)
    const client = await connectToTarget(target.webSocketDebuggerUrl)

    try {
      await client.send('Page.enable')
      await client.send('Runtime.enable')
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 2200,
        deviceScaleFactor: 1,
        mobile: false,
      })
      await client.send('Emulation.setEmulatedMedia', {
        media: 'screen',
      })

      await waitForPageLoad(client)
      await client.send('Runtime.evaluate', {
        expression: "document.body.classList.add('pdf-export')",
      })
      if (includePhone) {
        await client.send('Runtime.evaluate', {
          expression: `(() => {
            const contactInfo = document.querySelector('.contact-info')
            const email = contactInfo?.querySelector('a[href^="mailto:"]')?.closest('p')

            if (!contactInfo || !email) {
              throw new Error('Could not find CV contact information')
            }

            const phone = document.createElement('p')
            const icon = document.createElement('i')
            icon.className = 'fa-solid fa-phone'
            phone.append(icon, document.createTextNode(${JSON.stringify(` ${phoneNumber}`)}))
            contactInfo.insertBefore(phone, email)
          })()`,
        })
      }
      await client.send('Runtime.evaluate', {
        expression:
          'document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)',
        awaitPromise: true,
      })
      await delay(500)

      const { data } = await client.send('Page.printToPDF', {
        printBackground: true,
        paperWidth: 8.27,
        paperHeight: 11.69,
        marginTop: 0.4,
        marginBottom: 0.4,
        marginLeft: 0.4,
        marginRight: 0.4,
        scale: 0.95,
      })

      await writeFile(outputPath, Buffer.from(data, 'base64'))
      console.log(`PDF written to ${path.relative(rootDir, outputPath)}`)
    } finally {
      client.close()
    }
  } finally {
    chrome.kill('SIGTERM')
    server.close()
    await rm(profileDir, { recursive: true, force: true })
  }
}

function createStaticServer(root) {
  return http.createServer(async (req, res) => {
    try {
      const requestPath = new URL(req.url, siteOrigin).pathname
      const filePath = await resolvePath(root, requestPath)
      const body = await readFile(filePath)

      res.writeHead(200, {
        'Content-Type': getContentType(filePath),
        'Cache-Control': 'no-store',
      })
      res.end(body)
    } catch (error) {
      const status = error.code === 'ENOENT' ? 404 : 500
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end(status === 404 ? 'Not found' : 'Internal server error')
    }
  })
}

async function resolvePath(root, requestPath) {
  const decodedPath = decodeURIComponent(requestPath)
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = path.join(root, safePath)

  if (safePath.endsWith('/')) {
    filePath = path.join(root, safePath, 'index.html')
  }

  try {
    const stats = await import('node:fs/promises').then(({ stat }) => stat(filePath))
    if (stats.isDirectory()) {
      return path.join(filePath, 'index.html')
    }
  } catch (error) {
    if (!path.extname(filePath)) {
      return path.join(filePath, 'index.html')
    }

    throw error
  }

  return filePath
}

function getContentType(filePath) {
  const extension = path.extname(filePath)

  switch (extension) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.woff':
      return 'font/woff'
    case '.woff2':
      return 'font/woff2'
    default:
      return 'application/octet-stream'
  }
}

async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`))
    })
    child.on('error', reject)
  })
}

async function waitForDebugger() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`)
      if (response.ok) {
        return
      }
    } catch {}

    await delay(200)
  }

  throw new Error('Chrome DevTools debugger did not start in time')
}

async function createTarget(url) {
  const response = await fetch(
    `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(url)}`,
    { method: 'PUT' },
  )

  if (!response.ok) {
    throw new Error(`Failed to create Chrome target: ${response.status}`)
  }

  return response.json()
}

async function connectToTarget(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl)
  const pending = new Map()
  const eventListeners = new Map()
  let nextId = 0

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id) {
      const entry = pending.get(message.id)
      if (!entry) {
        return
      }

      pending.delete(message.id)
      if (message.error) {
        entry.reject(new Error(message.error.message))
        return
      }

      entry.resolve(message.result ?? {})
      return
    }

    const handlers = eventListeners.get(message.method)
    if (!handlers) {
      return
    }

    for (const handler of handlers) {
      handler(message.params ?? {})
    }
  })

  return {
    close() {
      socket.close()
    },
    on(method, handler) {
      const handlers = eventListeners.get(method) ?? new Set()
      handlers.add(handler)
      eventListeners.set(method, handlers)

      return () => {
        handlers.delete(handler)
        if (handlers.size === 0) {
          eventListeners.delete(method)
        }
      }
    },
    send(method, params = {}) {
      nextId += 1
      const id = nextId

      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
        socket.send(JSON.stringify({ id, method, params }))
      })
    },
  }
}

async function waitForPageLoad(client) {
  let resolveLoad
  const loadPromise = new Promise((resolve) => {
    resolveLoad = resolve
  })
  const stopListening = client.on('Page.loadEventFired', () => {
    stopListening()
    resolveLoad()
  })

  const readyState = await client.send('Runtime.evaluate', {
    expression: 'document.readyState',
    returnByValue: true,
  })
  if (readyState.result?.value === 'complete') {
    stopListening()
    return
  }

  await loadPromise
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
