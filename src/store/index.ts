import { createStore } from "vuex";
import type { League, BadgeCacheEntry } from "@/types";
import { fetchAllLeagues, fetchSeasonBadges } from "@/common/api";
import { getCache, setCache } from "@/utils/cache";
import { CACHE_KEYS, BADGE_CACHE_CAPACITY } from "@/common/constants";

export interface RootState {
  leagues: League[];
  leaguesLoading: boolean;
  leaguesError: string | null;
  searchQuery: string;
  selectedSport: string;
  activeBadge: { leagueId: string; badgeUrl: string | null } | null;
  badgeLoading: boolean;
  badgeError: string | null;
  badgeCache: Map<string, BadgeCacheEntry>;
}

export function createInitialState(): RootState {
  return {
    leagues: [],
    leaguesLoading: false,
    leaguesError: null,
    searchQuery: localStorage.getItem(CACHE_KEYS.SEARCH_QUERY) ?? "",
    selectedSport: localStorage.getItem(CACHE_KEYS.SPORT_FILTER) ?? "",
    activeBadge: null,
    badgeLoading: false,
    badgeError: null,
    badgeCache: new Map<string, BadgeCacheEntry>(),
  };
}

// Mutation types

export const MutationTypes = {
  SET_LEAGUES: "SET_LEAGUES",
  SET_LEAGUES_LOADING: "SET_LEAGUES_LOADING",
  SET_LEAGUES_ERROR: "SET_LEAGUES_ERROR",
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  SET_SELECTED_SPORT: "SET_SELECTED_SPORT",
  SET_ACTIVE_BADGE: "SET_ACTIVE_BADGE",
  SET_BADGE_LOADING: "SET_BADGE_LOADING",
  SET_BADGE_ERROR: "SET_BADGE_ERROR",
  CACHE_BADGE: "CACHE_BADGE",
  CLEAR_ACTIVE_BADGE: "CLEAR_ACTIVE_BADGE",
} as const;

// Mutations

export const mutations = {
  [MutationTypes.SET_LEAGUES](state: RootState, leagues: League[]) {
    state.leagues = leagues;
  },
  [MutationTypes.SET_LEAGUES_LOADING](state: RootState, isLoading: boolean) {
    state.leaguesLoading = isLoading;
  },
  [MutationTypes.SET_LEAGUES_ERROR](state: RootState, error: string | null) {
    state.leaguesError = error;
  },
  [MutationTypes.SET_SEARCH_QUERY](state: RootState, query: string) {
    state.searchQuery = query;
    localStorage.setItem(CACHE_KEYS.SEARCH_QUERY, query);
  },
  [MutationTypes.SET_SELECTED_SPORT](state: RootState, sport: string) {
    state.selectedSport = sport;
    localStorage.setItem(CACHE_KEYS.SPORT_FILTER, sport);
  },
  [MutationTypes.SET_ACTIVE_BADGE](
    state: RootState,
    badge: { leagueId: string; badgeUrl: string | null },
  ) {
    state.activeBadge = badge;
  },
  [MutationTypes.SET_BADGE_LOADING](state: RootState, isLoading: boolean) {
    state.badgeLoading = isLoading;
  },
  [MutationTypes.SET_BADGE_ERROR](state: RootState, error: string | null) {
    state.badgeError = error;
  },
  [MutationTypes.CACHE_BADGE](
    state: RootState,
    { leagueId, badgeUrl }: { leagueId: string; badgeUrl: string | null },
  ) {
    // FIFO eviction: delete the oldest entry (first inserted) when at capacity
    if (state.badgeCache.size >= BADGE_CACHE_CAPACITY) {
      const oldestKey = state.badgeCache.keys().next().value;
      if (oldestKey !== undefined) state.badgeCache.delete(oldestKey);
    }
    const entry: BadgeCacheEntry = { badgeUrl, timestamp: Date.now() };
    state.badgeCache.set(leagueId, entry);
    setCache(`${CACHE_KEYS.BADGE_PREFIX}${leagueId}`, entry, sessionStorage);
  },
  [MutationTypes.CLEAR_ACTIVE_BADGE](state: RootState) {
    state.activeBadge = null;
    state.badgeError = null;
  },
};

// Actions

