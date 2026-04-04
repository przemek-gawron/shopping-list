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
      <IconSymbol name="trash.fill" size={20} color="#fff" />
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
            borderLeftColor: colors.tint + '50',
            opacity: pressed ? 0.92 : 1,
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
        <View style={[styles.unitBadge, { backgroundColor: colors.tint }]}>
          <Text style={styles.unit}>{product.defaultUnit}</Text>
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
    marginVertical: 4,
    paddingLeft: 14,
    paddingRight: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.1,
  },
  aliases: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  unit: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 4,
    marginRight: 16,
    borderRadius: 16,
    gap: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});
