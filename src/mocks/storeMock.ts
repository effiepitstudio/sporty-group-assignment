import { createStore } from 'vuex'
import type { RootState } from '@/store'
import { mutations, getters } from '@/store'
import type { BadgeCacheEntry } from '@/types'
import { mockLeagues } from './leagueData'

export function createMockState(overrides: Partial<RootState> = {}): RootState {
  return {
    leagues: [],
    leaguesLoading: false,
    leaguesError: null,
    searchQuery: '',
    selectedSport: '',
    activeBadge: null,
    badgeLoading: false,
    badgeError: null,
    badgeCache: new Map<string, BadgeCacheEntry>(),
    ...overrides,
  }
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
  return createMockStore({
    leagues: mockLeagues,
    ...stateOverrides,
  })
}
