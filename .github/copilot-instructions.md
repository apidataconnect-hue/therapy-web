# Copilot Instructions for Therapy Web Panel

## Purpose
This repository contains the web panel of a therapy management platform.

The panel is intended for therapist and administrative use, and may include areas related to:
- patient management
- therapist agenda
- appointments and sessions
- therapy processes
- scheduling and availability
- dashboards
- administrative tools
- forms and configuration panels

All suggestions, refactors, fixes, and implementations must respect the current architecture, UI consistency, existing flows, and production stability.

Prioritize:
- correctness
- minimal and safe changes
- consistency with the current codebase
- maintainability
- readability
- UI/UX coherence
- backward compatibility unless explicitly requested otherwise

---

## Technical Context
- This is the web panel of the platform
- It may use Vue / Nuxt / Vuetify or related frontend patterns already present in the repository
- Treat the existing stack as the source of truth
- Do not assume libraries, plugins, composables, stores, or UI frameworks unless they already exist in the codebase

Before implementing anything:
- inspect the project structure
- detect the actual frontend stack
- follow the current component, state, routing, and styling patterns

---

## Core Domain
This panel belongs to a therapy platform and may include concepts such as:
- therapists
- patients
- responsible adults or guardians if minors exist
- therapy processes
- appointments / sessions
- therapist schedules and availability
- notes, summaries, or internal observations if present
- administrative configuration
- patient-related documentation if present

Important:
- inspect the real domain and current UI flows before implementing changes
- do not invent statuses, fields, tabs, views, actions, or business rules
- do not assume a feature exists just because it would make sense conceptually

---

## General Rules
- First inspect the existing implementation before writing code.
- Do not invent routes, pages, components, stores, composables, API endpoints, fields, enums, statuses, permissions, or business rules.
- Reuse existing patterns, layouts, components, and conventions.
- Prefer small, isolated, low-risk changes over broad rewrites.
- Do not touch unrelated files.
- Do not redesign unrelated parts of the interface.
- Preserve existing user flows unless the task explicitly requires changing them.

---

## Scope Control
Unless explicitly requested, do not touch:
- backend/API code
- infrastructure
- deployment files
- CI/CD
- mobile code
- unrelated modules or pages

Work only in the web panel codebase and keep the change focused on the requested feature or fix.

If the task requires an API adjustment but the API is outside scope, do not invent it. Instead, clearly state the dependency.

---

## How to Approach Tasks
For any non-trivial task, follow this order:

1. Inspect the relevant pages, components, stores, composables, and API integration points.
2. Understand the current flow and visual structure.
3. Identify the minimum set of files that need changes.
4. Implement focused changes.
5. Verify side effects on navigation, forms, state, permissions, responsiveness, and API consumption.
6. Explain how to test the result manually.

Do not jump directly into coding without understanding the current structure.

---

## Architecture Expectations

### Pages and Routing
- Respect the current routing structure.
- Do not create new pages or routes unless explicitly requested.
- Keep route naming and navigation patterns consistent.
- Preserve guards, middleware, and auth-related flow if present.

### Components
- Reuse existing components whenever possible.
- Prefer extending existing UI components over creating near-duplicates.
- Keep components focused and readable.
- Avoid giant components with mixed responsibilities.
- Extract reusable pieces only when there is a clear benefit and the pattern already supports it.

### State Management
- Inspect the actual state management used in the project before changing anything.
- Reuse existing stores, composables, or local state patterns.
- Do not introduce a new global state pattern if one already exists.
- Avoid duplicating API state or business logic across components.

### API Integration
- Reuse the existing API client, service layer, composables, or fetch pattern.
- Do not invent endpoints.
- Do not hardcode mock responses as if they were real backend behavior.
- If an API contract is unclear, inspect existing usage patterns first.

### Forms
- Follow the form structure and validation approach already used in the project.
- Preserve current UX patterns for loading, errors, disabled states, and submission feedback.
- Do not change field names or payload shapes unless explicitly required.
- Be careful with sensitive data, especially patient and session-related forms.

