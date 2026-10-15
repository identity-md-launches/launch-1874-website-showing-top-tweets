import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import assert from 'node:assert/strict'

const root = resolve('.')
const html = await readFile('dist/index.html', 'utf8')
for (const tag of ['<title>', 'name="description"', 'property="og:title"', 'property="og:image"', 'rel="icon"']) assert(html.includes(tag), `Missing ${tag}`)
const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map(match => match[1])
assert(assets.length >= 3, 'Expected relative entry assets and favicon')
assert(!/(?:src|href)="\/(?!\/)/.test(html), 'Root-relative asset in export')
for (const asset of assets) assert((await stat(join('dist', asset))).size > 0, `Missing ${asset}`)
assert((await stat('dist/social-card.png')).size > 1000, 'Missing share image')
const posts = JSON.parse(await readFile('src/posts.json', 'utf8'))
assert.equal(new Set(posts.map(p => p.id)).size, posts.length, 'Duplicate post IDs')
for (const p of posts) {
  assert.equal(p.url.toLowerCase(), `https://x.com/${p.handle}/status/${p.id}`.toLowerCase())
  assert(Number.isFinite(Date.parse(p.date)), `Bad date: ${p.id}`)
  for (const field of ['likes', 'reposts', 'replies']) assert(Number.isInteger(p[field]) && p[field] >= 0, `Bad ${field}`)
  assert(p.excerpt.split(/\s+/).length <= 25, 'Quote exceeds 25 words')
  assert((await stat(join('dist', p.avatar))).size > 0, `Missing avatar: ${p.handle}`)
}
const ignored = new Set(['.git', '.github', '.imd', 'node_modules', '.npm', '.pnpm-store', '.cache', '.vite', 'coverage'])
async function walk(dir) {
  const files = []
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(item.name) || (dir === join(root, 'test') && item.name === 'scratch') || item.name.startsWith('.env')) continue
    const path = join(dir, item.name)
    assert(!item.isSymbolicLink(), `Unexpected symbolic link: ${path}`)
    if (item.isDirectory()) files.push(...await walk(path))
    else files.push({ path: path.slice(root.length + 1), bytes: (await stat(path)).size })
  }
  return files
}
const files = await walk(root)
assert(!files.some(f => /\.(tgz|zip|tar|gz)$/.test(f.path)), 'Unnecessary dependency archive')
const bytes = files.reduce((total, file) => total + file.bytes, 0)
assert(bytes < 8388608, `Submission tree exceeds 8 MiB: ${bytes}`)
const distBytes = files.filter(f => f.path.startsWith('dist/')).reduce((total, file) => total + file.bytes, 0)
console.log(JSON.stringify({ relativeEntryAssets: assets.length, sourcePosts: posts.length, deliveryFiles: files.length, deliveryBytes: bytes, exportBytes: distBytes, limitBytes: 8388608, result: 'PASS' }, null, 2))
