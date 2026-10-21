import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Page } from '@/components/screen';
import { SwipeToDelete, unlessSwiping } from '@/components/swipe-to-delete';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { rowExit, rowLayout } from '@/constants/motion';
import { Radius, Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

export default function GroupsScreen() {
  const t = useT();
  const theme = useTheme();
  const groups = useStore((s) => s.groups);
  const recipes = useStore((s) => s.recipes);
  const moveGroup = useStore((s) => s.moveGroup);
  const removeGroup = useStore((s) => s.removeGroup);

  return (
    <Page>
      {groups.length === 0 && <EmptyState emoji="🗂️" title={t('groups_empty_title')} subtitle={t('groups_empty_subtitle')} />}
      {groups.map((g, index) => (
        <Animated.View key={g.id} exiting={rowExit} layout={rowLayout}>
          <SwipeToDelete
            radius={Radius.card}
            onDelete={() =>
              confirm(t('group_delete'), t('group_delete_message', { name: g.name }), t('delete'), t('cancel'), () => removeGroup(g.id))
            }>
            <Card style={styles.row}>
              {/* the arrows are siblings of the row button, so a disabled arrow never opens the form */}
              <Pressable
                style={({ pressed }) => [styles.main, pressed && styles.pressed]}
                accessibilityRole="button"
                onPress={unlessSwiping(() => router.push({ pathname: '/group/form', params: { id: g.id } }))}>
                <ThemedText style={styles.emoji}>{g.emoji}</ThemedText>
                <View style={styles.text}>
                  <ThemedText style={styles.name}>{g.name}</ThemedText>
                  <ThemedText type="small">{t('recipes_count', { count: recipes.filter((r) => r.groupId === g.id).length })}</ThemedText>
                </View>
              </Pressable>
              <Pressable hitSlop={8} accessibilityRole="button" disabled={index === 0} onPress={unlessSwiping(() => moveGroup(g.id, -1))} accessibilityLabel={t('move_up')}>
                <IconSymbol name="chevron.up" size={20} color={index === 0 ? theme.border : theme.textSecondary} />
              </Pressable>
              <Pressable hitSlop={8} accessibilityRole="button" disabled={index === groups.length - 1} onPress={unlessSwiping(() => moveGroup(g.id, 1))} accessibilityLabel={t('move_down')}>
                <IconSymbol name="chevron.down" size={20} color={index === groups.length - 1 ? theme.border : theme.textSecondary} />
              </Pressable>
            </Card>
          </SwipeToDelete>
        </Animated.View>
      ))}
      <Button label={t('group_add')} onPress={() => router.push('/group/form')} />
    </Page>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pressed: { opacity: 0.6 },
  emoji: { fontSize: 28, lineHeight: 34 },
  text: { flex: 1 },
  name: { fontWeight: '700' },
});
