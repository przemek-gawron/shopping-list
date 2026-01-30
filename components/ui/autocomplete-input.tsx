import React, { useState, useRef } from 'react';
import { View, TextInput, ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface AutocompleteItem {
  id: string;
  label: string;
}

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: AutocompleteItem) => void;
  items: AutocompleteItem[];
  placeholder?: string;
  onCreateNew?: (name: string) => void;
  createNewLabel?: string;
}

export function AutocompleteInput({
  value,
  onChangeText,
  onSelect,
  items,
  placeholder,
  onCreateNew,
  createNewLabel = 'Dodaj nowy',
}: AutocompleteInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const trimmedValue = value.trim();
  const filteredItems = trimmedValue
    ? items.filter((item) => item.label.toLowerCase().includes(trimmedValue.toLowerCase()))
    : items;

  const exactMatch = items.some(
    (item) => item.label.toLowerCase() === trimmedValue.toLowerCase()
  );
  const showCreateNew = onCreateNew && trimmedValue.length > 0 && !exactMatch;

  const handleSelect = (item: AutocompleteItem) => {
    onSelect(item);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleCreateNew = () => {
    if (onCreateNew && trimmedValue) {
      onCreateNew(trimmedValue);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
      {showSuggestions && (filteredItems.length > 0 || showCreateNew) && (
        <ScrollView
          style={[styles.suggestionsContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {filteredItems.slice(0, 5).map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.suggestionItem,
                { backgroundColor: pressed ? colors.tint + '15' : 'transparent' },
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text style={[styles.suggestionText, { color: colors.text }]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          {showCreateNew && (
            <Pressable
              style={({ pressed }) => [
                styles.createNewItem,
                { backgroundColor: pressed ? colors.tint + '20' : colors.tint + '10' },
              ]}
              onPress={handleCreateNew}
            >
              <IconSymbol name="plus.circle.fill" size={18} color={colors.tint} />
              <Text style={[styles.createNewText, { color: colors.tint }]}>
                {createNewLabel}: "{trimmedValue}"
              </Text>
            </Pressable>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: 16,
  },
  createNewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  createNewText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
