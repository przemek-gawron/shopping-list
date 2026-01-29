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
        { backgroundColor: pressed ? colors.icon + '20' : 'transparent' },
      ]}
      onPress={onToggle}
    >
      <View style={[styles.checkbox, { borderColor: item.checked ? colors.tint : colors.icon }]}>
        {item.checked && <IconSymbol name="checkmark" size={16} color={colors.tint} />}
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.name,
            { color: item.checked ? colors.icon : colors.text },
            item.checked && styles.strikethrough,
          ]}
        >
          {item.productName}
        </Text>
        <Text style={[styles.quantity, { color: colors.icon }]}>
          {formatQuantity(item.quantity)} {item.unit}
        </Text>
      </View>
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    flex: 1,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  quantity: {
    fontSize: 14,
    marginLeft: 8,
  },
});