export const actions = {
  async loadLeagues({ commit }: { commit: Function }) {
    const cachedLeagues = getCache<League[]>(
      CACHE_KEYS.LEAGUES,
      sessionStorage,
    );
    if (cachedLeagues) {
      commit(MutationTypes.SET_LEAGUES, cachedLeagues);
      return;
    }

    commit(MutationTypes.SET_LEAGUES_LOADING, true);
    commit(MutationTypes.SET_LEAGUES_ERROR, null);

    try {
      const response = await fetchAllLeagues();
      const leagues = response.leagues ?? [];
      commit(MutationTypes.SET_LEAGUES, leagues);
      setCache(CACHE_KEYS.LEAGUES, leagues, sessionStorage);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load leagues";
      commit(MutationTypes.SET_LEAGUES_ERROR, message);
    } finally {
      commit(MutationTypes.SET_LEAGUES_LOADING, false);
    }
  },

  async fetchBadge(
    { commit, state }: { commit: Function; state: RootState },
    leagueId: string,
  ) {
    // Check in-memory cache first
    const cachedEntry = state.badgeCache.get(leagueId);
    if (cachedEntry) {
      commit(MutationTypes.SET_ACTIVE_BADGE, {
        leagueId,
        badgeUrl: cachedEntry.badgeUrl,
      });
      return;
    }

    // Fallback to sessionStorage
    const storedBadge = getCache<BadgeCacheEntry>(
      `${CACHE_KEYS.BADGE_PREFIX}${leagueId}`,
      sessionStorage,
    );
    if (storedBadge) {
      commit(MutationTypes.CACHE_BADGE, {
        leagueId,
        badgeUrl: storedBadge.badgeUrl,
      });
      commit(MutationTypes.SET_ACTIVE_BADGE, {
        leagueId,
        badgeUrl: storedBadge.badgeUrl,
      });
      return;
    }

    commit(MutationTypes.SET_BADGE_LOADING, true);
    commit(MutationTypes.SET_BADGE_ERROR, null);

    // Not in cache or sessionStorage, fetch from API
    try {
      const response = await fetchSeasonBadges(leagueId);
      const firstSeason = response.seasons?.[0] ?? null;
      const badgeUrl = firstSeason?.strBadge ?? null;

      commit(MutationTypes.CACHE_BADGE, { leagueId, badgeUrl });
      commit(MutationTypes.SET_ACTIVE_BADGE, { leagueId, badgeUrl });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load badge";
      commit(MutationTypes.SET_BADGE_ERROR, message);
    } finally {
      commit(MutationTypes.SET_BADGE_LOADING, false);
    }
  },

  updateSearchQuery({ commit }: { commit: Function }, query: string) {
    commit(MutationTypes.SET_SEARCH_QUERY, query);
  },

  updateSelectedSport({ commit }: { commit: Function }, sport: string) {
    commit(MutationTypes.SET_SELECTED_SPORT, sport);
  },

  closeBadgeModal({ commit }: { commit: Function }) {
    commit(MutationTypes.CLEAR_ACTIVE_BADGE);
  },
};

// Getters

export const getters = {
  // Filters leagues by search query and sport
  filteredLeagues(state: RootState): League[] {
    const query = state.searchQuery.toLowerCase().trim();
    const sport = state.selectedSport;

    return state.leagues.filter((league) => {
      if (sport && league.strSport !== sport) return false;
      if (!query) return true;

      const name = league.strLeague.toLowerCase();
      const alt = league.strLeagueAlternate?.toLowerCase() ?? "";
      return name.includes(query) || alt.includes(query);
    });
  },

  allLeagues(state: RootState): League[] {
    return state.leagues;
  },

  availableSports(state: RootState): string[] {
    const sportsSet = new Set<string>();
    for (const league of state.leagues) {
      if (league.strSport) sportsSet.add(league.strSport);
    }
    return Array.from(sportsSet).sort();
  },

  totalFilteredCount(
    _state: RootState,
    localGetters: Record<string, unknown>,
  ): number {
    return (localGetters.filteredLeagues as League[]).length;
  },

  leagueById(state: RootState): (id: string) => League | undefined {
    return (id: string) => state.leagues.find((l) => l.idLeague === id);
  },

  isLeagueSelected(state: RootState): (leagueId: string) => boolean {
    return (leagueId: string) => state.activeBadge?.leagueId === leagueId;
  },
};

// Store

export default createStore<RootState>({
  state: createInitialState,
  mutations,
  actions,
  getters,
  strict: import.meta.env.DEV,
});
