import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import type { RootState } from "@/store";
import { debounce } from "@/utils/debounce";
import { DEBOUNCE_DELAY_MS } from "@/common/constants";

export function useFilters(store = useStore<RootState>()) {
  const searchInput = ref(store.state.searchQuery);
  const selectedSport = computed({
    get: () => store.state.selectedSport,
    set: (value: string) => store.dispatch("updateSelectedSport", value),
  });

  const availableSports = computed<string[]>(
    () => store.getters.availableSports,
  );

  const debouncedUpdateSearch = debounce((query: string) => {
    store.dispatch("updateSearchQuery", query);
  }, DEBOUNCE_DELAY_MS);

  watch(searchInput, (newValue) => {
    debouncedUpdateSearch(newValue);
  });

  function clearFilters(): void {
    searchInput.value = "";
    store.dispatch("updateSearchQuery", "");
    store.dispatch("updateSelectedSport", "");
  }

  const hasActiveFilters = computed(
    () => store.state.searchQuery !== "" || store.state.selectedSport !== "",
  );

  return {
    searchInput,
    selectedSport,
    availableSports,
    hasActiveFilters,
    clearFilters,
  };
}
