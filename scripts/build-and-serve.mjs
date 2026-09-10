import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const outDir = resolve(projectRoot, 'out')

if (!existsSync(resolve(outDir, 'index.html'))) {
  console.log('[dev] Static export not found, building with next build...')
  execSync('npx next build', { stdio: 'inherit', cwd: projectRoot })
}

console.log('[dev] Serving static export from out/ on port 5173')
const server = await createServer({
  root: outDir,
  server: { port: 5173, host: true, open: false },
  plugins: [],
})
await server.listen()
console.log(`[dev] Preview running at ${server.resolvedUrls?.local?.[0] || 'http://localhost:5173/'}`)
