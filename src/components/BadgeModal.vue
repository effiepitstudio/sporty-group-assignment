<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Season badge"
      @click="handleOverlayClick"
    >
      <div
        class="relative w-full max-w-sm rounded-2xl border border-light/10 bg-dark p-6 shadow-2xl animate-fade-in"
      >
        <!-- Close -->
        <button
          class="absolute right-3 top-3 text-light/50 transition-colors hover:text-light"
          aria-label="Close badge modal"
          @click="emit('close')"
        >
          <!-- from https://heroicons.com/ outline -->
          <svg
            class="h-5 w-5"
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
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div
          v-if="isLoading"
          class="flex flex-col items-center gap-4 py-8"
        >
          <div
            class="badge-shimmer h-32 w-32 rounded-xl"
            style="contain-intrinsic-height: 192px"
            role="presentation"
          />
          <p class="text-sm text-light/50">Loading badge...</p>
        </div>

        <div
          v-else-if="error"
          class="flex flex-col items-center gap-3 py-8 text-center"
          role="alert"
        >
          <p class="text-sm text-primary">{{ error }}</p>
        </div>

        <div
          v-else-if="badgeUrl"
          class="flex flex-col items-center gap-4 py-4"
        >
          <img
            :src="badgeUrl"
            alt="Season badge"
            class="max-h-48 max-w-full rounded-lg object-contain"
            loading="lazy"
          />
          <p class="text-xs text-light/50">Season Badge</p>
        </div>

        <div
          v-else
          class="flex flex-col items-center gap-3 py-8 text-center"
        >
          <p class="text-sm text-light/50">
            No badge available for this league.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";

defineProps<{
  badgeUrl: string | null;
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    emit("close");
  }
}

function handleOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    emit("close");
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  document.body.style.overflow = "hidden";
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
  document.body.style.overflow = "";
});
</script>
