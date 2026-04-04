# Lista zakupów

Aplikacja mobilna (Expo + React Native) do zarządzania przepisami i produktami, wybierania liczby porcji oraz generowania **zbiorczej listy zakupów** z przeliczonymi składnikami. Interfejs jest w języku polskim; dane trzymane są lokalnie na urządzeniu (bez serwera).

## Funkcje

- **Przepisy** — dodawanie i edycja przepisów ze składnikami (ilość + jednostka).
- **Produkty** — baza produktów powiązana z listą zakupów.
- **Porcje** — dla każdego przepisu możesz ustawić liczbę porcji; lista zakupów sumuje składniki ze wszystkich wybranych przepisów.
- **Lista zakupów** — agregacja składników z przeliczeniem jednostek (np. g/kg, ml/l) i sortowanie alfabetycznie (locale polski).

## Stack techniczny

- [Expo](https://expo.dev) (SDK 54) z [Expo Router](https://docs.expo.dev/router/introduction/) (nawigacja oparta o pliki w `app/`)
- React 19, React Native, TypeScript
- Stan aplikacji: **React Context + reducer** (`context/`), persystencja przez **AsyncStorage** (`services/storage.ts`)
- Logika listy zakupów: `services/shopping-list-generator.ts`; jednostki i konwersje: `constants/units.ts`

## Uruchomienie

```bash
npm install
npm start
```

Następnie wybierz platformę w terminalu lub użyj:

| Skrypt | Działanie |
|--------|-----------|
| `npm run ios` | Symulator iOS |
| `npm run android` | Emulator Android |
| `npm run web` | Przeglądarka |

```bash
npm run lint
```

Uruchamia linter ESLint (Expo).

## Struktura repozytorium (skrót)

- `app/` — ekrany i trasy (zakładki Przepisy / Produkty, modale edycji, ekran listy zakupów)
- `components/` — komponenty UI i domenowe (przepisy, produkty, lista zakupów)
- `context/` — provider i reducer stanu globalnego
- `hooks/` — hooki domenowe (`use-products`, `use-recipes`, `use-selections`)
- `services/` — generator listy, zapis do pamięci lokalnej
- `constants/` — motyw, jednostki miary

Szczegóły poleceń i konwencji UI znajdziesz w pliku `CLAUDE.md` w repozytorium.
