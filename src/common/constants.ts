export const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3'

export const ENDPOINTS = {
  ALL_LEAGUES: `${API_BASE_URL}/all_leagues.php`,
  SEASON_BADGES: (leagueId: string) =>
    `${API_BASE_URL}/search_all_seasons.php?badge=1&id=${leagueId}`,
} as const

export const CACHE_KEYS = {
  LEAGUES: 'league-list:leagues',
  BADGE_PREFIX: 'league-list:badge:',
  SPORT_FILTER: 'league-list:sport-filter',
  SEARCH_QUERY: 'league-list:search-query',
} as const

export const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

export const BADGE_CACHE_CAPACITY = 50 // max badge entries in memory

export const DEBOUNCE_DELAY_MS = 300
