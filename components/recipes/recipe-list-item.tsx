import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Recipe } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CounterButton } from '@/components/ui/counter-button';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface RecipeListItemProps {
  recipe: Recipe;
  count: number;
  onCountChange: (count: number) => void;
  onDelete: () => void;
}

export function RecipeListItem({ recipe, count, onCountChange, onDelete }: RecipeListItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isSelected = count > 0;

  const handlePress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleDelete = () => {
    Alert.alert('Usun przepis', `Czy na pewno chcesz usunac "${recipe.title}"?`, [
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
            borderLeftColor: isSelected ? colors.tint : colors.tint + '40',
            opacity: pressed ? 0.92 : 1,
          },
        ]}
        onPress={handlePress}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
          {recipe.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
              {recipe.description}
            </Text>
          ) : null}
          <View style={[styles.chip, { backgroundColor: colors.tint, }]}>
            <Text style={styles.chipText}>
              {recipe.ingredients.length} skł.
            </Text>
          </View>
        </View>
        <CounterButton count={count} onChange={onCountChange} />
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
    paddingRight: 14,
    paddingLeft: 14,
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
    gap: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.1,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  chipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    letterSpacing: 0.1,
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
