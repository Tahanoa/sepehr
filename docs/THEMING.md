# Sepehr appearance architecture

The first redesign increment establishes theme packages, the shared dashboard shell and an action-first learner home. It does not replace every role-specific workflow or add backend authentication.

## Contract

- `src/theme/theme.ts` owns versioned packages, validation, contrast checks and persistence.
- `src/styles/theme.css` owns semantic tokens (`--color-primary`, `--color-surface`, `--color-text`, etc.).
- Tailwind's existing `brand` and `polaris` colors map to runtime RGB channels. Opacity modifiers remain supported.
- `src/styles/redesign.css` owns shared semantic components and density/radius variants.
- Pages must use semantic component classes or runtime variables, never literal brand hex values.
- Success, warning and danger colors remain independent of brand palettes.
- Event names and existing data storage keys retain their legacy identifiers to avoid breaking routes and demo sessions.

## Add a preset

Add an entry to `palettes` in `src/theme/theme.ts`: `label`, `primary`, `hover`, `accent`, `secondary`, `subtle`. The selector discovers it automatically; pages need no edits. `primary` requires at least 4.5:1 contrast with white; `accent` requires at least 4.5:1 with `#18201F`. Check hover colors as well. Neutral surfaces and status tokens live in `theme.css` and can be extended independently.

## Appearance settings

The header's appearance button is available to every dashboard role. Administrators also have the appearance panel inside Settings. Three light presets, custom primary/accent colors, two fonts, two density levels and two corner styles are supported. Live previews are temporary; Save writes the settings to `sepehr.theme.v1` in this browser. Closing the appearance dialog restores the last saved configuration. The embedded settings panel keeps its live preview until another appearance is applied or the page reloads.

JSON import accepts version 1 only, validates every field, checks contrast and rejects files larger than 16 KiB. Export downloads the validated draft. Corrupt or unavailable browser storage falls back to defaults. Do not put organization secrets into theme packages.

These are local preferences, not organization-wide branding. Organization persistence, logos, dark mode, server synchronization and conflict resolution are future work; they are not simulated as implemented features.

## Verification

```
npm ci
npm run typecheck
npm run build
npx playwright install chromium
npm run test:ui
```

The UI smoke test starts its own Vite server on 4174. It checks presets, invalid imports, persistence, preview rollback, learner identity and date normalization, plus 320px/390px layout, modal focus and mobile drawer dismissal. Screenshots are temporary QA output, not repository assets.

Before expanding the redesign, test teacher grading, learner exam submission and parent messaging with real users. The remaining role-specific pages inherit the new palette/type treatment but retain their existing information architecture.
