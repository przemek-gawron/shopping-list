# Plan testów E2E – agent-device (iOS + Android)

Testy całej aplikacji Dishdeck na symulatorze iOS i emulatorze Androida, sterowane przez
[agent-device](https://github.com/callstackincubator/agent-device). Każdy znaleziony błąd jest
naprawiany od razu, a poprawka trafia **od razu na `main`** (commit + push), zanim zaczniesz
kolejny przypadek testowy.

Poza zakresem: testy jednostkowe, buildy EAS, aktualizacje OTA, publikacja w sklepach.

---

## 1. Zasady obowiązkowe

### 1.1 Cykl naprawy błędu: fix → commit → push

Dla **każdego** błędu, osobno:

1. **Zapisz znalezisko** w raporcie (`e2e/output/report.md`, patrz §7): ID przypadku, platforma,
   kroki (komendy agent-device), oczekiwane vs faktyczne, dowody (screenshot / wideo / logi).
2. **Napraw** w kodzie – minimalna zmiana, tylko ten błąd. Bez refaktorów „przy okazji”.
3. **Sprawdź statycznie:**
   ```bash
   npx tsc --noEmit && npm run lint
   ```
4. **Zweryfikuj na urządzeniu:** zmiana JS – `agent-device metro reload --session <ios|android>`
   (albo Fast Refresh), potem powtórz kroki z raportu. Jeśli błąd dotyczy obu platform albo
   wspólnego kodu – sprawdź na **obu**. Dodatkowo szybko przeklikaj sąsiednie przypadki tego modułu.
5. **Commit** – tylko pliki tej poprawki (`git add <pliki>`, nigdy `git add -A` z artefaktami):
   ```
   fix: <co naprawiono, krótko>

   <co było źle, dlaczego, jak naprawione>
   Found by e2e <ID> on <iOS|Android|iOS+Android>.
   ```
6. **Push od razu na main:**
   ```bash
   git pull --rebase origin main && git push origin main
   ```
   Konflikt przy rebase → rozwiąż, ponów krok 3, dopiero wtedy push. **Nigdy** `--force`.
   Bez gałęzi i PR-ów, bez zbierania kilku poprawek w jeden push.
7. **Uzupełnij raport:** status `FIXED` + SHA commita. Wróć do testów.

Jeden błąd = jeden commit = jeden push. Zmiany niezwiązane z błędem (np. dodanie fixtures,
`.gitignore`) idą osobnymi commitami `chore:`, dokumentacja – `docs:`; też od razu push.

### 1.2 Kiedy się zatrzymać i zapytać użytkownika

- Poprawka wymaga zmiany natywnej: nowa biblioteka, `app.json` (uprawnienia, pluginy), podbicie
  SDK. To wymaga nowej `version` i nowego buildu (README → „Buildy i aktualizacje”).
- Nie wiadomo, czy to błąd, czy zamierzone zachowanie – najpierw sprawdź „Conventions” w
  `CLAUDE.md` (np. lista zakupów to snapshot, ukryte posiłki zostają w planie, historia undo jest
  tylko w pamięci). Dalej niejasne → wpis w raporcie jako `QUESTION`, bez poprawki.
- Poprawka zmienia UX / zachowanie produktu, a nie tylko usuwa usterkę.
- Push się nie udaje z powodu innego niż prosty konflikt.

### 1.3 Pozostałe reguły

- Błędy znajdujemy z zachowania aplikacji na urządzeniu, nie z czytania kodu. Kod czytamy dopiero
  przy naprawie.
- Nowe teksty zawsze w `src/i18n/pl.ts` **i** `src/i18n/en.ts`; kolory tylko przez `useTheme()`;
  pakiety tylko przez `npx expo install`.
- Brakujący `accessibilityLabel` przy przycisku z samą ikoną to błąd dostępności – naprawiamy jak
  każdy inny (`fix:`). `testID` nie dodajemy „na zapas”.
- Nie commitujemy artefaktów testów (`e2e/output/`) ani prywatnych planów dietetyka (`.doc`).

---

## 2. Środowisko

| | iOS | Android |
|---|---|---|
| Urządzenie | symulator **iPhone 16e** (opcjonalnie iPad do testu układu) | emulator **Medium_Phone_API_36.1** (`emulator-5554`, Android 16) |
| Build | dev build (`npx expo run:ios`) | dev build (`npx expo run:android`) |
| Sesja agent-device | `--session ios` | `--session android` |

- Bundle id / package: `com.przemekgawron.dishdeck`, scheme `dishdeck://`.
- Dev build, nie Expo Go – `react-native-view-shot` i `expo-print` potrzebują natywnego kodu.
- Jeden Metro (port 8081) obsługuje obie platformy.

---

## 3. Faza 0 – przygotowanie (raz)

1. Czysty, aktualny `main`:
   ```bash
   git status
   git pull --rebase origin main
   npx tsc --noEmit && npm run lint
   ```
2. Dodaj `e2e/output/` do `.gitignore` → commit `chore: ignore e2e test output` → push.
3. Fixtures w `e2e/fixtures/` (commit `chore: add e2e fixtures` → push):
   - `recipes.json` – format `"format": "shopping-list-recipes"` (patrz `src/data/import.ts`):
     2 grupy, 3 przepisy, w tym jeden o tej samej nazwie co przepis przykładowy (test „updated”),
     jeden składnik spoza słownika (test działu „Inne”), `menus: ["Test menu"]`.
   - `recipes-2.json` – drugi poprawny plik (import wielu plików naraz).
   - `broken.json` – niepoprawny JSON; `wrong-format.json` – poprawny JSON bez pola `format`.
   - `photo.jpg` – dowolne zdjęcie do przepisu.
   - Plan `.doc` – poproś użytkownika o plik; trzymaj poza repo (np. `~/Downloads`).
4. Buildy i Metro:
   ```bash
   npx expo run:ios --device "iPhone 16e"
   ```
   ```bash
   npx expo run:android
   ```
5. Wgraj pliki na urządzenia:
   ```bash
   # Android: pliki do Download, zdjęcie do galerii
   adb push e2e/fixtures/. /sdcard/Download/
   adb push e2e/fixtures/photo.jpg /sdcard/Pictures/photo.jpg
   adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/Pictures/photo.jpg
   ```
   ```bash
   # iOS: zdjęcie do Zdjęć, pliki do Pliki → Na moim iPhonie
   xcrun simctl addmedia booted e2e/fixtures/photo.jpg
   DIR=$(xcrun simctl get_app_container booted com.apple.DocumentsApp groups | awk '/FileProvider.LocalStorage/{print $2}')
   mkdir -p "$DIR/File Provider Storage" && cp e2e/fixtures/*.json "$DIR/File Provider Storage/"
   ```
6. Katalogi na dowody: `mkdir -p e2e/output/{ios,android}/{screenshots,videos,logs}`.
7. Otwórz sesje:
   ```bash
   agent-device open com.przemekgawron.dishdeck --platform ios --session ios --metro-port 8081 --relaunch
   ```
   ```bash
   agent-device open com.przemekgawron.dishdeck --platform android --session android --metro-port 8081 --relaunch
   ```

---

## 4. Jak prowadzić sesje agent-device

- Każda komenda z `--session ios` albo `--session android`. Komendy w jednej sesji – szeregowo.
- Początek modułu: `open ... --relaunch` (świeży stan nawigacji). Stan danych ustawiamy w
  aplikacji: Ustawienia → „Wyczyść wszystko”, potem „Wczytaj przykładowe przepisy”, jeśli moduł
  ich potrzebuje.
- Pętla: `snapshot -i` → `press|fill <ref|selektor> --settle` → weryfikacja przez diff po
  `--settle`, `wait text "..."`, `find`, `is`, `get`. Sam screenshot nie jest weryfikacją.
- Cel poza ekranem: `scroll down --until <selektor>`, nie seria `scroll down`.
- Alerty systemowe i potwierdzenia: `alert get` / `alert accept` / `alert dismiss`.
- Klawiatura zasłania przycisk: `keyboard dismiss` albo przycisk „Gotowe” w aplikacji.
- LogBox / RedBox: `screenshot --overlay-refs` → zapisz jako znalezisko →
  `react-native dismiss-overlay` → `snapshot -i`.
- Logi: `logs clear --restart` na starcie modułu, `logs mark "<ID>"` przed każdym przypadkiem;
  po błędzie `logs path` i skopiuj fragment do `e2e/output/<platforma>/logs/`.
- Dowody: `screenshot e2e/output/<platforma>/screenshots/<ID>.png`; błędy interakcji dodatkowo
  `record start e2e/output/<platforma>/videos/<ID>.mp4` … `record stop`.
- Język: główny przebieg po **polsku** (Ustawienia → Język → Polski na starcie). Angielski
  sprawdza moduł I18N. Daty nie są stałe – przypadki z planem odnoszą się do „dziś” i bieżącego
  tygodnia.
- Koniec pracy: `agent-device close --session ios`, `agent-device close --session android`.

Każdy przypadek wykonujemy na iOS i na Androidzie, zanim przejdziemy do następnego. Wynik:
`PASS`, `FAIL` (→ cykl z §1.1), `BLOCKED` (z powodem) albo `N/A` (z powodem).

---

## 5. Kolejność faz

| Faza | Zakres | Uwagi |
|---|---|---|
| 0 | Przygotowanie (§3) | |
| 1 | Smoke – `SMK` | Blokery naprawiamy przed czymkolwiek innym |
| 2 | Główna ścieżka – `E2E` | Przepisy → plan → lista; najważniejsza wartość aplikacji |
| 3 | Moduły – `REC`, `GRP`, `PRD`, `PLN`, `LST`, `SET` | Szczegóły i przypadki brzegowe |
| 4 | Przekrojowe – `PER`, `I18N`, `SYS`, `A11Y` | Trwałość, języki, system, dostępność |
| 5 | Regresja | `SMK` + `E2E` ponownie na obu platformach po wszystkich poprawkach; opcjonalnie smoke na buildzie Release |
| 6 | (opcjonalnie) Skrypty `.ad` | Stabilne ścieżki zapisane do `e2e/flows/` |

Faza 5, build Release (bez LogBox, z minifikacją – inne zachowanie niż dev):
```bash
npx expo run:ios --configuration Release
```
```bash
npx expo run:android --variant release
```

Faza 6: nagraj ścieżkę z `open ... --relaunch --save-script=e2e/flows/<nazwa>.<platforma>.ad`,
zakończ selektorowym `wait` na ekranie docelowym i `session save-script`. Odtwarzanie:
`agent-device test e2e/flows/*.ios.ad --platform ios`. Commit `chore: add e2e flow <nazwa>` → push.

---

## 6. Katalog przypadków testowych

### SMK – smoke

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| SMK-01 | Zimny start (`open --relaunch`) | Splash, potem zakładka Przepisy; brak LogBox/RedBox; brak błędów w logach |
| SMK-02 | Przełączanie 4 zakładek (Przepisy, Plan, Lista, Ustawienia) | Każda się otwiera, tytuł zgodny, dolny pasek widoczny i nie zasłania treści |
| SMK-03 | Puste stany po „Wyczyść wszystko” | Przepisy: „Brak przepisów”, Lista: pusta lista z podpowiedzią, Plan: „Nic nie zaplanowano” |
| SMK-04 | Ekran „O aplikacji” | Wersja 2.1.0, wszystkie sekcje opisu |

### E2E – główna ścieżka

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| E2E-01 | Ustawienia → Wczytaj przykładowe przepisy → Dodaj | Alert „Dodano przepisy: N”; przepisy w grupach na zakładce Przepisy |
| E2E-02 | Dodaj 3 przepisy do planu na dziś (różne posiłki) | Widoczne w odpowiednich slotach dnia |
| E2E-03 | Plan → Wybierz posiłki → „Ten dzień” → Generuj listę (3) | Lista zakupów z sumowanymi składnikami, pogrupowana wg działów |
| E2E-04 | Odhacz 2 pozycje, „Usuń kupione” | Postęp rośnie przy odhaczaniu, kupione znikają |
| E2E-05 | Restart aplikacji (`open --relaunch`) | Przepisy, plan i lista bez zmian |

### REC – przepisy

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| REC-01 | Nowy przepis bez nazwy → Zapisz | Komunikat „Podaj nazwę przepisu”, nic nie zapisano |
| REC-02 | Nowy przepis z 3 składnikami: nowy produkt, ilość dziesiętna z przecinkiem (`0,5`), różne jednostki | Zapisany; ilości poprawne; nowy produkt pojawia się w Produktach |
| REC-03 | Edycja: nazwa, grupa, opis, usunięcie składnika | Zmiany widoczne na liście i w szczegółach |
| REC-04 | Ocena gwiazdkami: ustaw 4, zmień na 2, usuń | Ocena zapisuje się i znika; etykieta dostępności „Ocena: X z 5” |
| REC-05 | Zdjęcie z galerii (pierwsze użycie → zgoda na dostęp) | Zdjęcie widoczne w szczegółach i na liście; zostaje po restarcie |
| REC-06 | Usuń zdjęcie | Zdjęcie znika, brak pustej ramki/błędu |
| REC-07 | Aparat: odmowa dostępu (`settings permission deny camera`); iOS – symulator bez aparatu | „Brak zgody na użycie aparatu.” / łagodna obsługa, bez crasha |
| REC-08 | Szukaj: trafienie, brak wyników, polskie znaki, wyczyszczenie pola | Filtrowanie na żywo; „Nic nie znaleziono”; po wyczyszczeniu pełna lista |
| REC-09 | Chipy grup: Wszystkie / Bez grupy / konkretna grupa | Lista zgodna z filtrem, liczniki się zgadzają |
| REC-10 | Usuń przepis zaplanowany w planie → potwierdź | Znika z listy przepisów i z planu |
| REC-11 | Bardzo długa nazwa i składnik z długą uwagą w nawiasie | Tekst się zawija, nic nie wychodzi poza ekran, przyciski dostępne |
| REC-12 | Szczegóły → „Dodaj do planu” | Otwiera dodawanie do planu z wybranym przepisem |
| REC-13 | Przepis z zaimportowanego jadłospisu (`.doc`/JSON z `menus`) | W szczegółach „Z jadłospisu: …” |
| REC-14 | Anulowanie formularza z niezapisanymi zmianami (przycisk, gest, Android back) | Zachowanie spójne, dane nie zapisują się przypadkiem |

### GRP – grupy

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| GRP-01 | Dodaj grupę bez nazwy | „Podaj nazwę grupy” |
| GRP-02 | Dodaj grupę z ikoną, edytuj nazwę i ikonę | Zmiany widoczne w chipach na zakładce Przepisy |
| GRP-03 | Przesuń w górę / w dół (też pierwsza w górę, ostatnia w dół) | Kolejność się zmienia i jest taka sama na zakładce Przepisy; brzegi bez błędu |
| GRP-04 | Usuń grupę z przepisami | Przepisy trafiają do „Bez grupy”, nie znikają |

### PRD – produkty

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| PRD-01 | Dodaj produkt o istniejącej nazwie (też inna wielkość liter) | „Produkt o tej nazwie już istnieje” |
| PRD-02 | Zmień domyślną jednostkę i dział | Nowe pozycje list zakupów trafiają do nowego działu |
| PRD-03 | Usuń produkt użyty w przepisie | Znika ze składników przepisu, aplikacja działa dalej |
| PRD-04 | Pusta lista produktów (po „Wyczyść wszystko”) | Pusty stan z podpowiedzią |

### PLN – plan

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| PLN-01 | Poprzedni / następny tydzień / Dziś | Daty i zakres tygodnia poprawne; „Dziś” wraca do bieżącego dnia |
| PLN-02 | Dodaj posiłek: dzień, posiłek, przepis, porcje | Wpis w odpowiednim slocie z liczbą porcji |
| PLN-03 | Dodaj do zajętego slotu | Ostrzeżenie „Zastąpi: X”; po zapisie stary przepis zastąpiony (jeden przepis na slot) |
| PLN-04 | Zmień porcje wpisu, usuń wpis | Zmiana widoczna; usunięcie zostawia „Nic nie zaplanowano” |
| PLN-05 | Wyczyść dzień / cały tydzień → potwierdź; potem Cofnij | Wpisy znikają, przepisy zostają; cofnięcie przywraca |
| PLN-06 | Dodaj do planu bez przepisów | „Najpierw dodaj przepisy w zakładce Przepisy.” |
| PLN-07 | Losowanie: zakres dzień / tydzień / 7 dni, wybór posiłków, „Zastąp zaplanowane” wł./wył. | Alert „Wylosowano posiłków: N”; bez „zastąp” istniejące zostają; ten sam przepis nie w dwóch kolejnych dniach w tym samym posiłku |
| PLN-08 | Losowanie przy posiłku bez pasującej grupy | „Brak przepisów dla: …” |
| PLN-09 | Zamiennik składnika we wpisie planu → Przywróć | „zamiast: X”; lista zakupów liczy zamiennik; przepis bez zmian; przywrócenie cofa |
| PLN-10 | Udostępnij plan jako obraz (zakres dni, poprzedni/następny dzień) | Podgląd poprawny, arkusz udostępniania się otwiera (zamknij `back`/`alert dismiss`) |
| PLN-11 | Udostępnij jako PDF | Arkusz udostępniania z PDF, bez błędu „Nie udało się udostępnić” |
| PLN-12 | Udostępnij zakres bez posiłków | „Brak posiłków w wybranych dniach” |
| PLN-13 | Udostępnianie w trybie ciemnym | Podgląd i wynik zawsze w jasnych kolorach |
| PLN-14 | Ustawienia: zmniejsz liczbę posiłków, potem zwiększ z powrotem | Ukryte sloty znikają z planu i nie liczą się do listy; po zwiększeniu wpisy wracają |

### LST – lista zakupów

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| LST-01 | Wybór posiłków: Ten dzień / Ten tydzień / Od dziś / Odznacz | Licznik na przycisku „Generuj listę (N)” zgodny z zaznaczeniem |
| LST-02 | Generowanie przy istniejącej liście | Pytanie „Zastąpić listę zakupów?”; Anuluj zostawia starą, Zastąp tworzy nową |
| LST-03 | Sumowanie: dwa przepisy z mlekiem (ml + l), łyżki + ml, sztuki | Waga/objętość/łyżki się sumują (1 ml ≈ 1 g, łyżka 15 ml, łyżeczka 5 ml); sztuki osobno |
| LST-04 | Porcje: wpis z 2 porcjami | Ilości ×2 względem przepisu |
| LST-05 | Grupowanie wg działów | Sekcje w stałej kolejności działów, pozycje w dobrych sekcjach |
| LST-06 | Odhaczanie / odznaczanie, pasek postępu | Postęp zgodny z liczbą odhaczonych |
| LST-07 | Dodaj pozycję ręcznie; nieprawidłowa ilość (`abc`, `0`, pusta) | Dodaje się; dla złej ilości „Podaj poprawną ilość” |
| LST-08 | Edytuj pozycję | Zmiana nazwy/ilości/jednostki zapisana |
| LST-09 | Usuń kupione, Wyczyść listę (z potwierdzeniem) | Działają; Anuluj nic nie usuwa |
| LST-10 | Cofnij kilka razy po kolejnych zmianach | Każde cofnięcie przywraca poprzedni stan; bez historii przycisk cofania znika |
| LST-11 | Kopiuj listę | „Skopiowano listę do schowka.”; iOS: `clipboard read` zawiera pozycje; Android 16: `clipboard read` nieobsługiwane → wklej do pola tekstowego i sprawdź |
| LST-12 | Długa lista (cały tydzień przykładów) | Płynne przewijanie, ostatnia pozycja nad dolnym paskiem |

### SET – ustawienia

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| SET-01 | Liczba posiłków: stepper do minimum i maksimum | Nie schodzi poniżej min / ponad max; plan pokazuje tyle slotów |
| SET-02 | Nazwy posiłków: zmiana nazwy, kolejność, puste pole | Nowe nazwy i kolejność w planie; puste pole przywraca domyślną |
| SET-03 | „Grupuj przepisy według jadłospisu” wł./wył. | Lista przepisów w sekcjach jadłospisów / zwykła |
| SET-04 | Jadłospisy: zmiana nazwy, kolejność, usunięcie | Usunięcie zostawia przepisy; pusty stan „Brak jadłospisów” |
| SET-05 | Zamienniki: dodaj grupę i produkt, usuń, „Przywróć domyślne” | Zmiany zapisane; przywrócenie z potwierdzeniem |
| SET-06 | Import jednego `recipes.json` | „Dodano przepisy: X, zaktualizowano: Y”; info o produktach w „Inne” |
| SET-07 | Import tego samego pliku drugi raz | Tylko „zaktualizowano”, brak duplikatów |
| SET-08 | Import kilku plików naraz (2 poprawne + `broken.json`) | Jeden alert z „Wczytane pliki: 2 z 3” i nazwą złego pliku |
| SET-09 | Import tylko złych plików (`broken.json`, `wrong-format.json`) | „Nie udało się odczytać przepisów z tego pliku” |
| SET-10 | Import planu `.doc` | Powstaje jadłospis nazwany jak plik; przepisy mają „Z jadłospisu: …” |
| SET-11 | Anulowanie wyboru pliku | Brak alertu i zmian |
| SET-12 | Wczytaj przykłady drugi raz | „Przykładowe przepisy są już wczytane”, brak duplikatów |
| SET-13 | Wyczyść wszystko → Anuluj, potem → Wyczyść | Anuluj nic nie zmienia; Wyczyść usuwa wszystko, alert potwierdzenia |

### PER – trwałość danych

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| PER-01 | Pełne dane (przepisy, zdjęcie, plan z zamiennikami, lista, ustawienia) → `open --relaunch` | Wszystko bez zmian |
| PER-02 | Undo po restarcie | Historia cofania pusta (tylko w pamięci) – oczekiwane, nie błąd |
| PER-03 | Przerwanie w trakcie edycji formularza (relaunch) | Brak uszkodzonych danych, aplikacja startuje |

### I18N – języki

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| I18N-01 | Polski ↔ English ↔ System | Wszystkie zakładki i ekrany od razu w nowym języku; brak surowych kluczy (`plan_title` itp.) |
| I18N-02 | Przegląd każdego ekranu po angielsku | Brak polskich tekstów; teksty mieszczą się w przyciskach |
| I18N-03 | Wczytanie przykładów po angielsku | Przepisy po angielsku |
| I18N-04 | Nazwy posiłków i działów po zmianie języka | Domyślne nazwy tłumaczą się; nazwy zmienione ręcznie zostają |

### SYS – system i platforma

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| SYS-01 | Tryb ciemny (`settings appearance dark`) – wszystkie ekrany | Czytelny kontrast, brak białych plam / czarnego tekstu na ciemnym tle |
| SYS-02 | Duża czcionka (`settings text-size accessibility-large`, potem `open --relaunch`) | Teksty się zawijają, przyciski i pola dostępne |
| SYS-03 | Android – przycisk wstecz (`back`) na każdym ekranie stosu i modalu | Zamyka bieżący ekran; z zakładek zachowanie zgodne z Androidem; bez crasha |
| SYS-04 | Klawiatura w formularzach (przepis, produkt, lista) | Pole aktywne i przycisk Zapisz nie są zasłonięte, da się przewinąć |
| SYS-05 | Tryb samolotowy (`settings airplane on`) | Wszystko działa (aplikacja offline) |
| SYS-06 | Odmowa dostępu do zdjęć (`settings permission deny photos`) | Łagodny komunikat, bez crasha |
| SYS-07 | Tło i powrót (Home → ponowne `open`) | Stan ekranu i niezapisany formularz zachowane |
| SYS-08 | Deep link `dishdeck://about` | Otwiera ekran „O aplikacji” (lub wiadomo, czemu nie) |
| SYS-09 | (opcjonalnie) iPad | Układ nie jest rozciągnięty ani ucięty |

### A11Y – dostępność

| ID | Scenariusz | Oczekiwane |
|---|---|---|
| A11Y-01 | `snapshot -i` na każdym ekranie | Każdy przycisk z samą ikoną (+, cofnij, udostępnij, góra/dół, stepper, gwiazdki) ma sensowną etykietę |
| A11Y-02 | Przełączniki i chipy | Stan (zaznaczony / wyłączony) widoczny w snapshocie |

---

## 7. Raport

Plik `e2e/output/report.md` (nie trafia do repo). Na górze: data, commit startowy, urządzenia,
zakres. Potem tabela wyników:

| ID | iOS | Android | Znalezisko | Commit |
|---|---|---|---|---|
| REC-02 | PASS | FAIL | F-003 | `abc1234` |

Każde znalezisko:

```
### F-003 [high] [functional] Przecinek dziesiętny ucina ilość
- Przypadek: REC-02, platforma: Android
- Kroki: agent-device ... (pełne komendy)
- Oczekiwane / Faktyczne
- Dowody: e2e/output/android/screenshots/REC-02.png, videos/REC-02.mp4, logs/REC-02.txt
- Status: FIXED (abc1234) | OPEN | QUESTION
```

Ważność: **critical** – crash, utrata danych, zablokowana główna ścieżka; **high** – zepsuta
ważna funkcja; **medium** – utrudnienie z obejściem; **low** – kosmetyka.

---

## 8. Definition of Done

- Wszystkie przypadki wykonane na iOS i Androidzie (albo `N/A` / `BLOCKED` z powodem).
- Wszystkie **critical** i **high** naprawione; medium/low naprawione albo opisane w raporcie
  z powodem.
- Każda poprawka to osobny commit na `main`, już wypchnięty:
  ```bash
  git status --short
  git log origin/main..main --oneline
  ```
  Oba polecenia nic nie zwracają.
- Faza 5 (regresja `SMK` + `E2E` na obu platformach) przeszła po ostatniej poprawce.
- Sesje zamknięte (`agent-device close`).
- Podsumowanie dla użytkownika: liczby PASS/FAIL, lista commitów z poprawkami, otwarte pytania.
