import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import type { RootState } from "@/store";
import type { League } from "@/types";

export function useLeagues(store = useStore<RootState>()) {
  const leagues = computed<League[]>(() => store.getters.filteredLeagues);
  const allLeagues = computed<League[]>(() => store.getters.allLeagues);
  const isLoading = computed(() => store.state.leaguesLoading);
  const error = computed(() => store.state.leaguesError);
  const totalCount = computed<number>(() => store.getters.totalFilteredCount);

  function loadLeagues(): Promise<void> {
    return store.dispatch("loadLeagues");
  }

  onMounted(() => {
    if (store.state.leagues.length === 0) {
      loadLeagues();
    }
  });

  return {
    leagues,
    allLeagues,
    isLoading,
    error,
    totalCount,
    loadLeagues,
  };
}
