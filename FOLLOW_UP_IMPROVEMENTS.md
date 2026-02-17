# Follow-Up Improvements

A list of enhancements and suggestions for future iterations of the League List application.

## For Analytics & large scale app Monitoring

- [ ] **Google Analytics / GA4** — Track page views, track user interactions such as clicks per league or search inputs.
- [ ] **Add some kind of logs, such as Graylog or other similar tools** — Capture runtime errors and performance metrics in production.

## For Testing

- [ ] **Integration tests** — End-to-end flows covering filter, API call, badge display with tools like Cypress.

## For Security

- [ ] **SSL / HTTPS enforcement** — Ensure all API calls and asset loading use HTTPS. Add HSTS headers.

## For Performance

- [ ] **Virtual scrolling** — Implement virtual scrolling (e.g. `vue-virtual-scroller`) for the league list and, as the platform scales, for high-volume views like live events listings and the "My Bets" section of the betslip where hundreds of settled/pending selections can accumulate.
- [ ] **Image optimization** — Lazy-load badge images with `IntersectionObserver` and use responsive `srcset`.
- [ ] **Code splitting** — Route-level splitting if the app grows beyond a single page.
- [ ] **Add some kind of polling mechanism for live updates**

## For Scaling & Navigation

- [ ] **Vue Router** — Introduce client-side routing as the app grows beyond a single view. Enables dedicated pages for bet builder, single event details, and betslip history etc.

## For UX Enhancements

- [ ] **Skeleton to real content transitions** — Smoother fade-in when data loads.
- [ ] **Keyboard navigation** — Full arrow-key grid navigation within the league list (this is for accessibility as well).
- [ ] **Dark/light theme toggle** — User preference with system detection fallback (by matching media "prefers-color-scheme").

## For Developer Experience

- [ ] **ESLint + Prettier** — Standardized code formatting and linting rules.
- [ ] **Storybook** — Isolated component development and documentation.

## Infrastructure

- [ ] **CDN for static assets** — Deploy behind a CDN (CloudFront, Cloudflare) for global performance. Such as sports icons, team logos etc
