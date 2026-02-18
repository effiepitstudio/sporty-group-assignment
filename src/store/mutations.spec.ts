import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mutations, MutationTypes, createInitialState } from '@/store'
import type { RootState } from '@/store'
import { mockLeagues } from '@/mocks/leagueData'
import { BADGE_CACHE_CAPACITY } from '@/common/constants'

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })
Object.defineProperty(globalThis, 'sessionStorage', { value: localStorageMock })

describe('Store Mutations', () => {
  let state: RootState

  beforeEach(() => {
    state = createInitialState()
    localStorageMock.clear()
  })

  describe('SET_LEAGUES', () => {
    it('stores the leagues array', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      expect(state.leagues).toHaveLength(5)
    })

    it('preserves insertion order', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      expect(state.leagues[0].idLeague).toBe('4328')
      expect(state.leagues[4].idLeague).toBe('4400')
    })

    it('replaces existing leagues on re-set', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      mutations[MutationTypes.SET_LEAGUES](state, [mockLeagues[0]])
      expect(state.leagues).toHaveLength(1)
    })

    it('handles empty array cleanly', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      mutations[MutationTypes.SET_LEAGUES](state, [])
      expect(state.leagues).toHaveLength(0)
    })
  })

  describe('SET_LEAGUES_LOADING', () => {
    it('sets loading to true', () => {
      mutations[MutationTypes.SET_LEAGUES_LOADING](state, true)
      expect(state.leaguesLoading).toBe(true)
    })

    it('sets loading to false', () => {
      state.leaguesLoading = true
      mutations[MutationTypes.SET_LEAGUES_LOADING](state, false)
      expect(state.leaguesLoading).toBe(false)
    })
  })

  describe('SET_LEAGUES_ERROR', () => {
    it('sets error message', () => {
      mutations[MutationTypes.SET_LEAGUES_ERROR](state, 'Network error')
      expect(state.leaguesError).toBe('Network error')
    })

    it('clears error with null', () => {
      state.leaguesError = 'Previous error'
      mutations[MutationTypes.SET_LEAGUES_ERROR](state, null)
      expect(state.leaguesError).toBeNull()
    })
  })

  describe('SET_SEARCH_QUERY', () => {
    it('updates the search query', () => {
      mutations[MutationTypes.SET_SEARCH_QUERY](state, 'premier')
      expect(state.searchQuery).toBe('premier')
    })

    it('persists query to localStorage', () => {
      mutations[MutationTypes.SET_SEARCH_QUERY](state, 'nba')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'league-list:search-query',
        'nba'
      )
    })
  })

  describe('SET_SELECTED_SPORT', () => {
    it('updates the selected sport', () => {
      mutations[MutationTypes.SET_SELECTED_SPORT](state, 'Soccer')
      expect(state.selectedSport).toBe('Soccer')
    })

    it('persists sport to localStorage', () => {
      mutations[MutationTypes.SET_SELECTED_SPORT](state, 'Basketball')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'league-list:sport-filter',
        'Basketball'
      )
    })

    it('clears sport with empty string', () => {
      state.selectedSport = 'Soccer'
      mutations[MutationTypes.SET_SELECTED_SPORT](state, '')
      expect(state.selectedSport).toBe('')
    })
  })

  describe('SET_ACTIVE_BADGE', () => {
    it('sets active badge with URL', () => {
      const badge = { leagueId: '4328', badgeUrl: 'https://example.com/badge.png' }
      mutations[MutationTypes.SET_ACTIVE_BADGE](state, badge)
      expect(state.activeBadge).toEqual(badge)
    })

    it('sets active badge with null URL', () => {
      const badge = { leagueId: '4328', badgeUrl: null }
      mutations[MutationTypes.SET_ACTIVE_BADGE](state, badge)
      expect(state.activeBadge?.badgeUrl).toBeNull()
    })
  })

  describe('CLEAR_ACTIVE_BADGE', () => {
    it('resets badge and error state', () => {
      state.activeBadge = { leagueId: '4328', badgeUrl: 'https://example.com/badge.png' }
      state.badgeError = 'Some error'
      mutations[MutationTypes.CLEAR_ACTIVE_BADGE](state)
      expect(state.activeBadge).toBeNull()
      expect(state.badgeError).toBeNull()
    })
  })

  describe('CACHE_BADGE', () => {
    it('stores badge entry in cache', () => {
      mutations[MutationTypes.CACHE_BADGE](state, {
        leagueId: '4328',
        badgeUrl: 'https://example.com/badge.png',
      })
      const cached = state.badgeCache.get('4328')
      expect(cached).toBeDefined()
      expect(cached!.badgeUrl).toBe('https://example.com/badge.png')
    })

    it('includes a timestamp', () => {
      const before = Date.now()
      mutations[MutationTypes.CACHE_BADGE](state, {
        leagueId: '4328',
        badgeUrl: null,
      })
      const after = Date.now()
      const cached = state.badgeCache.get('4328')!
      expect(cached.timestamp).toBeGreaterThanOrEqual(before)
      expect(cached.timestamp).toBeLessThanOrEqual(after)
    })

    it('evicts oldest entry when capacity is exceeded', () => {
      // Use a small capacity for testing
      state.badgeCache = new Map()
      const smallCapacity = 2

      // Temporarily override BADGE_CACHE_CAPACITY by filling to exactly smallCapacity
      // We'll insert exactly BADGE_CACHE_CAPACITY entries then one more
      // Instead, test with the real capacity by pre-filling
      for (let i = 0; i < BADGE_CACHE_CAPACITY; i++) {
        state.badgeCache.set(`pre-${i}`, { badgeUrl: null, timestamp: 0 })
      }

      mutations[MutationTypes.CACHE_BADGE](state, { leagueId: 'new', badgeUrl: null })

      expect(state.badgeCache.has('pre-0')).toBe(false)
      expect(state.badgeCache.has('new')).toBe(true)
      expect(state.badgeCache.size).toBe(BADGE_CACHE_CAPACITY)
    })
  })
})
