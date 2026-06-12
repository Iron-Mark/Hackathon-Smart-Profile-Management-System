import fs from 'fs'
import http from 'http'
import path from 'path'

const root = path.resolve(process.cwd(), 'dist')
const port = Number(process.env.PORT || 4173)
const configuredBase =
  process.env.VITE_BASE_PATH || process.env.PLAYWRIGHT_BASE_PATH || '/'
const basePrefix =
  configuredBase === '/'
    ? ''
    : `/${configuredBase.replace(/^\/+|\/+$/g, '')}`

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
}

function sendFile (response, filePath) {
  const extension = path.extname(filePath)
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream'
  })
  fs.createReadStream(filePath).pipe(response)
}

function resolveDistPath (requestPath) {
  const relativePath = requestPath === '/' ? '/index.html' : requestPath
  const filePath = path.resolve(root, `.${relativePath}`)

  if (!filePath.startsWith(root)) {
    return null
  }

  return filePath
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host}`)
  let requestPath = decodeURIComponent(requestUrl.pathname)

  if (basePrefix && requestPath === basePrefix) {
    response.writeHead(302, { Location: `${basePrefix}/` })
    response.end()
    return
  }

  if (basePrefix && requestPath.startsWith(`${basePrefix}/`)) {
    requestPath = requestPath.slice(basePrefix.length) || '/'
  }

  const filePath = resolveDistPath(requestPath)
  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(response, filePath)
    return
  }

  const fallback = path.join(root, 'index.html')
  if (fs.existsSync(fallback)) {
    sendFile(response, fallback)
    return
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end('Build output not found. Run npm run build first.')
})

server.listen(port, '127.0.0.1', () => {
  console.log(
    `Serving dist at http://127.0.0.1:${port}${basePrefix || '/'}`
  )
})
