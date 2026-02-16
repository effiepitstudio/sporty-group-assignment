<template>
  <article
    class="rounded-xl h-full border bg-light/80 p-4 transition-colors cursor-pointer select-none"
    :class="[
      isSelected ? 'border-primary' : 'border-dark/30 hover:border-light/20',
    ]"
    role="button"
    :tabindex="0"
    :aria-label="`View badge for ${league.strLeague}`"
    :aria-pressed="isSelected"
    @click="emit('select', league.idLeague)"
    @keydown.enter="emit('select', league.idLeague)"
    @keydown.space.prevent="emit('select', league.idLeague)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="truncate line-clamp-2 text-sm font-semibold text-dark">
          {{ league.strLeague }}
        </h3>

        <p
          v-if="league.strLeagueAlternate"
          class="mt-0.5 truncate text-xs text-dark/80"
          :title="league.strLeagueAlternate"
        >
          {{ league.strLeagueAlternate }}
        </p>
      </div>

      <span
        class="inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-secondary text-light/80"
      >
        {{ league.strSport }}
      </span>
    </div>
  </article>
</template>
<script setup lang="ts">
import type { League } from "@/types";

defineProps<{
  league: League;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [leagueId: string];
}>();
</script>
