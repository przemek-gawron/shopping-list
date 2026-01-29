import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Product } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? colors.icon + '20' : 'transparent' },
      ]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
        {product.aliases && product.aliases.length > 0 && (
          <Text style={[styles.aliases, { color: colors.icon }]}>
            {product.aliases.join(', ')}
          </Text>
        )}
      </View>
      <Text style={[styles.unit, { color: colors.icon }]}>{product.defaultUnit}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  aliases: {
    fontSize: 13,
    marginTop: 2,
  },
  unit: {
    fontSize: 14,
    marginLeft: 8,
  },
});
