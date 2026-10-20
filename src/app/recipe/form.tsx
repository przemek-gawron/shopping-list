import * as ImagePicker from 'expo-image-picker';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { KEYBOARD_DONE } from '@/components/keyboard-done';
import { RecipePhoto } from '@/components/recipe-photo';
import { Page, useScrollIntoView } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing } from '@/constants/theme';
import { UNITS, formatQuantity } from '@/constants/units';
import { recipeEmoji } from '@/data/labels';
import { useStore } from '@/data/store';
import type { Product, Unit } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { generateId } from '@/utils/id-generator';
import { savePhoto } from '@/utils/photos';

interface Row {
  key: string;
  name: string;
  quantity: string;
  unit: Unit;
}

const emptyRow = (): Row => ({ key: generateId(), name: '', quantity: '', unit: 'szt' });

export default function RecipeFormScreen() {
  const { id, groupId } = useLocalSearchParams<{ id?: string; groupId?: string }>();
  const t = useT();
  const locale = useLocale();
  const theme = useTheme();
  const recipes = useStore((s) => s.recipes);
  const groups = useStore((s) => s.groups);
  const products = useStore((s) => s.products);
  const addRecipe = useStore((s) => s.addRecipe);
  const updateRecipe = useStore((s) => s.updateRecipe);
  const addProduct = useStore((s) => s.addProduct);

  const editing = id ? recipes.find((r) => r.id === id) : undefined;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [group, setGroup] = useState<string | null>(editing ? editing.groupId : (groupId ?? null));
  // an already stored file name, or a freshly picked image that is copied to app storage on save
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>(() =>
    editing && editing.ingredients.length > 0
      ? editing.ingredients.map((ing) => ({
          key: ing.id,
          name: products.find((p) => p.id === ing.productId)?.name ?? '',
          quantity: formatQuantity(ing.quantity, locale),
          unit: ing.unit,
        }))
      : [emptyRow()],
  );
  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  // a row added with the button gets the keyboard right away; "next" on a name moves to its amount
  const [addedRow, setAddedRow] = useState<string | null>(null);
  const quantityInputs = useRef(new Map<string, TextInput>());

  const patchRow = (key: string, patch: Partial<Row>) =>
    setRows((current) => current.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const pick = async (source: 'library' | 'camera') => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    };
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return Alert.alert(t('photo_camera_denied'));
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets[0]) setPickedUri(result.assets[0].uri);
  };

  const suggestions = useMemo(() => {
    const row = rows.find((r) => r.key === focusedRow);
    const q = row?.name.trim().toLowerCase();
    if (!row || !q) return [];
    if (products.some((p) => p.name.toLowerCase() === q)) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [rows, focusedRow, products]);

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) return Alert.alert(t('recipe_title_required'));
    if (!rows.some((r) => r.name.trim())) return Alert.alert(t('recipe_ingredients_required'));

    // products created by earlier rows of this save, so the same new name is not added twice
    const created = new Map<string, string>();
    const ingredients = rows
      .filter((r) => r.name.trim())
      .map((r) => {
        const name = r.name.trim();
        const key = name.toLowerCase();
        const existing = products.find((p) => p.name.toLowerCase() === key);
        let productId = existing?.id ?? created.get(key);
        if (!productId) {
          productId = addProduct({ name, defaultUnit: r.unit, departmentId: 'other' });
          created.set(key, productId);
        }
        const quantity = parseFloat(r.quantity.replace(',', '.'));
        return {
          id: generateId(),
          productId,
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          unit: r.unit,
        };
      });

    const stored = pickedUri ? savePhoto(pickedUri) : photo;
    const data = {
      title: trimmed,
      description: description.trim() || undefined,
      groupId: group,
      photo: stored,
      ingredients,
    };
    if (editing) updateRecipe({ ...editing, ...data });
    else addRecipe(data);
    router.back();
  };

  const groupEmoji = recipeEmoji({ title }, groups.find((g) => g.id === group));

  return (
    <Page>
      <Stack.Screen
        options={{
          title: editing ? t('recipe_edit') : t('recipe_new'),
          // saving without scrolling down past a long ingredient list
          headerRight: () => (
            <ThemedText color="tint" accessibilityRole="button" style={styles.headerAction} onPress={save}>
              {t('save')}
            </ThemedText>
          ),
        }}
      />

      <View style={styles.photoBlock}>
        <RecipePhoto photo={photo} uri={pickedUri ?? undefined} emoji={groupEmoji} height={180} />
        <View style={styles.photoButtons}>
          <Chip label={t('photo_library')} onPress={() => void pick('library')} />
          <Chip label={t('photo_camera')} onPress={() => void pick('camera')} />
          {(photo || pickedUri) && (
            <Chip
              label={t('photo_remove')}
              onPress={() => {
                setPhoto(undefined);
                setPickedUri(null);
              }}
            />
          )}
        </View>
      </View>

      <Field label={t('recipe_title')} value={title} onChangeText={setTitle} placeholder={t('recipe_title_placeholder')} />

      <View style={styles.section}>
        <ThemedText type="label">{t('group')}</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={styles.chips}>
          <Chip label={t('no_group')} selected={group === null} onPress={() => setGroup(null)} />
          {groups.map((g) => (
            <Chip key={g.id} label={`${g.emoji} ${g.name}`} selected={group === g.id} onPress={() => setGroup(g.id)} />
          ))}
        </ScrollView>
      </View>

      <Field
        label={t('recipe_description')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('recipe_description_placeholder')}
        multiline
      />

      <View style={styles.section}>
        <ThemedText type="label">{t('ingredients')}</ThemedText>
        {rows.map((row) => (
          <View key={row.key} style={styles.ingredient}>
            <View style={styles.ingredientTop}>
              <TextInput
                value={row.name}
                onChangeText={(name) => patchRow(row.key, { name })}
                onFocus={() => setFocusedRow(row.key)}
                autoFocus={row.key === addedRow}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => quantityInputs.current.get(row.key)?.focus()}
                placeholder={t('ingredient_name')}
                placeholderTextColor={theme.icon}
                style={[styles.name, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              />
              <TextInput
                ref={(input) => {
                  if (input) quantityInputs.current.set(row.key, input);
                  else quantityInputs.current.delete(row.key);
                }}
                value={row.quantity}
                onChangeText={(quantity) => patchRow(row.key, { quantity })}
                keyboardType="decimal-pad"
                inputAccessoryViewID={KEYBOARD_DONE}
                placeholder="1"
                placeholderTextColor={theme.icon}
                style={[styles.quantity, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              />
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('delete')}
                onPress={() => setRows((current) => (current.length > 1 ? current.filter((r) => r.key !== row.key) : [emptyRow()]))}>
                <IconSymbol name="xmark" size={18} color={theme.icon} />
              </Pressable>
            </View>
            {focusedRow === row.key && suggestions.length > 0 && (
              <Suggestions
                products={suggestions}
                onPick={(p) => {
                  patchRow(row.key, { name: p.name, unit: p.defaultUnit });
                  setFocusedRow(null);
                }}
              />
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.chips}>
              {UNITS.map((u) => (
                <Chip key={u} label={t(`unit_${u}`)} selected={row.unit === u} onPress={() => patchRow(row.key, { unit: u })} />
              ))}
            </ScrollView>
          </View>
        ))}
        <Button
          label={t('ingredient_add')}
          variant="secondary"
          onPress={() => {
            const row = emptyRow();
            setAddedRow(row.key);
            setRows((current) => [...current, row]);
          }}
        />
      </View>

      <Button label={t('save')} onPress={save} />
    </Page>
  );
}

/** Products matching an ingredient name; they appear under the field, so they are scrolled above the keyboard. */
function Suggestions({ products, onPick }: { products: Product[]; onPick: (product: Product) => void }) {
  const ref = useRef<View>(null);
  const scrollIntoView = useScrollIntoView();

  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollIntoView(ref));
    return () => cancelAnimationFrame(frame);
  }, [scrollIntoView]);

  return (
    <View ref={ref} style={styles.chips}>
      {products.map((p) => (
        <Chip key={p.id} label={p.name} onPress={() => onPick(p)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headerAction: { fontWeight: '700', fontSize: 16, paddingHorizontal: 6 },
  photoBlock: { gap: Spacing.two },
  photoButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  section: { gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  ingredient: { gap: Spacing.two },
  ingredientTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  name: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 12, fontSize: 16 },
  quantity: { width: 70, minHeight: 44, borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 10, fontSize: 16, textAlign: 'center' },
});
