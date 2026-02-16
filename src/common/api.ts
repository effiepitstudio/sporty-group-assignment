import axios from 'axios'
import { API_BASE_URL } from '@/common/constants'
import type { LeaguesApiResponse, SeasonsApiResponse } from '@/types'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function fetchAllLeagues(): Promise<LeaguesApiResponse> {
  const { data } = await apiClient.get<LeaguesApiResponse>('/all_leagues.php')
  return data
}

export async function fetchSeasonBadges(
  leagueId: string
): Promise<SeasonsApiResponse> {
  const { data } = await apiClient.get<SeasonsApiResponse>(
    '/search_all_seasons.php',
    { params: { badge: 1, id: leagueId } }
  )
  return data
}

export default apiClient
