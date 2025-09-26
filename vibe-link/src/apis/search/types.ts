export interface SearchResult {
  id: number
  type: 'user' | 'post' | 'hashtag'
  title: string
  subtitle?: string
  image?: string
  data: any
}
