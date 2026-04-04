import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ShoppingListItem as ShoppingListItemType, Unit } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { formatQuantity, UNIT_OPTIONS } from '@/constants/units';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TileDecoration } from '@/components/ui/tile-decoration';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (quantity: number, unit: Unit) => void;
}

export function ShoppingListItem({ item, onToggle, onDelete, onUpdate }: ShoppingListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [editing, setEditing] = useState(false);
  const [editQty, setEditQty] = useState(item.quantity.toString());
  const [editUnit, setEditUnit] = useState<Unit>(item.unit);

  const startEditing = () => {
    setEditQty(item.quantity.toString());
    setEditUnit(item.unit);
    setEditing(true);
  };

  const handleConfirm = () => {
    const qty = parseFloat(editQty);
    if (!isNaN(qty) && qty > 0) {
      onUpdate(qty, editUnit);
    }
    setEditing(false);
  };

  const cycleUnit = () => {
    const idx = UNIT_OPTIONS.findIndex((u) => u.value === editUnit);
    setEditUnit(UNIT_OPTIONS[(idx + 1) % UNIT_OPTIONS.length].value);
  };

  const renderRightActions = () => (
    <Pressable style={[styles.deleteAction, { backgroundColor: colors.destructive }]} onPress={onDelete}>
      <IconSymbol name="trash.fill" size={20} color={colors.onPrimary} />
      <Text style={[styles.deleteText, { color: colors.onPrimary }]}>Usun</Text>
    </Pressable>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={80}
      friction={2}
      overshootRight={false}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceCard,
            borderLeftColor: item.checked ? colors.tint + '30' : colors.tint,
            borderColor: colors.borderSubtle,
            shadowColor: colors.shadowColor,
            opacity: item.checked && !editing ? 0.65 : 1,
          },
        ]}
      >
        <TileDecoration variant="shopping" />
        <View style={styles.mainRow}>
          <Pressable
            style={({ pressed }) => [
              styles.checkbox,
              {
                borderColor: item.checked ? colors.tint : colors.borderSubtle,
                backgroundColor: item.checked ? colors.tint : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={onToggle}
          >
            {item.checked && <IconSymbol name="checkmark" size={12} color={colors.onPrimary} />}
          </Pressable>

          <Text
            style={[
              styles.name,
              {
                color: item.checked ? colors.textSecondary : colors.text,
                textDecorationLine: item.checked ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={1}
          >
            {item.productName}
          </Text>

          <Pressable
            style={[
              styles.quantityBadge,
              { backgroundColor: item.checked ? colors.border : colors.tint },
            ]}
            onPress={startEditing}
          >
            <Text
              style={[
                styles.quantity,
                {
                  color: item.checked ? colors.textSecondary : colors.onPrimary,
                },
              ]}
            >
              {formatQuantity(item.quantity)} {item.unit}
            </Text>
            <IconSymbol
              name="pencil"
              size={10}
              color={item.checked ? colors.textSecondary : colors.onPrimaryMuted}
            />
          </Pressable>
        </View>

        {editing && (
          <View style={[styles.editRow, { borderTopColor: colors.borderSubtle }]}>
            <TextInput
              style={[
                styles.editInput,
                { color: colors.text, borderColor: colors.tint, backgroundColor: colors.background },
              ]}
              value={editQty}
              onChangeText={setEditQty}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
            />
            <Pressable
              style={[styles.unitButton, { backgroundColor: colors.tint + '18', borderColor: colors.tint }]}
              onPress={cycleUnit}
            >
              <Text style={[styles.unitButtonText, { color: colors.tint }]}>{editUnit}</Text>
            </Pressable>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.tint }]}
              onPress={handleConfirm}
            >
              <IconSymbol name="checkmark" size={16} color={colors.onPrimary} />
            </Pressable>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.border }]}
              onPress={() => setEditing(false)}
            >
              <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    flex: 1,
    letterSpacing: -0.1,
  },
  quantityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    flexShrink: 0,
  },
  quantity: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },
  editInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  unitButton: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 66,
    alignItems: 'center',
  },
  unitButtonText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 4,
    marginRight: 16,
    borderRadius: 16,
    gap: 4,
  },
  deleteText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});
