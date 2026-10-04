# AGENTS.md

Guidance for coding agents. See [CLAUDE.md](CLAUDE.md) for the architecture and conventions.

This is an Expo/React Native app: prioritise mobile-first patterns and cross-platform behaviour (iOS and Android).

## Expo changes between SDKs

Before writing code that touches an Expo or React Native API, read the major version of `expo` in `package.json` and check the matching docs at `https://docs.expo.dev/versions/v<major>.0.0/`. Do not rely on memory.

## Rules

- Install packages with `npx expo install <package>`.
- Run `npx tsc --noEmit` and `npm run lint` before declaring a task done.
- Small commits: commit every finished change once typecheck and lint pass, one logical change per commit (Conventional Commits with a short why in the body).
- `ios/` and `android/` are generated (CNG); configure native behaviour in `app.json` instead of editing them.
- Expo Go only bundles some native modules; a library with custom native code needs a development build (`npx expo run:ios|android`).
- No backend, accounts or AI: keep the app offline-only unless asked otherwise.
- The UI is bilingual (Polish, English); add strings to both `src/i18n/pl.ts` and `src/i18n/en.ts`.