### Tables, Lists, and Filters
- Follow existing table and filtering patterns.
- Keep sorting, pagination, search, and filters consistent with the rest of the panel.
- Avoid introducing a completely different UI pattern for similar data views.
- Preserve readability and efficiency for therapist-facing workflows.

### Modals and Drawers
- Reuse existing modal/dialog patterns.
- Keep open/close behavior, confirmations, destructive actions, and validation consistent.
- Avoid stacking complexity unless the current design already does so.

---

## UI / UX Rules
- Preserve visual consistency with the existing design system.
- Do not redesign the whole page when only a focused improvement is needed.
- Keep interfaces clean, clear, and professional.
- Favor calm, readable, production-ready layouts over flashy UI.
- Respect spacing, typography, and hierarchy already present in the app.
- Do not introduce excessive visual noise.
- Use consistent button styles, card styles, tab styles, form styles, and empty states.

When changing UI:
- prioritize usability
- preserve information clarity
- keep important actions easy to find
- avoid making workflows slower for therapists or admins

---

## Responsiveness
- Maintain responsive behavior if the current panel supports it.
- Do not break desktop workflows.
- If mobile/tablet support exists, preserve it.
- Test changes against typical panel layouts with forms, tables, and sidebars.

---

## Sensitive Data Handling
This panel may expose sensitive data related to patients, therapists, sessions, and internal notes.

Therefore:
- do not expose more information than necessary in cards, tables, forms, summaries, or detail views
- be careful with private notes, session summaries, and patient information
- respect visibility rules already present in the UI and backend flow
- do not assume all users can see all data

---

## Appointments, Agenda, and Scheduling
When working on agenda, appointments, or scheduling UI:
- inspect the current scheduling model first
- do not invent slot generation rules
- do not assume fixed session durations unless already defined
- preserve calendar/list consistency if both views exist
- maintain drag, move, edit, or reschedule behavior only if already supported
- do not break date navigation, filtering, or grouping behavior
- be careful with timezone-sensitive rendering if applicable

When implementing availability-related interfaces:
- respect the current backend contract
- do not hardcode scheduling assumptions
- avoid UI logic that conflicts with manual therapist adjustments

---

## Dashboard and Metrics
When working on dashboards:
- preserve clarity and quick readability
- avoid clutter
- use consistent cards, summaries, and chart containers if they already exist
- do not invent metrics that are not backed by the API or current business logic

---

## Coding Style
- Follow the style already present in the repository.
- Use clear names.
- Keep methods/functions focused.
- Avoid unnecessary comments.
- Add comments only when they clarify a non-obvious choice.
- Prefer explicit and maintainable code over clever abstractions.

If TypeScript is present:
- use proper typing in new code
- reuse existing types and interfaces before creating new ones
- `any` is acceptable for API response shapes that lack a strict contract, or when typing would require significant effort with no safety benefit; do not use it for component props, store state, or function signatures where the shape is known
- prefer `unknown` over `any` when the value truly needs narrowing before use

---

## When Creating New Code
Before creating something new, check whether the project already has:
- a reusable component
- a layout wrapper
- a form component
- a modal/dialog component
- a table/list component
- a composable
- a store
- a utility
- a validation helper
- a typed model or interface
- an API service function

Prefer reusing the current system over creating parallel structures.

---

## Refactoring Rules
If asked to refactor:
- preserve behavior
- preserve visual behavior unless explicitly asked to improve it
- keep the refactor incremental
- do not mix unrelated cleanup with the requested task
- avoid changing multiple patterns at once

---

## Bug Fixing Rules
When fixing a bug:
- identify the most likely root cause from the current implementation
- prefer the smallest safe fix
- avoid rewriting the full page/component unless truly necessary
- mention side effects and edge cases
- explain how to validate the fix manually

---

## Performance Rules
When performance matters:
- avoid unnecessary rerenders
- avoid duplicating API calls
- avoid unnecessary watchers/effects/computed chains
- reuse existing caching or fetch strategies if present
- avoid heavy logic inside rendering paths
- do not optimize prematurely without evidence

