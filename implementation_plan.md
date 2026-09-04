# Editorial Redesign Implementation Plan

## Goal Description
Redesign the front‑end of **EeraFact** to adopt a premium editorial/newsroom aesthetic while preserving all existing functionality (backend, Gemini integration, multimodal verification, confidence scoring, etc.).

Key visual goals:
- Warm off‑white / paper‑like background (light theme) with a complementary dark‑mode.
- Near‑black primary typography, editorial font (Merriweather for headings, Inter for body).
- Vermilion/red accent for false, deep‑green for true, amber for uncertain states.
- Refined, low‑radius UI components, thin borders, subtle separators.
- New minimalist logo (generated image `new_logo_*.png`).
- Dark‑mode toggle button placed in the header.
- Renamed CSS class names to semantic, non‑framework names (e.g., `panel`, `tab`, `input-group`).
- Updated component JS/JSX to reference new class names and theme variables.

## User Review Required
> **[IMPORTANT]**
> The plan assumes the following:
> - Font families: **Merriweather** for headings, **Inter** for body.
> - Accent colors (hex): `#c33248` (verdict‑fake/red), `#2e7d32` (verdict‑real/green), `#d97706` (verdict‑misleading/amber).
> - Dark‑mode toggle will be a simple button in the header that toggles the `dark-mode` class on `<html>`.
> - New logo file: `new_logo_1788513895736.png` (already generated).
> - All existing CSS custom properties will be kept (e.g., `--border-color`) but updated to reflect the new palette.
>
> Please confirm or adjust any of the above before we proceed.

## Open Questions
> **[QUESTION]**
> 1. Should the dark‑mode be persisted (e.g., via `localStorage`) or only for the session?
> 2. Do you want any additional brand colors or secondary accents?
> 3. Should the logo replace the existing brand icon completely, or be displayed alongside it?

## Proposed Changes
---
### 1. Design Tokens (`frontend/src/index.css`)
- Add new CSS variables for primary colors, accent colors, fonts, radii.
- Include `:root` light theme values (already edited) and `.dark-mode` overrides.
- Remove all glass‑morphism related utilities.
- Rename radius variables to smaller values (`--radius-sm: 4px`).
- Update existing components to use the new variables (e.g., `background: var(--bg-card)`).

### 2. New Logo Asset
- Place `new_logo_1788513895736.png` into `frontend/public/assets/`.
- Update `Header.jsx` to import and display the new logo image.
- Remove the `Target` icon usage.

### 3. Dark‑Mode Toggle
- Add a button in `Header.jsx` (e.g., moon/sun icon) that toggles a `dark-mode` class on the `<html>` element.
- Persist choice in `localStorage` (optional – to be decided by the answer to open question).
- Adjust CSS to respect `dark-mode` overrides (already present).

### 4. Rename CSS Classes (Semantic Naming)
Create a mapping and update all JSX files:
| Old Class | New Class |
|-----------|----------|
| `glass-panel` | `panel` |
| `glass-panel-glow` | `panel-glow` |
| `input-tabs` | `tab-group` |
| `input-tab` | `tab-item` |
| `textarea-container` | `input-group` |
| `custom-textarea` / `custom-input` | `input-field` |
| `dropzone` | `drop-area` |
| `submit-btn` | `primary-action` |
| `nav-link` | `nav-item` |
| `brand` | `brand-container` |
| `brand-icon` | `brand-logo` |
| `brand-title` | `brand-name` |
| `brand-subtitle` | `brand-tagline` |
| `ai-status-pill` | `status-badge` |
…and update all references in `Header.jsx`, `InputForm.jsx`, `ReportCard.jsx`, and any other component files.

### 5. Component Updates
- **Header.jsx**: use new logo image, add dark‑mode toggle button, replace navigation class names, adjust styles to use new variables.
- **InputForm.jsx**: replace class names, update button colors (red accent for primary CTA), adjust drag‑and‑drop UI to new look, ensure focus states use new design tokens.
- **ReportCard.jsx**: replace verdict badge styles with new accent colors, simplify SVG shield target to a minimal badge, use new `panel` classes, adjust confidence gauge colors to match accent palette, ensure the result screen uses new typography.
- **Any other components** (`AboutView.jsx`, `HistoryView.jsx`) to use new class names and fonts.

### 6. Add Global Styles
- Introduce `global.css` (or extend `index.css`) to set base typography, headings, links, and button resets.
- Ensure body background switches based on theme (`var(--bg-primary)`).

### 7. Mobile Responsiveness
- Verify existing media queries still work; adjust breakpoints if needed to accommodate new layout.
- Ensure all interactive elements meet minimum touch‑target size (44 px).

### 8. Testing & Verification
- Run existing unit tests (`npm test`).
- Perform manual UI checks on desktop and mobile browsers.
- Verify that all existing API calls (Gemini, backend) still succeed after UI refactor.
- Confirm that the confidence gauge still reflects the correct score.

## Verification Plan
### Automated Tests
- Execute `npm run test` (if present) to ensure no regressions.
- Run a simple smoke test script that launches the dev server (`npm run dev`) and checks that the main page loads without console errors.

### Manual Verification
- Open the app in Chrome (desktop) and verify:
  * Light theme matches editorial design.
  * Dark‑mode toggle switches theme correctly.
  * New logo appears and scales responsively.
  * Input tabs, form fields, and submit button have the new colors and radii.
  * Verdict cards display red/green/amber accents as per verdict.
  * Confidence gauge shows correct percentage.
  * All navigation links, source cards, and download/print actions still work.
- Test on a mobile viewport (e.g., iPhone X) to ensure layout stacks correctly.

---
*Proceed with the implementation after you confirm the open questions and any adjustments needed.*
