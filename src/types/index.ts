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
