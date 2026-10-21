import { useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { unlessSwiping } from '@/components/swipe-to-delete';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type AnimatedViewProps = ComponentProps<typeof Animated.View>;

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** false keeps the buttons inside a pressable card reachable for screen readers. */
  accessible?: boolean;
  /** Layout animations, e.g. a card sliding when the one above it grows. */
  layout?: AnimatedViewProps['layout'];
  entering?: AnimatedViewProps['entering'];
  exiting?: AnimatedViewProps['exiting'];
};

/** Rounded surface; pressable when `onPress` is given. */
export function Card({ children, onPress, style, accessible, layout, entering, exiting }: Props) {
  const theme = useTheme();
  // pressed state by hand: an animated component takes a style, not a style function
  const [pressed, setPressed] = useState(false);
  const base = [styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderSubtle, boxShadow: theme.cardShadow }, style];
  const animations = { layout, entering, exiting };
  if (!onPress)
    return (
      <Animated.View {...animations} style={base}>
        {children}
      </Animated.View>
    );
  return (
    <AnimatedPressable
      {...animations}
      onPress={unlessSwiping(onPress)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessible={accessible}
      style={[base, pressed && styles.pressed]}>
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.card, borderWidth: 1, padding: 14 },
  pressed: { opacity: 0.7 },
});
