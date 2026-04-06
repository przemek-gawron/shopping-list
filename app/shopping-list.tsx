import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  SectionList,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useAppContext } from '@/context/app-context';
import { useSelections } from '@/hooks/use-selections';
import { useProducts } from '@/hooks/use-products';
import { useShoppingListContext } from '@/context/shopping-list-context';
import { generateShoppingList, formatShoppingListForClipboard } from '@/services/shopping-list-generator';
import { groupShoppingItems, applyGroupsToItems } from '@/services/shopping-list-grouper';
import { ShoppingListItem as ShoppingListItemComponent } from '@/components/shopping-list/shopping-list-item';
import { ShoppingListItem, Unit } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { UNIT_OPTIONS } from '@/constants/units';
import { generateId } from '@/utils/id-generator';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { recipes, products } = useAppContext();
  const { selections, clearSelections } = useSelections();
  const { products: allProducts } = useProducts();
  const {
    manualItems, deletedIds, quantityOverrides, checkedIds,
    addManualItem, deleteItem, updateItem, toggleItem, resetAll,
  } = useShoppingListContext();

  const generatedItems = useMemo(
    () => generateShoppingList(recipes, selections, products),
    [recipes, selections, products]
  );

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newUnit, setNewUnit] = useState<Unit>('szt');
  const [pendingCheckedIds, setPendingCheckedIds] = useState<string[]>([]);
  const toggleTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [isGrouped, setIsGrouped] = useState(false);
  const [isGrouping, setIsGrouping] = useState(false);
  const [groupSections, setGroupSections] = useState<{ name: string; emoji: string; data: ShoppingListItem[] }[]>([]);

  const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

  const items = useMemo<ShoppingListItem[]>(() => {
    const apply = (item: ShoppingListItem): ShoppingListItem => ({
      ...item,
      quantity: quantityOverrides[item.productId]?.quantity ?? item.quantity,
      unit: quantityOverrides[item.productId]?.unit ?? item.unit,
      checked: checkedIds.includes(item.productId),
    });

    const generated = generatedItems
      .filter((i) => !deletedIds.includes(i.productId))
      .map(apply);

    const manual = manualItems
      .filter((i) => !deletedIds.includes(i.productId))
      .map(apply);

    return [...generated, ...manual];
  }, [generatedItems, manualItems, deletedIds, quantityOverrides, checkedIds]);

  const sortedItems = useMemo(() => {
    const unchecked = items.filter((i) => !i.checked);
    const checked = items.filter((i) => i.checked);
    return [...unchecked, ...checked];
  }, [items]);

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  const openAddModal = () => {
    setNewName('');
    setNewQty('1');
    setNewUnit('szt');
    setAddModalVisible(true);
  };

  const handleAddItem = () => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    const qty = parseFloat(newQty);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Blad', 'Podaj poprawna ilosc');
      return;
    }

    const existing = items.find(
      (i) => i.productName.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      Alert.alert('Produkt juz na liscie', `"${existing.productName}" jest juz na liscie zakupow.`);
      return;
    }

    const matchedProduct = allProducts.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    addManualItem({
      productId: matchedProduct?.id ?? generateId(),
      productName: matchedProduct?.name ?? trimmedName,
      quantity: qty,
      unit: newUnit,
      checked: false,
    });
    setAddModalVisible(false);
  };

  const handleCopy = async () => {
    const text = formatShoppingListForClipboard(sortedItems);
    await Clipboard.setStringAsync(text);
    Alert.alert('Skopiowano', 'Lista zakupow zostala skopiowana do schowka');
  };

  const handleClear = () => {
    Alert.alert('Wyczysc selekcje', 'Czy na pewno chcesz wyczysc wszystkie wybrane przepisy?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyczysc',
        style: 'destructive',
        onPress: () => {
          clearSelections();
          resetAll();
        },
      },
    ]);
  };

  const productItems = allProducts.map((p) => ({ id: p.id, label: p.name }));

  // Reset grouping if the item list changes while grouped
  useEffect(() => {
    if (isGrouped) {
      setIsGrouped(false);
      setGroupSections([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const handleGroup = useCallback(async () => {
    if (isGrouped) {
      setIsGrouped(false);
      setGroupSections([]);
      return;
    }

    if (!API_KEY) {
      Alert.alert('Brak klucza API', 'Skonfiguruj klucz EXPO_PUBLIC_ANTHROPIC_API_KEY.');
      return;
    }

    if (items.length === 0) return;

    setIsGrouping(true);
    try {
      const productNames = items.map((i) => i.productName);
      const groups = await groupShoppingItems(productNames, API_KEY);
      const sections = applyGroupsToItems(groups, items);
      setGroupSections(sections);
      setIsGrouped(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Blad grupowania', msg);
    } finally {
      setIsGrouping(false);
    }
  }, [isGrouped, items, API_KEY]);

  useEffect(() => {
    const timeouts = toggleTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  const handleToggleWithAnimation = useCallback(
    (item: ShoppingListItem) => {
      if (item.checked) {
        toggleItem(item.productId);
        return;
      }

      if (pendingCheckedIds.includes(item.productId)) {
        return;
      }

      setPendingCheckedIds((prev) => [...prev, item.productId]);
      toggleTimeoutsRef.current[item.productId] = setTimeout(() => {
        toggleItem(item.productId);
        setPendingCheckedIds((prev) => prev.filter((id) => id !== item.productId));
        delete toggleTimeoutsRef.current[item.productId];
      }, 360);
    },
    [pendingCheckedIds, toggleItem]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Lista zakupow',
          headerStyle: {
            backgroundColor:
              colorScheme === 'dark' ? colors.headerBackgroundDark : colors.headerChrome,
          },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 17,
            color: colors.onPrimary,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable
                style={[
                  styles.headerButton,
                  { backgroundColor: isGrouped ? colors.tint : colors.overlayOnPrimarySubtle },
                ]}
                onPress={handleGroup}
                disabled={isGrouping || items.length === 0}
              >
                {isGrouping ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <IconSymbol
                    name={isGrouped ? 'tag.fill' : 'tag'}
                    size={19}
                    color={colors.onPrimary}
                  />
                )}
              </Pressable>
              <Pressable
                style={[styles.headerButton, { backgroundColor: colors.overlayOnPrimarySubtle }]}
                onPress={handleCopy}
              >
                <IconSymbol name="doc.on.doc" size={19} color={colors.onPrimary} />
              </Pressable>
              <Pressable
                style={[styles.headerButton, { backgroundColor: colors.overlayOnPrimarySubtle }]}
                onPress={handleClear}
              >
                <IconSymbol name="trash" size={19} color={colors.onPrimaryMuted} />
              </Pressable>
            </View>
          ),
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AmbientBackground variant="shopping" listHasItems={totalCount > 0} />
        {totalCount > 0 && (
          <View style={[styles.progressContainer, { backgroundColor: colors.headerChrome, shadowColor: colors.shadowColor }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.onPrimaryMuted }]}>Postep zakupow</Text>
              <Text style={[styles.progressCount, { color: colors.onPrimary }]}>{checkedCount} / {totalCount}</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.overlayOnPrimarySubtle }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.onPrimary }]} />
            </View>
          </View>
        )}

        {sortedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Lista jest pusta</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Wybierz przepisy na ekranie glownym
            </Text>
          </View>
        ) : isGrouped ? (
          <SectionList
            sections={groupSections}
            keyExtractor={(item) => item.productId}
            renderItem={({ item }) => (
              <ShoppingListItemComponent
                item={item}
                isCompleting={pendingCheckedIds.includes(item.productId)}
                onToggle={() => handleToggleWithAnimation(item)}
                onDelete={() => deleteItem(item.productId)}
                onUpdate={(qty, unit) => updateItem(item.productId, qty, unit)}
              />
            )}
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <Text style={[styles.sectionTitle, { color: colors.tint }]}>{section.name}</Text>
                <View style={[styles.sectionLine, { backgroundColor: colors.borderSubtle }]} />
              </View>
            )}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
          />
        ) : (
          <FlatList
            data={sortedItems}
            keyExtractor={(item) => item.productId}
            renderItem={({ item }) => (
              <ShoppingListItemComponent
                item={item}
                isCompleting={pendingCheckedIds.includes(item.productId)}
                onToggle={() => handleToggleWithAnimation(item)}
                onDelete={() => deleteItem(item.productId)}
                onUpdate={(qty, unit) => updateItem(item.productId, qty, unit)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Add item button */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: colors.tint,
              shadowColor: colors.shadowColor,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={openAddModal}
        >
          <IconSymbol name="plus" size={22} color={colors.onPrimary} />
        </Pressable>
      </View>

      {/* Add item modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          onPress={() => setAddModalVisible(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKAV}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <Text style={[styles.modalTitle, { color: colors.text }]}>Dodaj produkt</Text>

            <View style={[styles.modalField, { zIndex: 20 }]}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>NAZWA</Text>
              <AutocompleteInput
                value={newName}
                onChangeText={setNewName}
                onSelect={(item) => {
                  setNewName(item.label);
                  const product = allProducts.find((p) => p.id === item.id);
                  if (product) setNewUnit(product.defaultUnit);
                }}
                items={productItems}
                placeholder="np. Cukier"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>ILOSC</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                ]}
                value={newQty}
                onChangeText={setNewQty}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>JEDNOSTKA</Text>
              <View style={styles.unitWrap}>
                {UNIT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.unitPill,
                      {
                        backgroundColor: newUnit === opt.value ? colors.tint : colors.background,
                        borderColor: colors.tint,
                      },
                    ]}
                    onPress={() => setNewUnit(opt.value)}
                  >
                    <Text
                      style={[
                        styles.unitPillText,
                        { color: newUnit === opt.value ? colors.onPrimary : colors.tint },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.modalSave,
                { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleAddItem}
            >
              <Text style={[styles.modalSaveText, { color: colors.onPrimary }]}>Dodaj do listy</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  progressCount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  // Modal
  modalOverlay: {
    flex: 1,
  },
  modalKAV: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  modalField: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  unitWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  unitPillText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  modalSave: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalSaveText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    marginLeft: 4,
  },
});
