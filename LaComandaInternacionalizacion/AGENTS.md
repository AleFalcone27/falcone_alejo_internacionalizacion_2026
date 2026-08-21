# AGENTS.md

## Project overview

**El Bocado** is a Spanish-language restaurant-management mobile application. It is
built with Ionic 8 and Angular 19, packaged for Android with Capacitor, and uses
Supabase for authentication, data, and storage.

The application supports customer, supervisor, maitre, waiter, kitchen, and bar
workflows, including registration, table assignments, ordering, QR scanning,
surveys, and simple customer games.

## Stack

- TypeScript, Angular 19, and Ionic 8 (standalone components)
- Angular Router with lazy-loaded route components
- Supabase (`@supabase/supabase-js`) for backend services
- Capacitor 7 for Android/native integrations
- Jasmine and Karma for unit tests
- ESLint with Angular ESLint rules

## Common commands

Run commands from the repository root.

```bash
npm install
npm start          # Local development server
npm run build      # Production build
npm test           # Jasmine/Karma test suite
npm run lint       # ESLint
```

For Android work, build the web app first, then use the Capacitor CLI as needed
(for example, `npx cap sync android`). Do not edit generated files under
`android/` unless the change specifically requires a native Android adjustment.

## Repository layout

```text
src/
  app/
    page/          Feature pages, grouped by role or feature
    components/    Reusable UI components
    services/      Application and integration services
    environments/  Supabase configuration consumed by the app
    models.ts      Shared domain types and enums
    app.routes.ts  Application routes
  assets/          Web assets
  theme/           Ionic theme variables
assets/             Source images and QR assets used by the project
android/            Capacitor Android project
```

## Implementation conventions

- Keep pages in `src/app/page/` and use the existing `*.page.ts`,
  `*.page.html`, `*.page.scss`, and `*.page.spec.ts` naming pattern.
- Keep reusable UI in `src/app/components/` and application logic or external
  integrations in `src/app/services/`.
- Use standalone Angular components and Ionic standalone imports, matching the
  surrounding code.
- Put shared domain types in `src/app/models.ts` instead of duplicating types
  across pages and services.
- Add or update the matching `*.spec.ts` file when changing TypeScript logic.
- Add new navigable screens to `src/app/app.routes.ts`. Follow the existing
  lazy `loadComponent` routing style and preserve role-based URL grouping.
- Follow `.editorconfig`: 2-space indentation, UTF-8, final newline, and
  single quotes in TypeScript.
- Use `app-` kebab-case selectors for components and `app` camelCase selectors
  for directives; ESLint enforces these rules.

## Backend and configuration safety

- Supabase configuration currently lives in `src/app/environments/`. Treat
  environment values as deployment configuration: do not rotate, replace, or
  expose credentials without an explicit request.
- Reuse the existing Supabase client pattern in `AuthService` or a focused
  service. Keep database table names, role values, and status enums consistent
  with the existing models and queries.
- The app includes QR/camera functionality. Test related changes in a browser
  where possible and on Android when native behavior is affected.

## Before handing off changes

1. Run `npm run lint` for TypeScript/template changes.
2. Run the relevant unit tests (or `npm test` when practical).
3. Run `npm run build` for routing, template, dependency, or Capacitor-facing
   changes.
4. Keep changes focused; do not reformat unrelated files or alter generated
   Android files incidentally.
