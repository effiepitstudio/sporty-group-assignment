# League List

A Vue 3 single-page application that displays and filters sports leagues from [TheSportsDB](https://www.thesportsdb.com/).

## Tech Stack, based on my current stach

- **Vue 3** — Composition API with `<script setup>`
- **Vuex 4** — Flux-pattern state management
- **TypeScript** — Full type safety
- **Vite** — Fast build tooling
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client
- **Vitest** — Unit testing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

## Project Structure

Tests are co-located with source files (`*.spec.ts` next to the module they test).

```
src/
├── assets/          # Global CSS
├── common/          # API service, constants
├── components/      # Vue components + specs
├── composables/     # Composition API hooks + specs
├── mocks/           # Shared test fixtures
├── store/           # Vuex store + specs
├── types/           # TypeScript interfaces
├── utils/           # Cache, debounce, search index + specs
├── workers/         # Web Worker for background fetching
├── App.vue
└── main.ts
```
