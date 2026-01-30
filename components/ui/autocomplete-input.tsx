import React, { useState, useRef } from 'react';
import { View, TextInput, ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
}

export function AutocompleteInput({
  value,
  onChangeText,
  onSelect,
  items,
  placeholder,
}: AutocompleteInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const filteredItems = value.trim()
    ? items.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
    : items;

  const handleSelect = (item: AutocompleteItem) => {
    onSelect(item);
    setShowSuggestions(false);
    inputRef.current?.blur();
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
      {showSuggestions && filteredItems.length > 0 && (
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
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: 16,
  },
});
