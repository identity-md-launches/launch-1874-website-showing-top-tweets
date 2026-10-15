import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronDown, Code2, Compass, Cpu, Info, Leaf, Search, Sparkles, Users, X } from 'lucide-react'
import Modal from './components/Modal'
import PostCard from './components/PostCard'
import data from './posts.json'
import type { Post, Sort, Topic, View } from './types'

const posts = data as Post[]
const SAVED_KEY = 'the-pond:saved:v1'
const CAPTURED = '15 October 2026'
const topics: Topic[] = ['Building', 'Ideas', 'Culture']
const searchOnX = 'https://x.com/search?q=%22identity.md%22%20OR%20%24IMD&src=typed_query&f=top'
const ids = new Set(posts.map(post => post.id))
const authorCount = new Set(posts.map(post => post.handle)).size

function readSaved() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
    return { values: Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && ids.has(id)) : [], available: true }
  } catch { return { values: [] as string[], available: false } }
}

export default function App() {
  const [view, setView] = useState<View>(() => location.hash === '#saved' ? 'saved' : 'discover')
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<Topic | 'All posts'>('All posts')
  const [sort, setSort] = useState<Sort>('likes')
  const [savedState, setSavedState] = useState(readSaved)
  const [limit, setLimit] = useState(6)
  const [about, setAbout] = useState(false)
  const [sourcePost, setSourcePost] = useState<Post | null>(null)
  const [copyFallback, setCopyFallback] = useState<Post | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const saved = savedState.values

  useEffect(() => {
    const onHash = () => {
      if (location.hash === '#saved' || location.hash === '#discover') {
        setView(location.hash === '#saved' ? 'saved' : 'discover'); setLimit(6)
      }
    }
    const onStorage = (event: StorageEvent) => { if (event.key === SAVED_KEY) setSavedState(readSaved()) }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !document.querySelector('dialog[open]') && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLElement && event.target.isContentEditable)) {
        event.preventDefault(); searchRef.current?.focus()
      }
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('storage', onStorage)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('keydown', onKey)
      clearTimeout(noticeTimer.current); clearTimeout(copyTimer.current)
    }
  }, [])

  const announce = useCallback((message: string) => {
    clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = setTimeout(() => setNotice(''), 3500)
  }, [])

  const toggleSaved = (post: Post) => {
    const wasSaved = saved.includes(post.id)
    const next = wasSaved ? saved.filter(id => id !== post.id) : [...saved, post.id]
    let available = true
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)) } catch { available = false }
    setSavedState({ values: next, available })
    if (wasSaved && view === 'saved') requestAnimationFrame(() => document.getElementById('feed-heading')?.focus())
    announce(wasSaved ? 'Tweet removed from bookmarks.' : available ? 'Tweet saved on this device.' : 'Tweet saved for this visit.')
  }

  const copyPost = async (post: Post) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(post.url)
      setCopiedId(post.id); announce('Tweet link copied.')
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedId(null), 3500)
    } catch { setCopyFallback(post) }
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return posts.filter(post => (view !== 'saved' || saved.includes(post.id)) && (topic === 'All posts' || post.topic === topic) && (!needle || `${post.name} ${post.handle} ${post.excerpt} ${post.summary} ${post.topic}`.toLocaleLowerCase().includes(needle)))
      .sort((a, b) => sort === 'newest' ? Date.parse(b.date) - Date.parse(a.date) : sort === 'reposts' ? b.reposts - a.reposts || b.likes - a.likes : b.likes - a.likes || Date.parse(b.date) - Date.parse(a.date))
  }, [query, topic, sort, view, saved])

  const chooseTopic = (value: typeof topic) => { setTopic(value); setLimit(6) }
  const resetFilters = () => { setQuery(''); setTopic('All posts'); setLimit(6) }
  const openDiscover = () => { location.hash = 'discover'; resetFilters() }

  return <>
    <a className="skip-link" href="#main">Skip to tweets</a>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#discover" onClick={resetFilters} aria-label="The Pond home"><img src="./favicon.svg" alt="" width="34" height="34"/><span>the pond<span className="brand-dot">.</span></span></a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#discover" aria-current={view === 'discover' ? 'page' : undefined}><Compass size={17}/>Discover</a>
          <a href="#saved" aria-current={view === 'saved' ? 'page' : undefined}><Bookmark size={17}/><span>Saved</span>{saved.length > 0 && <span className="nav-count">{saved.length}</span>}</a>
        </nav>
        <div className="header-actions"><button className="icon-button" onClick={() => setAbout(true)} aria-label="About The Pond"><Info size={19}/></button><a className="button button-small header-x" href={searchOnX} target="_blank" rel="noopener noreferrer">Explore on X<ArrowUpRight size={16}/></a></div>
      </div>
    </header>
    <main id="main" className="page-shell" tabIndex={-1}>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy"><h1 id="page-title">The swarm<br/>is talking<span>.</span></h1><p>Top tweets from the Identity.md community.</p><div className="hero-signature"><span className="small-frog" aria-hidden="true"><Cpu size={14}/></span>Pepes armed with AI.</div></div>
        <img className="hero-art" src="./art/pepe-squad.svg" width="720" height="390" alt="Three Pepe agents equipped with a neural scanner, cybernetic visor, and AI laptop."/>
      </section>
      <div className="content-grid">
        <section className="feed-section" aria-labelledby="feed-heading">
          <div className="feed-heading"><h2 id="feed-heading" tabIndex={-1}>{view === 'saved' ? <><Bookmark size={21}/>Saved tweets</> : <><Sparkles size={21}/>Top tweets</>}</h2><span className="collection-label">{view === 'saved' ? 'On this device' : 'The collection'}</span></div>
          <div className="search-wrap"><Search size={19} aria-hidden="true"/><label className="sr-only" htmlFor="search">Search tweets or authors</label><input ref={searchRef} id="search" type="search" autoComplete="off" placeholder="Search tweets or authors" value={query} onChange={e => { setQuery(e.target.value); setLimit(6) }}/>{query ? <button className="icon-button clear-search" onClick={() => { setQuery(''); searchRef.current?.focus() }} aria-label="Clear search"><X size={17}/></button> : <kbd aria-hidden="true">/</kbd>}</div>
          <div className="filter-row"><div className="topic-filters" role="group" aria-label="Filter tweets by topic">{(['All posts', ...topics] as const).map(item => <button key={item} aria-pressed={topic === item} className={`filter-button ${topic === item ? 'selected' : ''}`} onClick={() => chooseTopic(item)}>{item}</button>)}</div></div>
          <div className="results-row"><p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'tweet' : 'tweets'}{query.trim() && <> matching “{query.trim()}”</>}</p><div className="sort-control"><label htmlFor="sort" className="sr-only">Sort tweets</label><select id="sort" value={sort} onChange={e => { setSort(e.target.value as Sort); setLimit(6) }}><option value="likes">Most liked</option><option value="reposts">Most reposted</option><option value="newest">Newest first</option></select><ChevronDown size={15} aria-hidden="true"/></div></div>
          <p className="snapshot-note">Counts captured {CAPTURED}. <button onClick={() => setAbout(true)}>How this feed works<Info size={12}/></button></p>
          {!savedState.available && <p className="storage-note" role="status">Browser storage is unavailable. Bookmarks last for this visit only.</p>}
          <div className="post-list">
            {filtered.slice(0, limit).map((post, i) => <PostCard key={post.id} post={post} rank={i + 1} saved={saved.includes(post.id)} copied={copiedId === post.id} onSave={() => toggleSaved(post)} onCopy={() => void copyPost(post)} onSource={() => setSourcePost(post)}/>)}
          </div>
          {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">{view === 'saved' && saved.length === 0 ? <Bookmark size={28}/> : <Search size={28}/>}</div><h3>{view === 'saved' && saved.length === 0 ? 'Keep the good ones.' : 'Nothing in this corner yet.'}</h3><p>{view === 'saved' && saved.length === 0 ? 'Save a tweet with the bookmark icon. You’ll find it here on this device.' : 'Try another author, a shorter search, or a different topic.'}</p><button className="button button-primary" onClick={view === 'saved' && saved.length === 0 ? openDiscover : resetFilters}>{view === 'saved' && saved.length === 0 ? 'Explore tweets' : 'Clear filters'}<ArrowRight size={17}/></button></div>}
          {filtered.length > limit && <button className="load-more button" onClick={() => setLimit(value => value + 6)}>Show {Math.min(6, filtered.length - limit)} more tweets<ArrowDown size={17}/></button>}
          {filtered.length > 0 && filtered.length <= limit && <div className="end-of-feed"><Leaf size={18}/><p>You’re all caught up with this collection.</p><a href={searchOnX} target="_blank" rel="noopener noreferrer">Keep exploring on X<ArrowUpRight size={15}/></a></div>}
        </section>
        <aside className="sidebar" aria-label="About the collection and community">
          <section className="pond-note"><div className="aside-title"><img src="./favicon.svg" width="26" height="26" alt=""/><h2>A good place to lurk.</h2></div><p>The builders, the big ideas, and the beautifully weird side of Identity.md.</p><div className="collection-stats"><div><strong>{posts.length}</strong><span>curated tweets</span></div><div><strong>{authorCount}</strong><span>community voices</span></div></div><button className="text-button" onClick={() => setAbout(true)}>Get to know the feed<ArrowRight size={16}/></button></section>
          <section className="topic-section"><h2>Find your corner</h2><div className="topic-links">{topics.map((item, i) => {
            const Icon = [Code2, Sparkles, Users][i]
            return <button key={item} onClick={() => { chooseTopic(item); document.getElementById('feed-heading')?.scrollIntoView({ block: 'start' }) }} className={topic === item ? 'active' : ''} aria-pressed={topic === item}><span className="topic-icon"><Icon size={18}/></span><span><strong>{item}</strong><small>{['Tools, launches & experiments', 'Theses & deeper rabbit holes', 'Takes from the community'][i]}</small></span><span className="topic-count">{posts.filter(p => p.topic === item).length}</span></button>
          })}</div></section>
          <section className="identity-note"><Cpu size={24}/><h2>Meet Identity.md</h2><p>A network of AI agents building, reviewing, and answering questions together.</p><a className="button button-primary" href="https://imd.fun" target="_blank" rel="noopener noreferrer">Explore Identity.md<ArrowUpRight size={16}/></a><span className="community-note">Independent community collection.</span></section>
          <div className="sidebar-footer"><span>Less scrolling. More signal.</span><button onClick={() => setAbout(true)}>About & sources</button><span>Made for the pond.</span></div>
        </aside>
      </div>
    </main>
    <footer className="site-footer page-shell"><a className="brand footer-brand" href="#discover" onClick={resetFilters}><img src="./favicon.svg" width="23" height="23" alt=""/><span>the pond.</span></a><p>An independent Identity.md community feed.</p><button className="text-button" onClick={() => setAbout(true)}>About & sources<ArrowUpRight size={14}/></button></footer>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice && <><Check size={17}/>{notice}</>}</div>
    {about && <Modal title="A little about The Pond" onClose={() => setAbout(false)}><p>A place to catch up on the Identity.md conversation, with a collection of {posts.length} public tweets from {authorCount} community voices.</p><h3>What does “top” mean?</h3><p>“Most liked” ranks only this collection by likes captured on {CAPTURED}. Reposts and dates offer other ways to explore. This is a curated snapshot, not a live or exhaustive ranking of X.</p><h3>Where do the posts come from?</h3><p>Post IDs, authors, excerpts, dates, and counts were checked using the public <a href="https://github.com/FixTweet/FxTwitter" target="_blank" rel="noopener noreferrer">FxTwitter service<ArrowUpRight size={14}/></a>. Open “Snapshot & source” on any tweet for its source, or “View on X” for the original. Counts may have changed.</p><h3>Short reads, original voices</h3><p>Quotes are short excerpts from the post or its linked article. “In context” notes are editorial summaries. Opinions belong to their authors. Profile pictures belong to their respective accounts.</p><h3>Your own patch of the pond</h3><p>Bookmarks stay in this browser on this device. There is no account, sync, or tracking. Clearing your browser’s site data removes them.</p><p className="modal-footnote">The Pond is an independent community page, unaffiliated with X or the Identity.md team. The collection was assembled on {CAPTURED}.</p></Modal>}
    {sourcePost && <Modal title="Snapshot & source" onClose={() => setSourcePost(null)}><div className="source-author"><img className="avatar" src={sourcePost.avatar} alt="" width="42" height="42"/><div><strong>{sourcePost.name}</strong><p>@{sourcePost.handle}</p></div></div><dl className="source-details"><div><dt>Captured</dt><dd>{CAPTURED}</dd></div><div><dt>Published</dt><dd>{new Date(sourcePost.date).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' })} UTC</dd></div><div><dt>Likes</dt><dd>{sourcePost.likes.toLocaleString()}</dd></div><div><dt>Reposts</dt><dd>{sourcePost.reposts.toLocaleString()}</dd></div><div><dt>Replies</dt><dd>{sourcePost.replies.toLocaleString()}</dd></div><div><dt>Views</dt><dd>{sourcePost.views === null ? 'Unavailable' : sourcePost.views.toLocaleString()}</dd></div></dl><p>Counts are a saved snapshot. The quote is an excerpt; the “In context” note is a summary by The Pond.</p><div className="modal-links"><a className="button button-primary" href={sourcePost.url} target="_blank" rel="noopener noreferrer">Read the original on X<ArrowUpRight size={16}/></a><a className="text-button" href={sourcePost.source} target="_blank" rel="noopener noreferrer">View source data<ArrowUpRight size={16}/></a></div></Modal>}
    {copyFallback && <Modal title="Copy this tweet link" onClose={() => setCopyFallback(null)}><p>Clipboard access isn’t available here. Select and copy the link below.</p><label className="copy-label" htmlFor="copy-link">Tweet link</label><input className="copy-input" id="copy-link" readOnly value={copyFallback.url} onFocus={e => e.target.select()}/><a className="text-button" href={copyFallback.url} target="_blank" rel="noopener noreferrer">Open the tweet on X<ArrowUpRight size={16}/></a></Modal>}
  </>
}
