import { Children, useRef, type ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';

type Props = {
  /** Index of the selected child; the row opens scrolled so it is on screen. */
  selected: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'handled' | 'never';
};

/**
 * A horizontal row of chips that opens scrolled to the selected one, so a choice made earlier
 * (a recipe's group, an ingredient's unit, a later day) is visible without scrolling the row.
 */
export function ChipScroll({ selected, children, style, contentContainerStyle, keyboardShouldPersistTaps }: Props) {
  const scroll = useRef<ScrollView>(null);
  const scrolled = useRef(false);
  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      style={style}
      contentContainerStyle={contentContainerStyle}>
      {Children.toArray(children).map((child, i) => (
        <View
          key={i}
          onLayout={
            i === selected
              ? (e) => {
                  // only once: later picks are made by tapping, so the chip is already in view
                  if (scrolled.current) return;
                  scrolled.current = true;
                  const { x } = e.nativeEvent.layout;
                  if (x > Spacing.three * 2) scroll.current?.scrollTo({ x: x - Spacing.five, animated: false });
                }
              : undefined
          }>
          {child}
        </View>
      ))}
    </ScrollView>
  );
}
