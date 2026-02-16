import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  mutations,
  MutationTypes,
  createInitialState,
  normalizeLeagues,
  denormalizeLeagues,
  buildSearchIndex,
} from '@/store'
import type { RootState } from '@/store'
import { mockLeagues } from '@/mocks/leagueData'

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
    it('normalizes leagues into entity map and ordered IDs', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      expect(Object.keys(state.leagueEntities)).toHaveLength(5)
      expect(state.leagueIds).toHaveLength(5)
    })

    it('preserves insertion order in leagueIds', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      expect(state.leagueIds[0]).toBe('4328')
      expect(state.leagueIds[4]).toBe('4400')
    })

    it('makes individual leagues accessible by ID in O(1)', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      const epl = state.leagueEntities['4328']
      expect(epl.strLeague).toBe('English Premier League')
    })

    it('builds the search index alongside normalization', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      expect(state.searchIndex.indexSize).toBeGreaterThan(0)
    })

    it('replaces existing entities on re-set', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      mutations[MutationTypes.SET_LEAGUES](state, [mockLeagues[0]])
      expect(Object.keys(state.leagueEntities)).toHaveLength(1)
      expect(state.leagueIds).toHaveLength(1)
    })

    it('handles empty array cleanly', () => {
      mutations[MutationTypes.SET_LEAGUES](state, mockLeagues)
      mutations[MutationTypes.SET_LEAGUES](state, [])
      expect(state.leagueIds).toHaveLength(0)
      expect(Object.keys(state.leagueEntities)).toHaveLength(0)
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

    it('evicts oldest entry when capacity is exceeded', async () => {
      const { FIFOCache } = await import('@/utils/fifoCache')
      state.badgeCache = new FIFOCache(2)

      mutations[MutationTypes.CACHE_BADGE](state, { leagueId: 'A', badgeUrl: null })
      mutations[MutationTypes.CACHE_BADGE](state, { leagueId: 'B', badgeUrl: null })
      mutations[MutationTypes.CACHE_BADGE](state, { leagueId: 'C', badgeUrl: null })

      expect(state.badgeCache.has('A')).toBe(false)
      expect(state.badgeCache.has('B')).toBe(true)
      expect(state.badgeCache.has('C')).toBe(true)
    })
  })
})

describe('Store Helpers', () => {
  describe('normalizeLeagues', () => {
    it('creates entity map keyed by idLeague', () => {
      const { entities } = normalizeLeagues(mockLeagues)
      expect(entities['4328'].strLeague).toBe('English Premier League')
      expect(entities['4387'].strLeague).toBe('NBA')
    })

    it('creates ordered IDs matching input order', () => {
      const { ids } = normalizeLeagues(mockLeagues)
      expect(ids).toEqual(['4328', '4387', '4370', '4391', '4400'])
    })

    it('handles empty input', () => {
      const { entities, ids } = normalizeLeagues([])
      expect(Object.keys(entities)).toHaveLength(0)
      expect(ids).toHaveLength(0)
    })
  })

  describe('denormalizeLeagues', () => {
    it('converts IDs back into league objects', () => {
      const { entities, ids } = normalizeLeagues(mockLeagues)
      const result = denormalizeLeagues(ids, entities)
      expect(result).toHaveLength(5)
      expect(result[0].strLeague).toBe('English Premier League')
    })

    it('skips IDs that do not exist in the entity map', () => {
      const { entities } = normalizeLeagues(mockLeagues)
      const result = denormalizeLeagues(['9999', '4328'], entities)
      expect(result).toHaveLength(1)
      expect(result[0].idLeague).toBe('4328')
    })

    it('returns empty array for empty IDs', () => {
      const { entities } = normalizeLeagues(mockLeagues)
      const result = denormalizeLeagues([], entities)
      expect(result).toHaveLength(0)
    })
  })

  describe('buildSearchIndex', () => {
    it('creates a searchable index from entities', () => {
      const { entities, ids } = normalizeLeagues(mockLeagues)
      const index = buildSearchIndex(entities, ids)
      expect(index.indexSize).toBeGreaterThan(0)
    })

    it('indexes primary league names', () => {
      const { entities, ids } = normalizeLeagues(mockLeagues)
      const index = buildSearchIndex(entities, ids)
      const results = index.search('premier')
      expect(results.has('4328')).toBe(true)
    })

    it('indexes alternate league names', () => {
      const { entities, ids } = normalizeLeagues(mockLeagues)
      const index = buildSearchIndex(entities, ids)
      const results = index.search('primera')
      expect(results.has('4400')).toBe(true)
    })
  })
})
