import { pathToFileURL } from 'node:url'
const { chromium } = process.env.IMD_PLAYWRIGHT ? await import(pathToFileURL(process.env.IMD_PLAYWRIGHT).href) : await import('playwright')
import { readFile } from 'node:fs/promises'
const svg = await readFile('public/art/pepe-squad.svg','utf8')
const logo = await readFile('public/favicon.svg','utf8')
const browser = await chromium.launch({headless:true})
try {
 const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1})
 await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;background:#0b140f;color:#e5ecdf;font-family:Arial,sans-serif;padding:58px 64px}.logo{display:flex;align-items:center;gap:14px;font-size:28px;font-weight:700}.logo svg{width:43px;height:43px}.copy{position:relative;z-index:1;margin-top:75px}h1{font-size:76px;line-height:1.04;letter-spacing:-4px;margin:0}h1 span{color:#bbeb8f}p{font-size:24px;color:#a6b99b;margin-top:28px}.art{position:absolute;right:-55px;bottom:54px;width:750px}.art svg{width:100%;height:auto}.bottom{position:absolute;bottom:50px;left:64px;color:#bbeb8f;font-size:18px}</style></head><body><div class="logo">${logo}<span>the pond.</span></div><div class="copy"><h1>The swarm<br>is talking<span>.</span></h1><p>Top tweets from the<br>Identity.md community.</p></div><div class="art">${svg}</div><div class="bottom">Pepes armed with AI.</div></body></html>`)
 await page.screenshot({path:'public/social-card.png',type:'png'})
 console.log('Created 1200 × 630 local share image from the site’s SVG artwork.')
} finally {await browser.close()}
