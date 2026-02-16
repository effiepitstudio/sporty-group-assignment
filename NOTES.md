# League List — Notes

## AI Tools Used

- **Claude AI (Anthropic)** — Helped accelerate boilerplate setup (Vite config, Tailwind config, Vuex store structure) and unit test generation.

### Prompts used

- Create a startup project using vue 3, vuex, vite, TypeScript and Tailwind. Standard file structure. src folder, components, composables, store, common, utilities (other helpers). Include any other necessary dependencies such as axios for api requests.

- Include scripts in the package.json for running the project locally and for running unit tests.

- Create a mocks folder for unit tests. Organize unit tests in describe blocks per function, computed property etc. Use snapshot testing for UI. I want the test files to be in the same path as the actual components and composables. E.g LeagueCard.vue and LeagueCard.spec.ts should be in the same folder. Same for the composables. The mocks folder can be in src/.

- Change unit tests to use beforeEach in test files to shallowMount

- Create only the basic format for the documentation file.

- Create a Follow up Improvemnts document with a list for further enhancements such as Google Analytics, Integration testing, SSL encryption and security improvements

- Add vue router in the follow ups file as a suggestion for when the app scales to include bet builder or single event pages.

Also add a suggestion for virtual scroller for a events listing or for my bets in betslip.

## Design Decisions

### Architecture

- **Vue 3 + Composition API** — Composables (`useLeagues`, `useFilters`, `useBadge`) encapsulate domain logic and are independently testable.
- **Vuex with Flux pattern** — Strict separation of state, mutations, actions, and getters. All state changes flow through mutations; side effects live in actions.
- **TypeScript throughout** — Full type coverage including store state, API responses, and component props/emits.

### Performance

- **Session/localStorage caching** — API responses are cached with TTL to avoid redundant network calls. Filter preferences persist across page reloads via `localStorage`.
- **Web Worker** — A dedicated worker (`leagueWorker.ts`) is available for offloading API calls off the main thread. This is because this app can be scaled to accomodate live updates for a list of sports with a lot of live games which will require real time updates. A web worker is the optimal choice for such cases because it will not block the rendering of the app and will handle the batches of data in the background.
- **`defineAsyncComponent`** — The `BadgeModal` is lazy-loaded so it doesn't increase the initial bundle size.
- **Debounced search** — The search input debounces dispatches to the store to prevent excessive re-filtering.

### Design System

- **Tailwind CSS** with a custom color palette (warm brand amber, cool surface slate, vibrant accents).
- **Dark theme** — Designed around a dark surface background with high-contrast text and vivid brand accents (personal preference).

### Testing

- **Vitest + @vue/test-utils** — Unit tests cover store mutations, getters, utility functions, composables, and component rendering/interaction.
- Tests are organized in `describe` blocks per function or property for clear structure.
- Snapshots cover the UI. As the app scales, storybook will be a good choice for having a design system and some references.
