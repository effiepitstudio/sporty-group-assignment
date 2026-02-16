import type { League, Season, BadgeCacheEntry } from '@/types'

export const mockLeagues: League[] = [
  {
    idLeague: '4328',
    strLeague: 'English Premier League',
    strSport: 'Soccer',
    strLeagueAlternate: 'Premier League, EPL',
  },
  {
    idLeague: '4387',
    strLeague: 'NBA',
    strSport: 'Basketball',
    strLeagueAlternate: 'National Basketball Association',
  },
  {
    idLeague: '4370',
    strLeague: 'Formula 1',
    strSport: 'Motorsport',
    strLeagueAlternate: 'F1',
  },
  {
    idLeague: '4391',
    strLeague: 'NFL',
    strSport: 'American Football',
    strLeagueAlternate: 'National Football League',
  },
  {
    idLeague: '4400',
    strLeague: 'La Liga',
    strSport: 'Soccer',
    strLeagueAlternate: 'Primera Division',
  },
]

export const mockSeasons: Season[] = [
  {
    idSeason: '1001',
    strSeason: '2023-2024',
    strBadge: 'https://example.com/badge-2024.png',
  },
  {
    idSeason: '1002',
    strSeason: '2022-2023',
    strBadge: 'https://example.com/badge-2023.png',
  },
]

export const mockEmptySeasons: Season[] = []

export const mockBadgeCacheEntry: BadgeCacheEntry = {
  badgeUrl: 'https://example.com/badge-2024.png',
  timestamp: Date.now(),
}

export const mockExpiredBadgeCacheEntry: BadgeCacheEntry = {
  badgeUrl: 'https://example.com/old-badge.png',
  timestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
}
