import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Product } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ProductListItemProps {
  product: Product;
  onDelete: () => void;
}

export function ProductListItem({ product, onDelete }: ProductListItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleDelete = () => {
    Alert.alert('Usun produkt', `Czy na pewno chcesz usunac "${product.name}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: onDelete },
    ]);
  };

  const renderRightActions = () => (
    <Pressable style={styles.deleteAction} onPress={handleDelete}>
      <IconSymbol name="trash.fill" size={22} color="#fff" />
      <Text style={styles.deleteText}>Usun</Text>
    </Pressable>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={80}
      friction={2}
      overshootRight={false}
    >
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        onPress={handlePress}
      >
        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
          {product.aliases && product.aliases.length > 0 && (
            <Text style={[styles.aliases, { color: colors.textSecondary }]}>
              {product.aliases.join(', ')}
            </Text>
          )}
        </View>
        <View style={[styles.unitBadge, { backgroundColor: colors.tint + '20' }]}>
          <Text style={[styles.unit, { color: colors.tint }]}>{product.defaultUnit}</Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
  },
  aliases: {
    fontSize: 13,
    marginTop: 3,
  },
  unitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 6,
    marginRight: 16,
    borderRadius: 12,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
