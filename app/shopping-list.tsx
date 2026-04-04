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

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

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
            backgroundColor: colorScheme === 'dark' ? '#064E3B' : colors.tint,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 17,
            color: '#fff',
          },
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable
                style={styles.headerButton}
                onPress={handleCopy}
              >
                <IconSymbol name="doc.on.doc" size={19} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.headerButton}
                onPress={handleClear}
              >
                <IconSymbol name="trash" size={19} color="rgba(255,255,255,0.85)" />
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {totalCount > 0 && (
          <View style={[styles.progressContainer, { backgroundColor: colors.tint }]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Postep zakupow</Text>
              <Text style={styles.progressCount}>
                {checkedCount} / {totalCount}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
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
    gap: 6,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    color: 'rgba(255,255,255,0.8)',
  },
  progressCount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 32,
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
});
