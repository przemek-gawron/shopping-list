# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser

# Lint
npm run lint
```

There are no automated tests in this project.

## Architecture

This is an **Expo + React Native** app (using Expo Router for file-based navigation) that lets users manage recipes and products, select how many servings of each recipe they want, then generate a consolidated shopping list.

### State Management

All app state lives in a single **React context + reducer** pattern:

- `context/app-reducer.ts` — pure reducer with typed actions for products, recipes, and recipe selections
- `context/app-context.tsx` — `AppProvider` wraps the app, persists state to AsyncStorage on every change, and exposes domain callbacks via `useAppContext()`

The state shape:
```ts
{ products: Product[], recipes: Recipe[], selections: RecipeSelection[], isLoading: boolean }
```

Persistence is handled directly in `AppProvider` via `useEffect` hooks calling `services/storage.ts` (AsyncStorage under `shopping-list:*` keys). There is no external database or API.

### Domain Logic

- `services/shopping-list-generator.ts` — takes the current recipes, selections, and products and aggregates ingredients across all selected recipes (with unit conversion via `constants/units.ts`), producing a `ShoppingListItem[]` sorted alphabetically by Polish locale.
- `constants/units.ts` — defines unit definitions and conversion functions (`convertToBase`, `convertFromBase`, `formatQuantity`). The supported units are: `g`, `kg`, `ml`, `l`, `szt`, `lyzka`, `lyzeczka`, `szklanka`.

### Navigation (Expo Router)

```
app/
  _layout.tsx           # Root: GestureHandlerRootView > AppProvider > Stack
  (tabs)/
    _layout.tsx         # Bottom tabs: Przepisy (index) | Produkty (products)
    index.tsx           # Recipes list with search + per-recipe servings counter
    products.tsx        # Products list
  recipe/[id].tsx       # Edit recipe (modal)
  recipe/new.tsx        # Add recipe (modal)
  product/[id].tsx      # Edit product (modal)
  product/new.tsx       # Add product (modal)
  shopping-list.tsx     # Generated shopping list (reached via FAB on recipes tab)
```

### UI Conventions

- Colors come from `constants/theme.ts` (`Colors.light` / `Colors.dark`) — always use `useColorScheme()` + `Colors[colorScheme ?? 'light']` for theming, never hardcode colors.
- Font: Inter (loaded via `@expo-google-fonts/inter`) — use `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, or `Inter_700Bold` in `fontFamily`.
- Platform-specific icon components: `components/ui/icon-symbol.ios.tsx` (SF Symbols) and `components/ui/icon-symbol.tsx` (fallback).
- The app UI is in Polish.

### Custom Hooks

Domain-specific hooks in `hooks/` wrap `useAppContext()` to expose only relevant state/actions:
- `use-products.ts` — products CRUD
- `use-recipes.ts` — recipes CRUD
- `use-selections.ts` — recipe selection counts + derived `totalSelections`/`hasSelections`
