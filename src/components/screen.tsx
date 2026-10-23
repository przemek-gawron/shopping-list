import { createContext, useCallback, useContext, useRef, type ReactNode, type RefObject } from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KeyboardDoneBar } from '@/components/keyboard-done';
import { BackdropLayer } from '@/components/backdrop';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, screenFill, Spacing, WideContentWidth } from '@/constants/theme';
import { useKeyboardInset } from '@/hooks/use-keyboard-inset';
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

/**
 * Tab screen shell: large title, content capped at MaxContentWidth (tablets, web). A scrolling screen
 * starts below the status bar but scrolls under it, title included, so nothing gets cut off at an
 * edge below the notch.
 */
export function Screen({ title, action, children, scroll = true, wide = false }: Props) {
  const maxWidth = { maxWidth: wide ? WideContentWidth : MaxContentWidth };
  const theme = useTheme();
  const top = useSafeAreaInsets().top;
  const bottom = useTabBarInset() + Spacing.four;
  const { ref: pageRef, inset: keyboardInset } = useKeyboardInset();

  const header = (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.title} numberOfLines={1}>
        {title}
      </ThemedText>
      {action}
    </View>
  );

  return (
    <View style={[styles.root, screenFill(theme)]} ref={pageRef}>
      <BackdropLayer />
      {scroll ? (
        <ScrollView
          style={{ marginBottom: keyboardInset }}
          contentContainerStyle={[styles.content, maxWidth, { paddingTop: top + Spacing.three, paddingBottom: bottom }]}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled">
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, styles.wide, maxWidth, { paddingTop: top, marginBottom: keyboardInset }]}>
          <View style={styles.headerPad}>{header}</View>
          {children}
        </View>
      )}
    </View>
  );
}

type ScrollIntoView = (target: RefObject<View | null>) => void;
const ScrollIntoViewContext = createContext<ScrollIntoView>(() => {});

/**
 * Scrolls the enclosing Page so that `target` is above the keyboard, e.g. suggestions that appear
 * under the focused field (the scroll view itself only keeps the field visible).
 */
export function useScrollIntoView() {
  return useContext(ScrollIntoViewContext);
}

/** Space left under a view scrolled into sight. */
const SCROLL_MARGIN = Spacing.three;

/** Body of a pushed / modal screen (the navigator draws the title). */
export function Page({ children, bottomPad = Spacing.five }: { children: ReactNode; bottomPad?: number }) {
  const theme = useTheme();
  const { ref: pageRef, inset: keyboardInset } = useKeyboardInset();
  const scrollRef = useRef<ScrollView>(null);
  const offset = useRef(0);

  const scrollIntoView = useCallback<ScrollIntoView>((target) => {
    const scroll = scrollRef.current;
    if (!scroll || !target.current) return;
    pageRef.current?.measureInWindow((_px, pageY, _pw, pageHeight) =>
      target.current?.measureInWindow((_x, y, _width, height) => {
        const visibleBottom = Math.min(pageY + pageHeight, Keyboard.metrics()?.screenY ?? Infinity);
        const overflow = y + height + SCROLL_MARGIN - visibleBottom;
        if (overflow > 0) scroll.scrollTo({ y: offset.current + overflow, animated: true });
      }),
    );
  }, [pageRef]);

  return (
    <View style={[styles.root, screenFill(theme)]} ref={pageRef}>
      <BackdropLayer />
      <ScrollView
        ref={scrollRef}
        onScroll={(e) => (offset.current = e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        style={{ marginBottom: keyboardInset }}
        contentInsetAdjustmentBehavior="automatic"
        // keeps the focused field above the keyboard: iOS adjusts the insets, Android gets a shorter view
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <ScrollIntoViewContext value={scrollIntoView}>{children}</ScrollIntoViewContext>
      </ScrollView>
      <KeyboardDoneBar />
    </View>
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
