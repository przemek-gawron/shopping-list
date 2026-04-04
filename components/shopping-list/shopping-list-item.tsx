import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ShoppingListItem as ShoppingListItemType, Unit } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { formatQuantity, UNIT_OPTIONS } from '@/constants/units';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TileDecoration } from '@/components/ui/tile-decoration';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  isCompleting?: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (quantity: number, unit: Unit) => void;
}

export function ShoppingListItem({
  item,
  isCompleting = false,
  onToggle,
  onDelete,
  onUpdate,
}: ShoppingListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [editing, setEditing] = useState(false);
  const [editQty, setEditQty] = useState(item.quantity.toString());
  const [editUnit, setEditUnit] = useState<Unit>(item.unit);
  const visualChecked = item.checked || isCompleting;
  const completionProgress = useSharedValue(visualChecked ? 1 : 0);

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

  useEffect(() => {
    completionProgress.value = withTiming(visualChecked ? 1 : 0, { duration: 260 });
  }, [completionProgress, visualChecked]);

  const animatedRowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(completionProgress.value, [0, 1], [1, 0.6]),
    transform: [
      { scale: interpolate(completionProgress.value, [0, 1], [1, 0.985]) },
      { translateX: interpolate(completionProgress.value, [0, 1], [0, 8]) },
    ],
  }));

  const animatedStrikeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(completionProgress.value, [0, 1], [0, 1]),
    transform: [{ scaleX: interpolate(completionProgress.value, [0, 1], [0.01, 1]) }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(completionProgress.value, [0, 1], [0, 1]),
  }));

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
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceCard,
            borderLeftColor: visualChecked ? colors.tint + '30' : colors.tint,
            borderColor: colors.borderSubtle,
            shadowColor: colors.shadowColor,
          },
          !editing && animatedRowStyle,
        ]}
      >
        <TileDecoration variant="shopping" />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.completionOverlay,
            { backgroundColor: colors.surfaceElevated },
            animatedOverlayStyle,
          ]}
        />
        <View style={styles.mainRow}>
          <Pressable
            style={({ pressed }) => [
              styles.checkbox,
              {
                borderColor: visualChecked ? colors.tint : colors.tint + '40',
                backgroundColor: visualChecked ? colors.tint : colors.surfaceElevated,
                shadowColor: colors.shadowColor,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={onToggle}
          >
            {visualChecked && <IconSymbol name="checkmark" size={12} color={colors.onPrimary} />}
          </Pressable>

          <View style={styles.nameWrap}>
            <Text
              style={[
                styles.name,
                {
                  color: visualChecked ? colors.textSecondary : colors.text,
                  textDecorationLine: visualChecked ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={1}
            >
              {item.productName}
            </Text>
            <Animated.View
              style={[
                styles.strikeLine,
                { backgroundColor: colors.textSecondary },
                animatedStrikeStyle,
              ]}
            />
          </View>

          <Pressable
            style={[
              styles.quantityBadge,
              { backgroundColor: visualChecked ? colors.border : colors.tint },
            ]}
            onPress={startEditing}
          >
            <Text
              style={[
                styles.quantity,
                {
                  color: visualChecked ? colors.textSecondary : colors.onPrimary,
                },
              ]}
            >
              {formatQuantity(item.quantity)} {item.unit}
            </Text>
            <IconSymbol
              name="pencil"
              size={10}
              color={visualChecked ? colors.textSecondary : colors.onPrimaryMuted}
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
      </Animated.View>
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
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  nameWrap: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 22,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    letterSpacing: -0.1,
  },
  strikeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    top: '46%',
    marginTop: -0.75,
    transformOrigin: 'left',
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
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
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