---

## Accessibility and Usability
- Preserve accessible labels, button meaning, focus behavior, and form clarity when possible
- Do not reduce readability for the sake of visual compactness
- Keep destructive actions clear and confirmable
- Ensure users can understand loading, success, and error states

---

## Testing Mindset
When finishing a non-trivial implementation, briefly indicate:
- what to verify manually (key interactions, edge cases)
- which other pages or flows could be affected

Only flag regressions when the change touches shared components, stores, middleware, or services. Do not produce exhaustive checklists for simple, isolated changes.

If the repository already has tests, follow the existing test style instead of inventing a new one.

---

## Communication Style
When answering inside the IDE:
- be concise
- be precise
- do not over-explain obvious code
- mention assumptions clearly
- mention uncertainty clearly
- if something is missing from the codebase, say so instead of inventing it

---

## Preferred Behavior for Complex Tasks
For medium or large tasks:
1. Summarize the current structure found in the code.
2. Propose the implementation plan.
3. Apply focused changes.
4. Explain validation steps, affected areas, and risks.

---

## Safety Rules
- Do not delete code unless it is clearly part of the requested change.
- Do not rename routes, components, stores, props, events, or files unless explicitly requested.
- Do not silently introduce breaking UI or behavior changes.
- Do not replace the current architecture with a different pattern just because it seems cleaner.
- Do not invent placeholder logic for important therapist or patient flows.
- Treat all changes as potentially production-impacting.

Always optimize for coherent, incremental, production-safe implementation.


## Stack-Specific Rules
- Use the existing Vue / Nuxt / Vuetify patterns already present in the project.
- Prefer Composition API if that is the current project standard.
- Reuse existing layouts, pages, composables, and stores.
- Use Vuetify components consistently if the project already relies on them.
- Do not mix multiple UI paradigms in the same feature.
- Keep forms, dialogs, cards, tabs, and tables visually aligned with the current panel.

---

## Design Tokens
The project has a strict design token system in `app/assets/styles/tokens.scss`.

- Always use SCSS token variables for colors, spacing, typography, border-radius, and shadows.
- Never hardcode hex colors, pixel values, or font sizes directly in component styles.
- Import tokens with `@use '~/assets/styles/tokens' as *` at the top of each scoped style block.
- Token categories: `$color-*`, `$space-*`, `$font-size-*`, `$font-weight-*`, `$radius-*`, `$shadow-*`.
- When a new color or spacing value is needed that is not in the token file, flag it rather than inventing a one-off value.

---

## API Response Structure
The backend wraps all responses in an envelope:
```json
{ "data": <payload>, "commons": [], "requestId": "..." }
```
The Axios interceptor in `app/services/api.ts` auto-unwraps this envelope, so service functions already receive the inner `data` directly.

- Do not manually unwrap `response.data.data` in service functions — the interceptor already does it.
- Some endpoints return nested objects, e.g. therapist profile returns `{ ..., person: { firstName, lastName, phone, ... } }`. Always flatten these before assigning to reactive state using the pattern: `raw?.person ? { ...raw, ...raw.person } : raw`.
- Do not assume flat structure from all endpoints — inspect the actual response shape first.

---

## Dates and Timezones
This panel involves time-sensitive data (appointments, sessions, schedules). Timezone handling is critical.

- Always send dates to the API as UTC ISO strings: use `new Date(value).toISOString()`.
- Never pass FullCalendar's `event.startStr` / `event.endStr` directly to the API — they include local timezone offsets (e.g. `T09:00:00+02:00`) which the backend may ignore, storing the wrong time.
- When converting a `datetime-local` input value to UTC for the API, use `new Date(datetimeLocal).toISOString()` — JavaScript parses datetime-local strings as local time, and `.toISOString()` converts to UTC.
- When displaying dates from the API (UTC), use `toLocaleString` or `toLocaleDateString` with the user's locale so the browser converts to local time automatically.
- Apply this rule consistently: form saves, drag-and-drop, resize, and any other calendar mutation.