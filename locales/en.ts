import type pl from './pl';

/**
 * Widen `typeof pl` string literal values to `string` so English copy is valid, while
 * keeping the same key set and nested shapes as Polish.
 */
type EnglishMessages = {
  [K in keyof typeof pl]: (typeof pl)[K] extends string
    ? string
    : (typeof pl)[K] extends { one: string; few: string; many: string; other: string }
      ? { one: string; other: string } | { one: string; few: string; many: string; other: string }
      : (typeof pl)[K];
};

// TypeScript will flag missing keys if the shape diverges from the Polish source.
// Plural objects may have fewer forms (English only needs one/other).
const en: EnglishMessages = {
  // Tabs
  tabs_categories: 'Categories',
  tabs_products: 'Products',

  // Categories screen
  categories_header: 'Categories',
  categories_empty_title: 'No categories',
  categories_empty_subtitle: 'Add your first category to start organizing recipes',

  // Category card - plural forms (English: one/other)
  category_recipe_count: {
    one: '{{count}} recipe',
    other: '{{count}} recipes',
  },

  // Products screen
  products_header: 'Products',
  products_empty_title: 'No products',
  products_empty_subtitle: 'Add products to start creating recipes',

  // Category detail screen
  category_not_found: 'Category not found',
  category_search_placeholder: 'Search recipes...',
  category_recipes_empty_title: 'No recipes',
  category_recipes_empty_subtitle: 'Add the first recipe to this category',
  category_search_empty_title: 'No results',
  category_search_empty_subtitle: 'No recipes found for "{{query}}"',

  // Category manage screen
  category_edit_title: 'Edit category',
  category_new_title: 'New category',
  category_save: 'Save',
  category_name_label: 'Name',
  category_name_placeholder: 'e.g. Breakfasts',
  category_icon_label: 'Icon',
  category_name_required: 'Category name is required',
  category_delete_button: 'Delete category',
  category_delete_title: 'Delete category',
  category_delete_message: 'Are you sure you want to delete "{{name}}"? Recipes in this category will be moved to "Other".',
  cancel: 'Cancel',
  delete: 'Delete',

  // Shopping list screen
  shopping_list_title: 'Shopping',
  shopping_list_progress_label: 'Shopping progress',
  shopping_list_empty_title: 'List is empty',
  shopping_list_empty_subtitle: 'Select recipes on the main screen',
  shopping_list_group: 'Group',
  shopping_list_ungroup: 'Ungroup',
  shopping_list_copy_title: 'Copied',
  shopping_list_copy_message: 'Shopping list copied to clipboard',
  shopping_list_clear_title: 'Clear selection',
  shopping_list_clear_message: 'Are you sure you want to clear all selected recipes?',
  shopping_list_clear_confirm: 'Clear',
  backend_not_configured_title: 'Backend not configured',
  backend_not_configured_message:
    'Set EXPO_PUBLIC_BACKEND_URL in .env (e.g. http://localhost:3000 or your computer LAN IP) and run the server: cd backend && npm run dev. Keep the Anthropic API key only in backend/.env as ANTHROPIC_API_KEY.',
  shopping_list_group_error_title: 'Grouping error',
  shopping_list_add_title: 'Add product',
  shopping_list_name_label: 'NAME',
  shopping_list_name_placeholder: 'e.g. Sugar',
  shopping_list_qty_label: 'QUANTITY',
  shopping_list_unit_label: 'UNIT',
  shopping_list_add_button: 'Add to list',
  shopping_list_qty_error_title: 'Error',
  shopping_list_qty_error_message: 'Enter a valid quantity',
  shopping_list_duplicate_title: 'Already on list',
  shopping_list_duplicate_message: '"{{name}}" is already on the shopping list.',

  // Navigation back title
  back_to_categories: 'Categories',

  // Recipe screens
  recipe_not_found: 'Recipe not found',
  recipe_new_title: 'New recipe',
  recipe_edit_title: 'Edit recipe',
  recipe_screen_title: 'Recipe',
  recipe_save: 'Save',

  // Recipe import screen
  recipe_import_pick_title: 'Import from photo',
  recipe_import_review_title: 'Review recipe',
  recipe_import_analyze: 'Analyze photos',
  recipe_import_processing: 'Analyzing photos...',
  recipe_import_processing_sub: 'This may take a few seconds',
  recipe_import_not_recognized_title: 'Recipe not recognized',
  recipe_import_not_recognized_message: 'Failed to recognize recipe in the photo. Try a different photo.',
  recipe_import_error_title: 'Import error',

  // Photo picker component
  photo_camera: 'Camera',
  photo_library: 'Library',
  photo_hint: 'Add one or more recipe photos',
  photo_permission_camera_title: 'Camera access needed',
  photo_permission_camera_message:
    'Allow camera access to take a photo of your recipe. You can enable it in system settings.',
  photo_permission_library_title: 'Photo library access needed',
  photo_permission_library_message:
    'Allow photo library access to pick recipe images. You can enable it in system settings.',
  photo_permission_open_settings: 'Settings',

  // Recipe form component
  recipe_form_title_label: 'Title',
  recipe_form_title_placeholder: 'e.g. Chicken curry',
  recipe_form_description_label: 'Description (optional)',
  recipe_form_description_placeholder: 'Short recipe description...',
  recipe_form_ingredients_label: 'Ingredients',
  recipe_form_add_ingredient: 'Add',
  recipe_form_no_ingredients: 'No ingredients. Click "Add" to add an ingredient.',
  recipe_form_save: 'Save',
  recipe_form_delete_button: 'Delete recipe',
  recipe_form_delete_title: 'Delete recipe',
  recipe_form_delete_message: 'Are you sure you want to delete "{{title}}"?',
  recipe_form_title_required: 'Recipe title is required',
  recipe_form_ingredients_required: 'Add at least one ingredient from the products list',

  // Ingredient row component
  ingredient_product_placeholder: 'Product',
  ingredient_add_new: 'Add',

  // Recipe list item component
  recipe_ingredients_abbr: 'ing.',

  // Product screens
  product_not_found: 'Product not found',
  product_new_title: 'New product',
  product_edit_title: 'Edit product',
  product_screen_title: 'Product',

  // Product form component
  product_form_name_label: 'Name',
  product_form_name_placeholder: 'e.g. Carrot',
  product_form_aliases_label: 'Aliases (comma-separated)',
  product_form_aliases_placeholder: 'e.g. carrots, baby carrot',
  product_form_unit_label: 'Default unit',
  product_form_save: 'Save',
  product_form_delete_button: 'Delete product',
  product_form_delete_title: 'Delete product',
  product_form_delete_message: 'Are you sure you want to delete "{{name}}"?',
  product_form_name_required: 'Product name is required',
  product_form_exists_title: 'Product already exists',
  product_form_exists_message: 'A product named "{{name}}" already exists.',

  // Swipe-to-delete label
  swipe_delete: 'Delete',

  // Default category names
  default_category_breakfasts: 'Breakfasts',
  default_category_second_breakfasts: 'Mid-morning snacks',
  default_category_lunches: 'Lunches',
  default_category_snacks: 'Afternoon snacks',
  default_category_dinners: 'Dinners',
  default_category_other: 'Other',

  // Unit display names
  unit_lyzka: 'tbsp',

  // AI grouper section headers (must match what AI returns)
  ai_grouper_other: 'Other',
  ai_grouper_checked: 'Checked',

  // Categories edit mode
  categories_edit_button: 'Edit',
  categories_edit_done: 'Done',
  categories_delete_title: 'Delete category',
  categories_delete_message: 'Are you sure you want to delete "{{name}}"? Recipes in this category will be moved to "Other".',

  // Meal plan PDF import screen
  meal_plan_import_pick_title: 'Import meal plan',
  meal_plan_import_review_title: 'Review recipes',
  meal_plan_import_pick_hint: 'Import meal plan from PDF',
  meal_plan_import_pick_subtitle: 'Select a PDF file with your meal plan. AI will automatically extract all recipes and assign them to the correct categories.',
  meal_plan_import_pick_button: 'Select PDF file',
  meal_plan_import_processing: 'Analyzing meal plan...',
  meal_plan_import_processing_sub: 'This may take a few seconds',
  meal_plan_import_found: {
    one: 'Found {{count}} recipe',
    other: 'Found {{count}} recipes',
  },
  meal_plan_import_save_all: {
    one: 'Add {{count}} recipe',
    other: 'Add {{count}} recipes',
  },
  meal_plan_import_not_recognized_title: 'Plan not recognized',
  meal_plan_import_not_recognized_message: 'Failed to extract recipes from the PDF. Check if the file contains a meal plan.',
  meal_plan_import_button_label: 'Import PDF',

  // AI language instruction (injected into prompts)
  ai_language_name: 'English',
  ai_language_instruction: 'Use English for all text (title, description, ingredient names).',
  ai_grouper_instruction: 'Group these shopping list items into logical food categories in English. Use categories like: Vegetables, Fruits, Dairy, Meat & Fish, Bread, Condiments & Sauces, Drinks, Other. Only use a category if it has at least one item. Include every item in exactly one group. Call the group_shopping_items tool.\n\nItems:\n{{items}}',
  ai_grouper_category_description: 'Category name in English, e.g. Vegetables, Fruits, Dairy',

  // Auth
  auth_login_title: 'Log in',
  auth_register_title: 'Sign up',
  auth_email: 'Email',
  auth_password: 'Password',
  auth_display_name: 'Display name',
  auth_sign_in: 'Sign in',
  auth_sign_up: 'Create account',
  auth_no_account: "Don't have an account?",
  auth_has_account: 'Already have an account?',
  auth_go_register: 'Sign up',
  auth_go_login: 'Log in',
  auth_or: 'or',
  auth_google: 'Continue with Google',
  auth_apple: 'Continue with Apple',
  auth_facebook: 'Continue with Facebook',
  auth_continue_guest: 'Continue as guest',
  auth_loading: 'Loading…',
  auth_error_generic: 'Something went wrong. Please try again.',
  auth_error_title: 'Error',
  auth_validation_fields: 'Fill in all fields',
  auth_validation_password_short: 'Password must be at least 8 characters',
  auth_apple_unavailable: 'Sign in with Apple is not available on this device',
  auth_placeholder_email: 'email@example.com',
  auth_placeholder_name: 'John',
  auth_placeholder_password: 'min. 8 characters',
  auth_ai_requires_login: 'Sign in to your account to use AI features',
  auth_ai_requires_login_title: 'Sign in required',
  auth_sign_out: 'Sign out',
  auth_signed_in_as: 'Signed in',
  auth_guest: 'Guest (no AI)',
};

export default en;
