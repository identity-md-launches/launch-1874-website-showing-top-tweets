import { ArrowUpRight, Bookmark, Check, Copy, Heart, MessageCircle, Repeat2 } from 'lucide-react'
import type { Post } from '../types'

export function prettyCount(value: number) {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export default function PostCard({ post, rank, saved, copied, onSave, onCopy, onSource }: {
  post: Post; rank: number; saved: boolean; copied: boolean;
  onSave: () => void; onCopy: () => void; onSource: () => void;
}) {
  const date = new Date(post.date)
  return <article className="post-card" aria-label={`Tweet by ${post.name}`} data-post-id={post.id}>
    <div className="post-topline"><span className="post-rank">{String(rank).padStart(2, '0')}</span><span className={`topic-label topic-${post.topic.toLowerCase()}`}>{post.topic}</span><span className="post-date"><time dateTime={post.date}>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></span></div>
    <div className="author-line">
      <img className="avatar" src={post.avatar} width="42" height="42" alt="" loading="lazy" onError={e => { e.currentTarget.src = './favicon.svg'; e.currentTarget.onerror = null }} />
      <a className="author" href={`https://x.com/${post.handle}`} target="_blank" rel="noopener noreferrer" aria-label={`${post.name}, @${post.handle} on X (opens in a new tab)`}><strong>{post.name}</strong><span>@{post.handle}</span></a>
      <svg className="x-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-7.4 8.5L23.3 22h-6.8l-5.4-7.1L4.9 22H1.8l7.9-9L1 2h7l4.9 6.5L18.9 2Zm-1.1 18h1.7L7.1 4H5.3l12.5 16Z" fill="currentColor"/></svg>
    </div>
    <blockquote cite={post.url}>{post.excerpt}{post.isExcerpt && <span aria-label="Excerpt continues">…</span>}</blockquote>
    <details className="post-context"><summary>Read context</summary><p className="post-summary"><span>In context</span>{post.summary}</p></details>
    <div className="post-actions">
      <div className="metrics" aria-label="Engagement snapshot">
        <span title={`${post.likes.toLocaleString()} likes at capture`}><Heart size={16}/><span className="sr-only">Likes: </span>{prettyCount(post.likes)}</span>
        <span title={`${post.reposts.toLocaleString()} reposts at capture`}><Repeat2 size={17}/><span className="sr-only">Reposts: </span>{prettyCount(post.reposts)}</span>
        <span title={`${post.replies.toLocaleString()} replies at capture`}><MessageCircle size={16}/><span className="sr-only">Replies: </span>{prettyCount(post.replies)}</span>
      </div>
      <div className="post-tools">
        <button className={`icon-button ${copied ? 'is-active' : ''}`} onClick={onCopy} aria-label={`Copy link to ${post.name}'s tweet`} title="Copy tweet link">{copied ? <Check size={18}/> : <Copy size={18}/>}</button>
        <button className={`icon-button ${saved ? 'is-active' : ''}`} aria-pressed={saved} onClick={onSave} aria-label={`${saved ? 'Unsave' : 'Save'} ${post.name}'s tweet`} title={saved ? 'Remove from saved' : 'Save on this device'}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'}/></button>
        <a className="post-link" href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`View on X: tweet by ${post.name} (opens in a new tab)`}>View on X<ArrowUpRight size={16}/></a>
      </div>
    </div>
    <button className="source-link" onClick={onSource}>Snapshot & source</button>
  </article>
}
