export default {
  // Tabs
  tabs_categories: 'Kategorie',
  tabs_products: 'Produkty',

  // Categories screen
  categories_header: 'Kategorie',
  categories_empty_title: 'Brak kategorii',
  categories_empty_subtitle: 'Dodaj pierwszą kategorię, aby zacząć organizować przepisy',

  // Category card - plural forms (CLDR: one/few/many/other)
  category_recipe_count: {
    one: '{{count}} przepis',
    few: '{{count}} przepisy',
    many: '{{count}} przepisów',
    other: '{{count}} przepisów',
  },

  // Products screen
  products_header: 'Produkty',
  products_empty_title: 'Brak produktów',
  products_empty_subtitle: 'Dodaj produkty, aby móc tworzyć przepisy',

  // Category detail screen
  category_not_found: 'Nie znaleziono kategorii',
  category_search_placeholder: 'Szukaj przepisu...',
  category_recipes_empty_title: 'Brak przepisów',
  category_recipes_empty_subtitle: 'Dodaj pierwszy przepis do tej kategorii',
  category_search_empty_title: 'Brak wyników',
  category_search_empty_subtitle: 'Nie znaleziono przepisów dla „{{query}}"',

  // Category manage screen
  category_edit_title: 'Edytuj kategorię',
  category_new_title: 'Nowa kategoria',
  category_save: 'Zapisz',
  category_name_label: 'Nazwa',
  category_name_placeholder: 'np. Śniadania',
  category_icon_label: 'Ikona',
  category_name_required: 'Nazwa kategorii jest wymagana',
  category_delete_button: 'Usuń kategorię',
  category_delete_title: 'Usuń kategorię',
  category_delete_message: 'Czy na pewno chcesz usunąć "{{name}}"? Przepisy z tej kategorii zostaną przeniesione do "Inne".',
  cancel: 'Anuluj',
  delete: 'Usuń',

  // Shopping list screen
  shopping_list_title: 'Zakupy',
  shopping_list_progress_label: 'Postęp zakupów',
  shopping_list_empty_title: 'Lista jest pusta',
  shopping_list_empty_subtitle: 'Wybierz przepisy na ekranie głównym',
  shopping_list_group: 'Grupuj',
  shopping_list_ungroup: 'Rozgrupuj',
  shopping_list_copy_title: 'Skopiowano',
  shopping_list_copy_message: 'Lista zakupów została skopiowana do schowka',
  shopping_list_clear_title: 'Wyczyść selekcję',
  shopping_list_clear_message: 'Czy na pewno chcesz wyczyścić wszystkie wybrane przepisy?',
  shopping_list_clear_confirm: 'Wyczyść',
  shopping_list_api_key_title: 'Brak klucza API',
  shopping_list_api_key_message: 'Skonfiguruj klucz EXPO_PUBLIC_ANTHROPIC_API_KEY.',
  shopping_list_group_error_title: 'Błąd grupowania',
  shopping_list_add_title: 'Dodaj produkt',
  shopping_list_name_label: 'NAZWA',
  shopping_list_name_placeholder: 'np. Cukier',
  shopping_list_qty_label: 'ILOŚĆ',
  shopping_list_unit_label: 'JEDNOSTKA',
  shopping_list_add_button: 'Dodaj do listy',
  shopping_list_qty_error_title: 'Błąd',
  shopping_list_qty_error_message: 'Podaj poprawną ilość',
  shopping_list_duplicate_title: 'Produkt już na liście',
  shopping_list_duplicate_message: '"{{name}}" jest już na liście zakupów.',

  // Navigation back title
  back_to_categories: 'Kategorie',

  // Recipe screens
  recipe_not_found: 'Nie znaleziono przepisu',
  recipe_new_title: 'Nowy przepis',
  recipe_edit_title: 'Edytuj przepis',
  recipe_screen_title: 'Przepis',
  recipe_save: 'Zapisz',

  // Recipe import screen
  recipe_import_pick_title: 'Importuj ze zdjęcia',
  recipe_import_review_title: 'Sprawdź przepis',
  recipe_import_analyze: 'Analizuj zdjęcia',
  recipe_import_processing: 'Analizuję zdjęcia...',
  recipe_import_processing_sub: 'To może potrwać kilka sekund',
  recipe_import_api_key_title: 'Brak klucza API',
  recipe_import_api_key_message: 'Skonfiguruj klucz EXPO_PUBLIC_ANTHROPIC_API_KEY.',
  recipe_import_invalid_key_title: 'Nieprawidłowy klucz API',
  recipe_import_invalid_key_message: 'Sprawdź wartość EXPO_PUBLIC_ANTHROPIC_API_KEY.',
  recipe_import_not_recognized_title: 'Nie rozpoznano przepisu',
  recipe_import_not_recognized_message: 'Nie udało się rozpoznać przepisu na zdjęciu. Spróbuj z innym zdjęciem.',
  recipe_import_error_title: 'Błąd importu',

  // Photo picker component
  photo_camera: 'Aparat',
  photo_library: 'Biblioteka',
  photo_hint: 'Dodaj jedno lub więcej zdjęć przepisu',

  // Recipe form component
  recipe_form_title_label: 'Tytuł',
  recipe_form_title_placeholder: 'np. Kurczak curry',
  recipe_form_description_label: 'Opis (opcjonalny)',
  recipe_form_description_placeholder: 'Krótki opis przepisu...',
  recipe_form_ingredients_label: 'Składniki',
  recipe_form_add_ingredient: 'Dodaj',
  recipe_form_no_ingredients: 'Brak składników. Kliknij „Dodaj", aby dodać składnik.',
  recipe_form_save: 'Zapisz',
  recipe_form_delete_button: 'Usuń przepis',
  recipe_form_delete_title: 'Usuń przepis',
  recipe_form_delete_message: 'Czy na pewno chcesz usunąć "{{title}}"?',
  recipe_form_title_required: 'Tytuł przepisu jest wymagany',
  recipe_form_ingredients_required: 'Dodaj co najmniej jeden składnik z listy produktów',

  // Ingredient row component
  ingredient_product_placeholder: 'Produkt',
  ingredient_add_new: 'Dodaj',

  // Recipe list item component
  recipe_ingredients_abbr: 'skł.',

  // Product screens
  product_not_found: 'Nie znaleziono produktu',
  product_new_title: 'Nowy produkt',
  product_edit_title: 'Edytuj produkt',
  product_screen_title: 'Produkt',

  // Product form component
  product_form_name_label: 'Nazwa',
  product_form_name_placeholder: 'np. Marchewka',
  product_form_aliases_label: 'Aliasy (oddzielone przecinkami)',
  product_form_aliases_placeholder: 'np. marchew, karota',
  product_form_unit_label: 'Domyślna jednostka',
  product_form_save: 'Zapisz',
  product_form_delete_button: 'Usuń produkt',
  product_form_delete_title: 'Usuń produkt',
  product_form_delete_message: 'Czy na pewno chcesz usunąć "{{name}}"?',
  product_form_name_required: 'Nazwa produktu jest wymagana',
  product_form_exists_title: 'Produkt już istnieje',
  product_form_exists_message: 'Produkt o nazwie "{{name}}" już istnieje.',

  // Swipe-to-delete label
  swipe_delete: 'Usuń',

  // Default category names
  default_category_breakfasts: 'Śniadania',
  default_category_second_breakfasts: 'Drugie śniadania',
  default_category_lunches: 'Obiady',
  default_category_snacks: 'Podwieczorki',
  default_category_dinners: 'Kolacje',
  default_category_other: 'Inne',

  // Unit display names (only the text-based ones need translation)
  unit_lyzka: 'łyżka',

  // AI grouper section headers (must match what AI returns)
  ai_grouper_other: 'Inne',
  ai_grouper_checked: 'Kupione',

  // AI language instruction (injected into prompts)
  ai_language_name: 'Polish',
  ai_language_instruction: 'Use Polish for all text (title, description, ingredient names).',
  ai_grouper_instruction: 'Group these shopping list items into logical food categories in Polish. Use categories like: Warzywa, Owoce, Nabiał, Mięso i Ryby, Pieczywo, Przyprawy i Sosy, Napoje, Inne. Only use a category if it has at least one item. Include every item in exactly one group. Call the group_shopping_items tool.\n\nItems:\n{{items}}',
  ai_grouper_category_description: 'Nazwa kategorii po polsku, np. Warzywa, Owoce, Nabiał',
};
