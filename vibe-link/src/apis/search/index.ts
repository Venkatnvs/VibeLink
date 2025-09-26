import api from '../axios'
import type { SearchResult } from './types'

export const searchApi = {
  search: async (query: string): Promise<{ data: SearchResult[] }> => {
    console.log('Search API called with query:', query)
    const response = await api.get(`/api/social/search/?q=${encodeURIComponent(query)}`)
    console.log('Search API response:', response.data)
    // Backend returns { results: [...] }, so we need to return { data: response.data.results }
    return { data: response.data.results || [] }
  }
}

export { searchApi as default }
