import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Product, Unit } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { UNIT_OPTIONS, getUnitLabel } from '@/constants/units';
import { generateId } from '@/utils/id-generator';
import { useProducts } from '@/hooks/use-products';
import { t } from '@/i18n';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export function ProductForm({ product, onSave, onDelete, style }: ProductFormProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { findProductByName } = useProducts();

  const [name, setName] = useState(product?.name ?? '');
  const [aliases, setAliases] = useState(product?.aliases?.join(', ') ?? '');
  const [defaultUnit, setDefaultUnit] = useState<Unit>(product?.defaultUnit ?? 'szt');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(t('shopping_list_qty_error_title'), t('product_form_name_required'));
      return;
    }

    const existing = findProductByName(trimmedName);
    if (existing && existing.id !== product?.id) {
      Alert.alert(t('product_form_exists_title'), t('product_form_exists_message', { name: existing.name }));
      return;
    }

    const aliasArray = aliases
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    onSave({
      id: product?.id ?? generateId(),
      name: trimmedName,
      aliases: aliasArray.length > 0 ? aliasArray : undefined,
      defaultUnit,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(t('product_form_delete_title'), t('product_form_delete_message', { name }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          onDelete?.();
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }, style]}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>{t('product_form_name_label')}</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.surfaceElevated }]}
          value={name}
          onChangeText={setName}
          placeholder={t('product_form_name_placeholder')}
          placeholderTextColor={colors.textSecondary}
          autoFocus={!product}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>{t('product_form_aliases_label')}</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.surfaceElevated }]}
          value={aliases}
          onChangeText={setAliases}
          placeholder={t('product_form_aliases_placeholder')}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>{t('product_form_unit_label')}</Text>
        <View style={styles.unitContainer}>
          {UNIT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.unitButton,
                {
                  backgroundColor:
                    defaultUnit === option.value ? colors.tint : colors.surfacePrimary,
                  borderColor: colors.tint,
                },
              ]}
              onPress={() => setDefaultUnit(option.value)}
            >
              <Text
                style={[
                  styles.unitText,
                  { color: defaultUnit === option.value ? colors.onPrimary : colors.tint },
                ]}
              >
                {getUnitLabel(option.value)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: colors.tint }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>{t('product_form_save')}</Text>
      </Pressable>

      {onDelete && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={[styles.deleteButtonText, { color: colors.destructive }]}>{t('product_form_delete_button')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  unitText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  deleteButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
