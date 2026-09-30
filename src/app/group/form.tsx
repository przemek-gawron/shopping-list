import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

const EMOJIS = ['🍳', '🥪', '🍲', '🍝', '🥗', '🍰', '🍕', '🥘', '🍜', '🥞', '🐟', '🥦', '🍎', '🥖', '⭐'];

export default function GroupFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const t = useT();
  const editing = useStore((s) => s.groups.find((g) => g.id === id));
  const addGroup = useStore((s) => s.addGroup);
  const updateGroup = useStore((s) => s.updateGroup);
  const removeGroup = useStore((s) => s.removeGroup);

  const [name, setName] = useState(editing?.name ?? '');
  const [emoji, setEmoji] = useState(editing?.emoji ?? EMOJIS[0]);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert(t('group_name_required'));
    if (editing) updateGroup({ ...editing, name: trimmed, emoji });
    else addGroup({ name: trimmed, emoji });
    router.back();
  };

  return (
    <Page>
      <Stack.Screen options={{ title: editing ? t('group_edit') : t('group_new') }} />
      <Field label={t('group_name')} value={name} onChangeText={setName} placeholder={t('group_name_placeholder')} autoFocus={!editing} />
      <View style={styles.section}>
        <ThemedText type="label">{t('group_emoji')}</ThemedText>
        <View style={styles.emojis}>
          {EMOJIS.map((e) => (
            <Chip key={e} label={e} selected={emoji === e} onPress={() => setEmoji(e)} />
          ))}
        </View>
      </View>
      <Button label={t('save')} onPress={save} />
      {editing && (
        <Button
          label={t('delete')}
          variant="destructive"
          onPress={() =>
            confirm(t('group_delete'), t('group_delete_message', { name: editing.name }), t('delete'), t('cancel'), () => {
              removeGroup(editing.id);
              router.back();
            })
          }
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  emojis: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
