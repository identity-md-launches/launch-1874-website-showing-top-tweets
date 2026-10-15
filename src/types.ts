export type Topic = 'Building' | 'Ideas' | 'Culture'
export type View = 'discover' | 'saved'
export type Sort = 'likes' | 'reposts' | 'newest'
export interface Post {
  id: string
  name: string
  handle: string
  date: string
  excerpt: string
  summary: string
  topic: Topic
  likes: number
  reposts: number
  replies: number
  views: number | null
  url: string
  source: string
  avatar: string
  isExcerpt: boolean
}
