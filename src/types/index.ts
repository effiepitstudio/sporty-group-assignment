export interface League {
  idLeague: string
  strLeague: string
  strSport: string
  strLeagueAlternate: string | null
}

export interface LeaguesApiResponse {
  leagues: League[]
}

export interface Season {
  idSeason: string
  strSeason: string
  strBadge: string | null
}

export interface SeasonsApiResponse {
  seasons: Season[] | null
}

export interface BadgeCacheEntry {
  badgeUrl: string | null
  timestamp: number
}

export type LeagueEntityMap = Record<string, League>

export interface WorkerMessage {
  type: 'FETCH_LEAGUES' | 'FETCH_BADGE'
  payload?: { leagueId: string }
}

export interface WorkerResponse {
  type: 'LEAGUES_RESULT' | 'BADGE_RESULT' | 'ERROR'
  payload?: LeaguesApiResponse | SeasonsApiResponse
  leagueId?: string
  error?: string
}
