import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ImportPhotoPickerProps {
  photos: string[];
  onAddFromCamera: () => void;
  onAddFromLibrary: () => void;
  onRemove: (index: number) => void;
}

export function ImportPhotoPicker({
  photos,
  onAddFromCamera,
  onAddFromLibrary,
  onRemove,
}: ImportPhotoPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.sourceButton,
            { borderColor: colors.tint, backgroundColor: pressed ? colors.tint + '15' : 'transparent' },
          ]}
          onPress={onAddFromCamera}
        >
          <IconSymbol name="camera" size={20} color={colors.tint} />
          <Text style={[styles.sourceButtonText, { color: colors.tint }]}>Aparat</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.sourceButton,
            { borderColor: colors.tint, backgroundColor: pressed ? colors.tint + '15' : 'transparent' },
          ]}
          onPress={onAddFromLibrary}
        >
          <IconSymbol name="photo.on.rectangle" size={20} color={colors.tint} />
          <Text style={[styles.sourceButtonText, { color: colors.tint }]}>Biblioteka</Text>
        </Pressable>
      </View>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailScroll}
          contentContainerStyle={styles.thumbnailContent}
        >
          {photos.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.thumbnailWrapper}>
              <Image source={{ uri }} style={styles.thumbnail} />
              <Pressable
                style={[styles.removeButton, { backgroundColor: colors.tint }]}
                onPress={() => onRemove(index)}
                hitSlop={8}
              >
                <IconSymbol name="xmark" size={10} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {photos.length === 0 && (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Dodaj jedno lub więcej zdjęć przepisu
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  sourceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  sourceButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  thumbnailScroll: {
    flexGrow: 0,
  },
  thumbnailContent: {
    gap: 10,
    paddingVertical: 4,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
