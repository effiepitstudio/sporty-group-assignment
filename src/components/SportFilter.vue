<template>
  <div class="relative">
    <label
      for="sport-filter"
      class="sr-only"
      >Filter by sport type</label
    >
    <select
      id="sport-filter"
      v-model="modelValue"
      class="input-base appearance-none pr-10 cursor-pointer"
      aria-label="Filter leagues by sport"
    >
      <option value="">All Sports</option>
      <option
        v-for="sport in sports"
        :key="sport"
        :value="sport"
      >
        {{ sport }}
      </option>
    </select>
    <!-- from https://heroicons.com/ outline -->
    <svg
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light/40"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  sports: string[];
}>();

const modelValue = defineModel<string>({ required: true });
</script>
