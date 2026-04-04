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
          backgroundColor: colors.cardBackground,
          borderLeftColor: item.checked ? colors.tint + '30' : colors.tint,
          opacity: pressed ? 0.88 : item.checked ? 0.65 : 1,
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
        {item.checked && <IconSymbol name="checkmark" size={12} color="#fff" />}
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.name,
            {
              color: item.checked ? colors.textSecondary : colors.text,
              textDecorationLine: item.checked ? 'line-through' : 'none',
            },
          ]}
        >
          {item.productName}
        </Text>
        <View style={[styles.quantityBadge, { backgroundColor: item.checked ? colors.border : colors.tint }]}>
          <Text style={[styles.quantity, { color: item.checked ? colors.textSecondary : '#fff' }]}>
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
    marginVertical: 4,
    paddingLeft: 14,
    paddingRight: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    flex: 1,
    letterSpacing: -0.1,
  },
  quantityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  quantity: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
