import { createStore } from 'vuex'
import type { RootState } from '@/store'
import { mutations, getters, normalizeLeagues, buildSearchIndex } from '@/store'
import { FIFOCache } from '@/utils/fifoCache'
import { SearchIndex } from '@/utils/searchIndex'
import type { BadgeCacheEntry, League } from '@/types'
import { BADGE_CACHE_CAPACITY } from '@/common/constants'
import { mockLeagues } from './leagueData'

export function createMockState(overrides: Partial<RootState> = {}): RootState {
  return {
    leagueEntities: {},
    leagueIds: [],
    leaguesLoading: false,
    leaguesError: null,
    searchQuery: '',
    selectedSport: '',
    activeBadge: null,
    badgeLoading: false,
    badgeError: null,
    badgeCache: new FIFOCache<string, BadgeCacheEntry>(BADGE_CACHE_CAPACITY),
    searchIndex: new SearchIndex<string>(),
    ...overrides,
  }
}

export function createNormalizedState(
  leagues: League[],
  overrides: Partial<RootState> = {}
): RootState {
  const { entities, ids } = normalizeLeagues(leagues)
  const searchIndex = buildSearchIndex(entities, ids)

  return createMockState({
    leagueEntities: entities,
    leagueIds: ids,
    searchIndex,
    ...overrides,
  })
}

export function createMockStore(stateOverrides: Partial<RootState> = {}) {
  return createStore<RootState>({
    state: () => createMockState(stateOverrides),
    mutations,
    getters,
    actions: {
      loadLeagues: vi.fn(),
      fetchBadge: vi.fn(),
      updateSearchQuery: vi.fn(),
      updateSelectedSport: vi.fn(),
      closeBadgeModal: vi.fn(),
    },
  })
}

export function createPopulatedMockStore(
  stateOverrides: Partial<RootState> = {}
) {
  const { entities, ids } = normalizeLeagues(mockLeagues)
  const searchIndex = buildSearchIndex(entities, ids)

  return createMockStore({
    leagueEntities: entities,
    leagueIds: ids,
    searchIndex,
    ...stateOverrides,
  })
}
