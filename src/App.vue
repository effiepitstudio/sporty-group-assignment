<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader :total-count="totalCount" />

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <!-- Filters -->
      <section
        class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        aria-label="League filters"
      >
        <div class="flex-1">
          <SearchBar v-model="searchInput" />
        </div>

        <div class="flex items-center gap-3">
          <div class="w-full sm:w-48">
            <SportFilter
              v-model="selectedSport"
              :sports="availableSports"
            />
          </div>

          <button
            v-if="hasActiveFilters"
            class="shrink-0 rounded-lg border border-light/10 px-3 py-2.5 text-xs font-medium text-light/60 transition-colors hover:text-light"
            aria-label="Clear all filters"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>
      </section>

      <LeagueList
        :leagues="leagues"
        :is-loading="isLoading"
        :error="error"
        @select-league="openBadge"
        @retry="loadLeagues"
      />
    </main>

    <footer
      class="border-t border-light/10 py-4 text-center text-xs text-light/40"
    >
      <p>
        Developed by
        <a
          href="https://www.linkedin.com/in/effie-pitaouli/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-secondary hover:underline"
          >Effie Pitaouli</a
        >
      </p>
    </footer>

    <AsyncBadgeModal
      v-if="isModalOpen"
      :badge-url="activeBadge?.badgeUrl ?? null"
      :is-loading="badgeLoading"
      :error="badgeError"
      @close="closeBadge"
    />
  </div>
</template>
<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import SearchBar from "@/components/SearchBar.vue";
import SportFilter from "@/components/SportFilter.vue";
import LeagueList from "@/components/LeagueList.vue";
import { useLeagues } from "@/composables/use-leagues";
import { useFilters } from "@/composables/use-filters";
import { useBadge } from "@/composables/use-badge";

const AsyncBadgeModal = defineAsyncComponent(
  () => import("@/components/BadgeModal.vue"),
);

const { leagues, isLoading, error, totalCount, loadLeagues } = useLeagues();

const {
  searchInput,
  selectedSport,
  availableSports,
  hasActiveFilters,
  clearFilters,
} = useFilters();

const {
  activeBadge,
  isLoading: badgeLoading,
  error: badgeError,
  isModalOpen,
  openBadge,
  closeBadge,
} = useBadge();
</script>
