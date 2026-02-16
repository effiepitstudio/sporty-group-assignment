<template>
  <header class="bg-primary sticky top-0 z-30">
    <div class="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold text-light">Leagues Listing</h1>
        </div>

        <span
          class="rounded-full bg-light/20 px-3 py-1 text-xs font-medium text-light"
          role="status"
          aria-live="polite"
        >
          {{ totalCount }} league{{ totalCount >= 1 ? "s" : "" }}
        </span>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
defineProps<{
  totalCount: number;
}>();
</script>
