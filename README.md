# Lista zakupów

Aplikacja mobilna (Expo SDK 57 + React Native) do zapisywania przepisów, planowania posiłków i tworzenia listy zakupów. Działa w całości offline, bez konta i bez serwera. Dane są zapisane lokalnie na urządzeniu.

## Funkcje

- **Przepisy i grupy** – przepisy ze składnikami, wyszukiwanie, grupowanie (np. śniadania, obiady), własne zdjęcie przepisu.
- **Plan** – kalendarz tygodniowy z posiłkami na każdy dzień. Liczbę posiłków w ciągu dnia (np. 3, 4 albo 5) i ich nazwy ustawisz w Ustawieniach.
- **Lista zakupów** – tworzona z zaznaczonych posiłków planu, ze zsumowanymi składnikami, pogrupowana według działów sklepu.
- **Ustawienia** – liczba posiłków, przykładowe przepisy (PL/EN), wyczyszczenie wszystkich danych, język, opis aplikacji.

## Import przepisów z planów żywieniowych (.doc)

Skrypt (macOS) zamienia plany dietetyka w plik JSON, który wczytasz w aplikacji przez Ustawienia → „Importuj przepisy z pliku":

```bash
node scripts/import-meal-plans.mjs --out ~/przepisy.json "plan I.doc" "plan II.doc"
```

Pliki są czytane w podanej kolejności, a przepis o tej samej nazwie nadpisuje wcześniejszy. Nazwy produktów i działy sklepu ujednolica słownik `scripts/meal-plan-products.json`; opcja `--raw-names` wypisuje nazwy, których w nim brakuje. Wynikowego pliku nie dodawaj do repo.

## Uruchomienie

```bash
npm install
npm start          # w terminalu: i (iOS) lub a (Android) – otwiera w Expo Go
```

Wymagany jest Expo Go zgodny z SDK 57. Wersję developerską (dev build) zbudujesz przez `npm run ios` / `npm run android`.

## Skrypty

```bash
npx tsc --noEmit   # typy
npm run lint       # lint
npx expo-doctor    # kontrola zależności
```

Architektura i konwencje: [CLAUDE.md](CLAUDE.md).
