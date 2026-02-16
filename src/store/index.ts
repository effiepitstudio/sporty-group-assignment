import { createStore } from "vuex";
import type { League, LeagueEntityMap, BadgeCacheEntry } from "@/types";
import { fetchAllLeagues, fetchSeasonBadges } from "@/common/api";
import { getCache, setCache } from "@/utils/cache";
import { FIFOCache } from "@/utils/fifoCache";
import { SearchIndex } from "@/utils/searchIndex";
import { CACHE_KEYS, BADGE_CACHE_CAPACITY } from "@/common/constants";

export interface RootState {
  leagueEntities: LeagueEntityMap;
  leagueIds: string[];
  leaguesLoading: boolean;
  leaguesError: string | null;
  searchQuery: string;
  selectedSport: string;
  activeBadge: { leagueId: string; badgeUrl: string | null } | null;
  badgeLoading: boolean;
  badgeError: string | null;
  badgeCache: FIFOCache<string, BadgeCacheEntry>;
  searchIndex: SearchIndex<string>;
}

export function createInitialState(): RootState {
  return {
    leagueEntities: {},
    leagueIds: [],
    leaguesLoading: false,
    leaguesError: null,
    searchQuery: localStorage.getItem(CACHE_KEYS.SEARCH_QUERY) ?? "",
    selectedSport: localStorage.getItem(CACHE_KEYS.SPORT_FILTER) ?? "",
    activeBadge: null,
    badgeLoading: false,
    badgeError: null,
    badgeCache: new FIFOCache<string, BadgeCacheEntry>(BADGE_CACHE_CAPACITY),
    searchIndex: new SearchIndex<string>(),
  };
}

// Converts league array into entity map + ordered IDs
export function normalizeLeagues(leagues: League[]): {
  entities: LeagueEntityMap;
  ids: string[];
} {
  const entities: LeagueEntityMap = {};
  const ids: string[] = [];

  for (const league of leagues) {
    entities[league.idLeague] = league;
    ids.push(league.idLeague);
  }

  return { entities, ids };
}

// Builds search index from primary and alternate league names
export function buildSearchIndex(
  entities: LeagueEntityMap,
  ids: string[],
): SearchIndex<string> {
  const index = new SearchIndex<string>();

  for (const id of ids) {
    const league = entities[id];
    index.addEntity(id, league.strLeague, league.strLeagueAlternate);
  }

  return index;
}

// Converts IDs back into League objects
export function denormalizeLeagues(
  ids: string[],
  entities: LeagueEntityMap,
): League[] {
  const result: League[] = [];
  for (const id of ids) {
    const league = entities[id];
    if (league) result.push(league);
  }
  return result;
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
    const { entities, ids } = normalizeLeagues(leagues);
    state.leagueEntities = entities;
    state.leagueIds = ids;
    // Index is built once when setting leagues and then reused on every search
    state.searchIndex = buildSearchIndex(entities, ids);
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
    const entry: BadgeCacheEntry = { badgeUrl, timestamp: Date.now() };
    state.badgeCache.put(leagueId, entry);
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
  /*
   * Filters leagues by search query and sport, returns matching League objects.
   * We could also use leagues.filter(l => l.strLeague.toLowerCase().includes(searchQuery))
   * and skip all the logic regarding index. It would work fine for the current leagues size.
   * But index is more scalable when wanting to search for substring in a whole app for all available events for example.
   */
  filteredLeagues(state: RootState): League[] {
    const normalizedQuery = state.searchQuery.toLowerCase().trim();
    const selectedSport = state.selectedSport;

    let candidateIds: string[];

    if (normalizedQuery) {
      const searchMatches = state.searchIndex.search(normalizedQuery);
      candidateIds = state.leagueIds.filter((id) => searchMatches.has(id));
    } else {
      candidateIds = state.leagueIds;
    }

    if (selectedSport) {
      candidateIds = candidateIds.filter(
        (id) => state.leagueEntities[id]?.strSport === selectedSport,
      );
    }

    return denormalizeLeagues(candidateIds, state.leagueEntities);
  },

  allLeagues(state: RootState): League[] {
    return denormalizeLeagues(state.leagueIds, state.leagueEntities);
  },

  availableSports(state: RootState): string[] {
    const sportsSet = new Set<string>();
    for (const id of state.leagueIds) {
      const sport = state.leagueEntities[id]?.strSport;
      if (sport) sportsSet.add(sport);
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
    return (id: string) => state.leagueEntities[id];
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
