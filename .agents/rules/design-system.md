# Design system rules

- Colours, fonts and radii come from the CSS variables at the top of `src/index.css`. Add new tokens there instead of hard-coding values in components.
- Headings and big numerals use `var(--serif)` (Instrument Serif). Everything else uses `var(--sans)` (Geist).
- The lavender hero panel is the only filled, high-contrast block on the page. Do not add more filled panels or wrap sections in cards.
- Category colours live in `src/lib/constants.js`. Reuse them for any new chart or chip so a category looks the same everywhere.
- Every interactive element needs a visible `:focus-visible` state and an accessible name.
- Respect `prefers-reduced-motion`. Motion should answer a user action, except the single pace-line draw on load.
- Do not use all-caps labels, tracked-out eyebrows, or numbered markers.
