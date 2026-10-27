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
 * A row whose selected chip already fits stays at its start.
 */
export function ChipScroll({ selected, children, style, contentContainerStyle, keyboardShouldPersistTaps }: Props) {
  const scroll = useRef<ScrollView>(null);
  // the row's width and the selected chip's place arrive in either order; scroll once both are known
  const width = useRef(0);
  const chip = useRef<{ x: number; width: number } | null>(null);
  const done = useRef(false);
  const reveal = () => {
    if (done.current || !width.current || !chip.current) return;
    // only once: later picks are made by tapping, so the chip is already in view
    done.current = true;
    const { x, width: chipWidth } = chip.current;
    if (x + chipWidth + Spacing.three > width.current) scroll.current?.scrollTo({ x: x - Spacing.five, animated: false });
  };
  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      style={style}
      contentContainerStyle={contentContainerStyle}
      onLayout={(e) => {
        width.current = e.nativeEvent.layout.width;
        reveal();
      }}>
      {Children.toArray(children).map((child, i) => (
        <View
          key={i}
          onLayout={
            i === selected
              ? (e) => {
                  chip.current = e.nativeEvent.layout;
                  reveal();
                }
              : undefined
          }>
          {child}
        </View>
      ))}
    </ScrollView>
  );
}
