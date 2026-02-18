import { describe, it, expect, beforeEach } from 'vitest'
import { getters } from '@/store'
import type { RootState } from '@/store'
import { mockLeagues } from '@/mocks/leagueData'
import { createMockState } from '@/mocks/storeMock'

describe('Store Getters', () => {
  let state: RootState

  beforeEach(() => {
    state = createMockState({ leagues: mockLeagues })
  })

  describe('filteredLeagues', () => {
    it('returns all leagues when no filters are active', () => {
      const result = getters.filteredLeagues(state)
      expect(result).toHaveLength(5)
    })

    it('filters by league name (case-insensitive substring)', () => {
      state.searchQuery = 'premier'
      const result = getters.filteredLeagues(state)
      expect(result).toHaveLength(1)
      expect(result[0].strLeague).toBe('English Premier League')
    })

    it('matches alternate names', () => {
      state.searchQuery = 'primera'
      const result = getters.filteredLeagues(state)
      expect(result).toHaveLength(1)
      expect(result[0].strLeague).toBe('La Liga')
    })

    it('is case-insensitive', () => {
      state.searchQuery = 'NBA'
      const result = getters.filteredLeagues(state)
      expect(result).toHaveLength(1)
      expect(result[0].strLeague).toBe('NBA')
    })

    it('trims whitespace from search query', () => {
      state.searchQuery = '  formula  '
      const result = getters.filteredLeagues(state)
      expect(result).toHaveLength(1)
    })

    it('filters by selected sport', () => {
      state.selectedSport = 'Soccer'
      const result = getters.filteredLeagues(state)
      expect(result).toHaveLength(2)
      expect(result.every((l) => l.strSport === 'Soccer')).toBe(true)
    })

    it('combines search query with sport filter', () => {
      state.searchQuery = 'la'
      state.selectedSport = 'Soccer'
      const result = getters.filteredLeagues(state)
      expect(result).toHaveLength(1)
      expect(result[0].strLeague).toBe('La Liga')
    })

    it('returns empty array when nothing matches', () => {
      state.searchQuery = 'zzz_nonexistent'
      const result = getters.filteredLeagues(state)
      expect(result).toHaveLength(0)
    })

    it('preserves original ordering', () => {
      state.selectedSport = 'Soccer'
      const result = getters.filteredLeagues(state)
      expect(result[0].strLeague).toBe('English Premier League')
      expect(result[1].strLeague).toBe('La Liga')
    })
  })

  describe('allLeagues', () => {
    it('returns all leagues', () => {
      const result = getters.allLeagues(state)
      expect(result).toHaveLength(5)
      expect(result[0].idLeague).toBe('4328')
    })

    it('returns empty array when store is empty', () => {
      state.leagues = []
      const result = getters.allLeagues(state)
      expect(result).toHaveLength(0)
    })
  })

  describe('availableSports', () => {
    it('returns unique sorted sport names', () => {
      const result = getters.availableSports(state)
      expect(result).toEqual([
        'American Football',
        'Basketball',
        'Motorsport',
        'Soccer',
      ])
    })

    it('returns empty array when no leagues exist', () => {
      state.leagues = []
      const result = getters.availableSports(state)
      expect(result).toHaveLength(0)
    })

    it('does not include duplicates', () => {
      const result = getters.availableSports(state)
      const uniqueCount = new Set(result).size
      expect(result.length).toBe(uniqueCount)
    })
  })

  describe('totalFilteredCount', () => {
    it('returns count of filtered leagues', () => {
      const localGetters = { filteredLeagues: mockLeagues }
      const result = getters.totalFilteredCount(state, localGetters)
      expect(result).toBe(5)
    })

    it('returns 0 for empty filtered results', () => {
      const localGetters = { filteredLeagues: [] }
      const result = getters.totalFilteredCount(state, localGetters)
      expect(result).toBe(0)
    })
  })

  describe('leagueById', () => {
    it('returns league object for valid ID', () => {
      const lookup = getters.leagueById(state)
      const league = lookup('4387')
      expect(league?.strLeague).toBe('NBA')
    })

    it('returns undefined for non-existent ID', () => {
      const lookup = getters.leagueById(state)
      expect(lookup('9999')).toBeUndefined()
    })
  })

  describe('isLeagueSelected', () => {
    it('returns true when league matches active badge', () => {
      state.activeBadge = { leagueId: '4328', badgeUrl: null }
      const checker = getters.isLeagueSelected(state)
      expect(checker('4328')).toBe(true)
    })

    it('returns false when league does not match', () => {
      state.activeBadge = { leagueId: '4328', badgeUrl: null }
      const checker = getters.isLeagueSelected(state)
      expect(checker('4387')).toBe(false)
    })

    it('returns false when no badge is active', () => {
      state.activeBadge = null
      const checker = getters.isLeagueSelected(state)
      expect(checker('4328')).toBe(false)
    })
  })
})
