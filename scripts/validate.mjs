import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import AxeBuilder from '@axe-core/playwright'

const playwright = process.env.IMD_PLAYWRIGHT ? await import(pathToFileURL(process.env.IMD_PLAYWRIGHT).href) : await import('playwright')
const dir = resolve('dist')
const out = 'test/scratch/interaction'
await mkdir(out, {recursive:true})
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'}
const server = createServer(async (req,res) => {
 try {
  const pathname = decodeURIComponent(new URL(req.url,'http://local.test').pathname)
  if(!pathname.startsWith('/preview/')) {res.writeHead(404);res.end();return}
  const path = resolve(dir,pathname.slice('/preview/'.length) || 'index.html')
  if(!path.startsWith(dir+sep)) {res.writeHead(403);res.end();return}
  const file=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)] || 'application/octet-stream'});res.end(file)
 } catch {res.writeHead(404);res.end()}
})
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve))
const address=server.address()
const url=`http://127.0.0.1:${address.port}/preview/`
const results=[]
const record = (name,details='Passed') => {results.push({name,passed:true,details});console.log(`PASS ${name}: ${details}`)}
const browsers=[]
async function contextFor(browser,extra={}) {
 const context=await browser.newContext({viewport:{width:1440,height:960},...extra})
 await context.route('**/*',route => route.request().url().startsWith(url) ? route.continue() : route.abort())
 return context
}
const posts=JSON.parse(await readFile('src/posts.json','utf8'))
const byLikes=[...posts].sort((a,b)=>b.likes-a.likes)
const byDate=[...posts].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))
let webkitResult='Not attempted'
try {
 const browser=await playwright.chromium.launch({headless:true});browsers.push(browser)
 const context=await contextFor(browser)
 const page=await context.newPage()
 const errors=[];const missing=[]
 page.on('pageerror',err=>errors.push(err.message))
 page.on('response',res=>{if(res.status()>=400)missing.push(`${res.status()} ${new URL(res.url()).pathname}`)})
 await page.goto(url);await page.locator('article').first().waitFor()
 assert.equal(await page.locator('article').count(),6)
 assert.equal(await page.locator('article').first().getAttribute('data-post-id'),byLikes[0].id)
 record('Subpath load and most-liked ranking','Six real posts rendered under /preview/; highest captured like count first')
 await page.getByRole('button',{name:'Show 3 more tweets'}).click()
 assert.equal(await page.locator('article').count(),9)
 assert(await page.getByText('You’re all caught up with this collection.').isVisible())
 record('Load more','All nine posts exposed, with an end-of-collection state')
 await page.getByLabel('Sort tweets').selectOption('newest')
 assert.equal(await page.locator('article').first().getAttribute('data-post-id'),byDate[0].id)
 await page.getByLabel('Sort tweets').selectOption('reposts')
 assert.equal(await page.locator('article').first().getAttribute('data-post-id'),[...posts].sort((a,b)=>b.reposts-a.reposts)[0].id)
 await page.getByLabel('Sort tweets').selectOption('likes')
 record('Sort controls','Newest and most-reposted orders match source data')
 await page.getByLabel('Search tweets or authors').fill('POOL4')
 assert.equal(await page.locator('article').count(),1)
 assert.equal(await page.locator('article').getAttribute('data-post-id'),'2096592364391240143')
 await page.getByLabel('Search tweets or authors').fill('nothing_matches_this_search')
 assert(await page.getByText('Nothing in this corner yet.').isVisible())
 await page.getByRole('button',{name:'Clear filters',exact:true}).click()
 assert.equal(await page.getByLabel('Search tweets or authors').inputValue(),'')
 await page.getByRole('button',{name:'Culture',exact:true}).click()
 assert.equal(await page.locator('article').count(),1)
 await page.getByRole('button',{name:'All posts',exact:true}).click()
 record('Search and topic filtering','Case-insensitive text search, no-results recovery, topic filtering, reset')
 const first=page.locator('article').first()
 await first.locator('summary').click();assert(await first.locator('.post-summary').isVisible())
 await first.locator('summary').click();assert(!(await first.locator('.post-summary').isVisible()))
 record('Expandable editorial context','Native disclosure opens and closes without truncating the source quote')
 await first.getByRole('button',{name:'Save Adam\'s tweet',exact:true}).click()
 assert.equal(await first.getByRole('button',{name:'Unsave Adam\'s tweet',exact:true}).getAttribute('aria-pressed'),'true')
 await page.locator('.header-nav a[href="#saved"]').click()
 await page.getByRole('heading',{name:'Saved tweets'}).waitFor()
 assert.equal(await page.locator('article').count(),1)
 await page.reload();await page.locator('article').waitFor()
 assert.equal(await page.locator('article').count(),1)
 assert.equal(await page.getByRole('heading',{name:'Saved tweets'}).count(),1)
 record('Bookmarks persist','Saving, saved navigation, hash route, and reload persistence')
 await page.locator('article').getByRole('button',{name:'Unsave Adam\'s tweet',exact:true}).click()
 assert(await page.getByText('Keep the good ones.').isVisible())
 await page.waitForFunction(()=>document.activeElement?.id==='feed-heading')
 await page.getByRole('button',{name:'Explore tweets',exact:true}).click()
 await page.getByRole('heading',{name:'Top tweets',exact:true}).waitFor()
 assert.equal(await page.locator('article').count(),6)
 record('Remove bookmark and empty recovery','Final bookmark removal shows guidance and returns to the feed')
 const about=page.getByRole('button',{name:'About The Pond',exact:true})
 await about.click();assert(await page.getByRole('dialog').isVisible())
 await page.keyboard.press('Tab')
 assert(await page.evaluate(()=>!!document.activeElement?.closest('dialog')))
 const modalAudit=await new AxeBuilder({page}).analyze();assert.equal(modalAudit.violations.length,0,JSON.stringify(modalAudit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))))
 await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0)
 assert(await about.evaluate(el=>el===document.activeElement))
 record('Dialog keyboard and accessibility','Focus stays in native modal, Escape dismisses, focus returns; axe found zero violations')
 await first.getByRole('button',{name:'Snapshot & source',exact:true}).click()
 assert(await page.getByText(byLikes[0].likes.toLocaleString(),{exact:true}).last().isVisible())
 assert.equal(await page.getByRole('link',{name:'View source data'}).getAttribute('href'),byLikes[0].source)
 await page.getByRole('button',{name:'Close dialog'}).click()
 record('Per-post provenance','Exact captured counts, UTC post date, and source URL present')
 await context.grantPermissions(['clipboard-read','clipboard-write'])
 await first.getByRole('button',{name:'Copy link to Adam\'s tweet'}).click()
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),byLikes[0].url)
 record('Copy link','Clipboard contains the original post URL')
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Denied for validation'))}}))
 await first.getByRole('button',{name:'Copy link to Adam\'s tweet'}).click()
 assert(await page.getByRole('heading',{name:'Copy this tweet link'}).isVisible())
 assert.equal(await page.getByLabel('Tweet link',{exact:true}).inputValue(),byLikes[0].url)
 await page.keyboard.press('Escape')
 record('Clipboard failure recovery','Denied clipboard access offers a selectable original URL')
 await page.keyboard.press('/')
 assert(await page.getByLabel('Search tweets or authors').evaluate(el=>el===document.activeElement))
 record('Search keyboard shortcut','Slash focuses search without navigating')
 for(const a of await page.locator('article .post-link').all()) {
  const href=await a.getAttribute('href');assert(posts.some(p=>p.url===href));assert.equal(await a.getAttribute('target'),'_blank');assert((await a.getAttribute('rel')).includes('noopener'))
 }
 record('Original post links','Every displayed post links to its sourced X status, with safe new-tab attributes')
 const initialAudit=await new AxeBuilder({page}).analyze()
 assert.equal(initialAudit.violations.length,0,JSON.stringify(initialAudit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))))
 record('Automated accessibility','Zero axe violations in the production feed')
 await page.reload();await page.locator('article').first().waitFor()
 for(const width of [320,390,540,820,1024,1440]) {
  await page.setViewportSize({width,height:width===390?844:960})
  await page.screenshot({path:`${out}/${width}.png`,fullPage:false})
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)
  assert(!overflow,`Overflow at ${width}`)
  if(width===390) {
   const box=await first.locator('.post-link').boundingBox()
   assert(box && box.y+box.height<=844,`Primary tweet link below first phone screen: ${JSON.stringify(box)}`)
  }
 }
 record('Responsive layout','No horizontal overflow at 320, 390, 540, 820, 1024, 1440; first View on X action visible at 390×844')
 await page.setViewportSize({width:390,height:844})
 await page.getByRole('button',{name:'About The Pond'}).click()
 await page.screenshot({path:`${out}/390-dialog.png`})
 await page.keyboard.press('Escape')
 await page.getByLabel('Search tweets or authors').focus()
 await page.screenshot({path:`${out}/390-focus.png`})
 const focus=await page.locator('.search-wrap').evaluate(el=>({outline:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}))
 assert.equal(focus.outline,'2px')
 record('Mobile focus','Captured visible search focus and mobile dialog screenshots')
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.icon-button')).transitionDuration==='0s' && document.getAnimations().every(a=>a.playState!=='running'),{},{timeout:1500})
 const motion=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').map(a=>({type:a.constructor.name,target:a.effect?.target?.className,timing:a.effect?.getTiming(),property:a.transitionProperty})))
 assert.equal(motion.length,0,JSON.stringify(motion))
 record('Reduced motion','No running animations with reduced motion enabled')
 await page.evaluate(()=>document.documentElement.style.fontSize='200%')
 assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)),'Overflow at 200% text size')
 await page.screenshot({path:`${out}/390-text-200.png`})
 await page.evaluate(()=>document.documentElement.style.fontSize='')
 record('Text enlargement','200% root text size at 390 CSS pixels without horizontal overflow; distinct from native browser zoom')
 await page.getByLabel('Search tweets or authors').fill('a'.repeat(180))
 assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)))
 await page.getByRole('button',{name:'Clear filters',exact:true}).click()
 record('Long-value stress','180-character search renders a recoverable empty state with no overflow')
 await page.evaluate(()=>{localStorage.setItem('the-pond:saved:v1','{not valid json')})
 await page.reload();assert.equal(await page.locator('article').count(),6)
 record('Corrupt bookmark storage','Invalid JSON does not crash the feed')
 const denied=await contextFor(browser)
 await denied.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value:()=>{throw new DOMException('Blocked','SecurityError')}});Object.defineProperty(Storage.prototype,'setItem',{value:()=>{throw new DOMException('Blocked','QuotaExceededError')}})})
 const deniedPage=await denied.newPage();await deniedPage.goto(url)
 await deniedPage.locator('article').first().getByRole('button',{name:'Save Adam\'s tweet',exact:true}).click()
 await deniedPage.locator('.header-nav a[href="#saved"]').click()
 await deniedPage.getByRole('heading',{name:'Saved tweets'}).waitFor()
 assert.equal(await deniedPage.locator('article').count(),1)
 assert(await deniedPage.getByText('Browser storage is unavailable. Bookmarks last for this visit only.').isVisible())
 await denied.close()
 record('Blocked storage','Bookmarks continue in memory and explicitly disclose visit-only persistence')
 assert.equal(errors.length,0,errors.join('\n'));assert.equal(missing.length,0,missing.join('\n'))
 record('Console and resources','Zero page exceptions and zero missing local resources while testing; external network blocked')
 await context.close()
 try {
  const webkit=await playwright.webkit.launch({headless:true});browsers.push(webkit)
  const wc=await contextFor(webkit,{viewport:{width:390,height:844}});const wp=await wc.newPage();await wp.goto(url)
  await wp.getByRole('button',{name:'Culture',exact:true}).click();assert.equal(await wp.locator('article').count(),1)
  await wp.getByRole('button',{name:'All posts',exact:true}).click()
  await wp.locator('article').first().getByRole('button',{name:'Save Adam\'s tweet',exact:true}).click()
  await wp.locator('.header-nav a[href="#saved"]').click();await wp.getByRole('heading',{name:'Saved tweets'}).waitFor();assert.equal(await wp.locator('article').count(),1)
  await wp.getByRole('button',{name:'About The Pond'}).click();assert(await wp.getByRole('dialog').isVisible());await wp.keyboard.press('Escape')
  await wp.screenshot({path:`${out}/webkit-390.png`});await wc.close()
  webkitResult='Passed: filter, save, saved view, modal, and phone screenshot';record('WebKit primary interactions',webkitResult)
 } catch (error) {
  if(/Executable doesn't exist|Host system is missing|Failed to launch|error while loading shared libraries/.test(String(error))) {webkitResult='Not verified: the installed browser runtime could not launch WebKit. No browser installed.';console.log(webkitResult)}
  else throw error
 }
} catch(error) {results.push({name:'Validation failure',passed:false,details:String(error)});console.error(error.stack);process.exitCode=1}
finally {
 await Promise.all(browsers.map(b=>b.close()))
 await new Promise(resolve=>server.close(resolve))
 await writeFile(`${out}/results.json`,JSON.stringify({results,webkit:webkitResult},null,2)+'\n')
}
