# AGENTS.md
Guidance for coding agents working in this repository.
## Project Summary
Shopping List is an Expo + React Native app using Expo Router.
It manages products, recipes, recipe serving counts, and a generated shopping list.
- Platforms: iOS, Android, Web
- Language: TypeScript with `strict: true`
- State: React Context + reducer
- Persistence: AsyncStorage with `shopping-list:*` keys
- Primary UI language: Polish
- Backend: none
- External API: Anthropic is used only for photo-based recipe import
## Rules Sources
- Root guidance file: `AGENTS.md`
- Cursor rules: none found in `.cursor/rules/`
- `.cursorrules`: not present
- Copilot instructions: none found in `.github/copilot-instructions.md`
If any of those files are added later, merge their guidance into this file.
## Commands
### Install
```bash
npm install
```
### Development
```bash
npm start
npm run ios
npm run android
npm run web
```
### Lint
```bash
npm run lint
```
Lint uses Expo ESLint via `expo lint` with flat config in `eslint.config.js`.
### Type Checking
There is no dedicated npm script for type-checking.
Use:
```bash
npx tsc --noEmit
```
### Tests
There is currently no automated test setup in this repository.
- No `test` script in `package.json`
- No Jest/Vitest/Playwright/Cypress config found
- No `*.test.*`, `*.spec.*`, or `__tests__/` files found
Single-test command: not applicable right now because no test runner is installed.
If a test framework is added later, update this file with the full test command, single-test command, and watch command.
### Build Notes
There is no dedicated production build script in `package.json`.
Use the Expo workflows already present:
- `npm run ios` for local iOS native run/build flow
- `npm run android` for local Android native run/build flow
- `npm run web` for the web dev server
For most code changes, the best verification commands are:
```bash
npm run lint
npx tsc --noEmit
```
## Architecture
Key directories:
- `app/`: Expo Router screens and layouts
- `components/`: reusable UI and feature components
- `context/`: app state providers and reducer logic
- `hooks/`: domain hooks wrapping context access
- `constants/`: theme and unit conversion constants
- `services/`: persistence and business logic services
- `types/`: shared domain models
- `utils/`: helpers such as ID generation
Important files:
- `context/app-reducer.ts`: pure reducer and action types
- `context/app-context.tsx`: persisted app state provider
- `context/shopping-list-context.tsx`: shopping-list override state
- `services/storage.ts`: AsyncStorage read/write helpers
- `services/shopping-list-generator.ts`: list aggregation logic
- `services/claude-recipe-importer.ts`: photo import integration
- `types/index.ts`: shared domain types
## State And Data Model
- Main app state shape: `products`, `recipes`, `selections`, `isLoading`
- Domain models live in `types/index.ts`
- Reducer actions are discriminated unions
- Persistence is local-only via AsyncStorage
- Shopping-list override state is kept in a separate context
When changing data shapes, update all of these together:
- `types/index.ts`
- reducer actions and state
- storage serialization and deserialization
- consuming hooks and components
## Code Style
### TypeScript
- Respect strict mode and avoid `any`
- Add explicit return types for exported functions when practical
- Use `interface` for core object models already defined in `types/index.ts`
- Use `type` for unions and small composed shapes
- Reuse the shared `Unit` type from `@/types`
- Prefer narrow types over loose string values
### Naming
- Files: kebab-case for most files, Expo Router special names where required
- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE or existing project convention like `Colors`
- Action types: uppercase string literals such as `'ADD_PRODUCT'`
### Imports
Use this order consistently:
1. React / React Native
2. Third-party packages
3. Internal `@/` imports
4. Relative imports
Prefer the `@/` path alias over deep relative paths for project modules.
### Formatting
- Match existing file formatting
- Use semicolons
- Use single quotes
- Keep object literals and JSX props multi-line when long
- Prefer readable early returns over nested conditionals
- Keep comments minimal and only where logic is not obvious
- There is no Prettier config, so follow the surrounding file style closely
### React And React Native
- Use functional components and hooks
- Keep hooks at the top of the component
- Use `StyleSheet.create` for screen and component styles
- Keep business logic out of JSX where possible
- Use `useCallback` and `useMemo` when a file already follows that pattern or when they prevent real repeated work
### Theming And UI
- Derive colors from `useColorScheme()` and `Colors[colorScheme ?? 'light']`
- Do not introduce new hardcoded colors unless there is a strong reason
- Use Inter font families already loaded in `app/_layout.tsx`
- Use `IconSymbol` for icon usage
- Keep user-facing text in Polish unless the feature clearly requires otherwise
### Routing
- Preserve Expo Router file naming and modal patterns already used in `app/`
- New screens should follow the existing stack and tab conventions
## Error Handling
- Prefer early returns for validation failures
- Use optional chaining and nullish coalescing where appropriate
- Validate array and item existence before access
- In persistence helpers, fail safely and return sensible defaults
- Context hooks should throw clear errors when used outside their provider
Follow the existing storage pattern: catch errors, log useful context, and return safe fallback values when possible.
## Domain Conventions
- Product and recipe names shown to users are Polish
- Stored unit identifiers are ASCII: `g`, `kg`, `ml`, `l`, `szt`, `lyzka`, `lyzeczka`, `szklanka`
- Unit conversions live in `constants/units.ts`
- Product matching may use aliases; preserve that behavior when editing related logic
## Agent Working Guidelines
- Prefer minimal, local changes over broad refactors
- Read surrounding code before editing
- Preserve current architecture unless the task clearly requires structural change
- Do not add new state libraries or backend dependencies without a clear reason
- Keep reducer logic pure
- Keep persistence concerns in services or context, not random UI components
- Do not break the `@/` alias convention
## Verification Expectations
After non-trivial code changes, run:
```bash
npm run lint
npx tsc --noEmit
```
If you cannot run one of them, say so explicitly.
## Current Gaps
- No automated tests are configured yet
- No single-test command exists yet
- No dedicated production build script exists yet
Do not invent commands that are not present in the repo. If you add new tooling, update this file to document the exact commands.
