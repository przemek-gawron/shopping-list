import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShoppingListItem as ShoppingListItemType } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { formatQuantity } from '@/constants/units';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  onToggle: () => void;
}

export function ShoppingListItem({ item, onToggle }: ShoppingListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: item.checked ? colors.border : colors.cardBackground,
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={onToggle}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: item.checked ? colors.tint : colors.border,
            backgroundColor: item.checked ? colors.tint : 'transparent',
          },
        ]}
      >
        {item.checked && <IconSymbol name="checkmark" size={14} color="#fff" />}
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.name,
            { color: item.checked ? colors.textSecondary : colors.text },
            item.checked && styles.strikethrough,
          ]}
        >
          {item.productName}
        </Text>
        <View style={[styles.quantityBadge, { backgroundColor: colors.tint + '15' }]}>
          <Text style={[styles.quantity, { color: colors.tint }]}>
            {formatQuantity(item.quantity)} {item.unit}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 5,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  quantityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  quantity: {
    fontSize: 13,
    fontWeight: '600',
  },
});
