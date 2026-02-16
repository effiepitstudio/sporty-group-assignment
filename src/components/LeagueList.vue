<template>
  <!-- Loading -->
  <div
    v-if="isLoading"
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    aria-busy="true"
    aria-label="Loading leagues"
  >
    <div
      v-for="n in 12"
      :key="n"
      class="badge-shimmer h-[72px] rounded-xl"
      role="presentation"
    />
  </div>

  <!-- Error -->
  <div
    v-else-if="error"
    class="flex flex-col items-center gap-4 py-16 text-center"
    role="alert"
  >
    <p class="text-sm text-light/60">{{ error }}</p>
    <button
      class="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-light transition-colors hover:bg-secondary/80"
      @click="emit('retry')"
    >
      Try Again
    </button>
  </div>

  <!-- Empty -->
  <div
    v-else-if="leagues.length === 0"
    class="flex flex-col items-center gap-3 py-16 text-center"
    role="status"
  >
    <p class="text-sm text-light/50">No leagues match your filters.</p>
  </div>

  <!-- League grid -->
  <ul
    v-else
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    role="list"
    aria-label="Sports leagues"
  >
    <li
      v-for="league in leagues"
      :key="league.idLeague"
      class="animate-fade-in"
    >
      <LeagueCard
        :league="league"
        :is-selected="isSelected(league.idLeague)"
        @select="emit('selectLeague', $event)"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import type { League } from "@/types";
import LeagueCard from "@/components/LeagueCard.vue";

defineProps<{
  leagues: League[];
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  selectLeague: [leagueId: string];
  retry: [];
}>();

function isSelected(_leagueId: string): boolean {
  return false;
}

defineExpose({ isSelected });
</script>
