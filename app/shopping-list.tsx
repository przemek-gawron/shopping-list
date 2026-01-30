import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useAppContext } from '@/context/app-context';
import { useSelections } from '@/hooks/use-selections';
import { generateShoppingList, formatShoppingListForClipboard } from '@/services/shopping-list-generator';
import { ShoppingListItem as ShoppingListItemComponent } from '@/components/shopping-list/shopping-list-item';
import { ShoppingListItem } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { recipes, products } = useAppContext();
  const { selections, clearSelections } = useSelections();

  const initialItems = useMemo(
    () => generateShoppingList(recipes, selections, products),
    [recipes, selections, products]
  );

  const [items, setItems] = useState<ShoppingListItem[]>(initialItems);

  const sortedItems = useMemo(() => {
    const unchecked = items.filter((i) => !i.checked);
    const checked = items.filter((i) => i.checked);
    return [...unchecked, ...checked];
  }, [items]);

  const toggleItem = (productId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, checked: !item.checked } : item
      )
    );
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
        onPress: clearSelections,
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Lista zakupow',
          headerStyle: {
            backgroundColor: colors.tint,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable style={styles.headerButton} onPress={handleCopy}>
                <IconSymbol name="doc.on.doc" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.headerButton} onPress={handleClear}>
                <IconSymbol name="trash" size={22} color="#fff" />
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {sortedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              Lista jest pusta. Wybierz przepisy na ekranie glownym.
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedItems}
            keyExtractor={(item) => item.productId}
            renderItem={({ item }) => (
              <ShoppingListItemComponent
                item={item}
                onToggle={() => toggleItem(item.productId)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
