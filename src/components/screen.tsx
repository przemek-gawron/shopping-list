import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, screenFill, Spacing, WideContentWidth } from '@/constants/theme';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  /** Rendered to the right of the title, e.g. an add button. */
  action?: ReactNode;
  children?: ReactNode;
  /** false for screens that manage their own scrolling (long lists). */
  scroll?: boolean;
  /** Lets the content grow past MaxContentWidth, for screens that use columns on tablets. */
  wide?: boolean;
};

/** Tab screen shell: safe area, large title, content capped at MaxContentWidth (tablets, web). */
export function Screen({ title, action, children, scroll = true, wide = false }: Props) {
  const maxWidth = { maxWidth: wide ? WideContentWidth : MaxContentWidth };
  const theme = useTheme();
  const bottom = useTabBarInset() + Spacing.four;

  const header = (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.title} numberOfLines={1}>
        {title}
      </ThemedText>
      {action}
    </View>
  );

  return (
    <View style={[styles.root, screenFill(theme)]}>
      <SafeAreaView edges={['top']} style={styles.root}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, maxWidth, { paddingBottom: bottom }]}
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled">
            {header}
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.root, styles.wide, maxWidth]}>
            <View style={styles.headerPad}>{header}</View>
            {children}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

/** Body of a pushed / modal screen (the navigator draws the title). */
export function Page({ children, bottomPad = Spacing.five }: { children: ReactNode; bottomPad?: number }) {
  const theme = useTheme();
  return (
    <ScrollView
      style={screenFill(theme)}
      contentInsetAdjustmentBehavior="automatic"
      // keeps the focused field above the keyboard on iOS; Android resizes the window itself
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wide: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerPad: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: { flexShrink: 1 },
});
