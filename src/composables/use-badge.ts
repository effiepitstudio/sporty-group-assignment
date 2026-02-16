import { computed } from "vue";
import { useStore } from "vuex";
import type { RootState } from "@/store";

export function useBadge(store = useStore<RootState>()) {
  const activeBadge = computed(() => store.state.activeBadge);
  const isLoading = computed(() => store.state.badgeLoading);
  const error = computed(() => store.state.badgeError);
  const isModalOpen = computed(
    () => activeBadge.value !== null || isLoading.value,
  );

  function openBadge(leagueId: string): void {
    store.dispatch("fetchBadge", leagueId);
  }

  function closeBadge(): void {
    store.dispatch("closeBadgeModal");
  }

  function isSelected(leagueId: string): boolean {
    return store.getters.isLeagueSelected(leagueId);
  }

  return {
    activeBadge,
    isLoading,
    error,
    isModalOpen,
    openBadge,
    closeBadge,
    isSelected,
  };
}
