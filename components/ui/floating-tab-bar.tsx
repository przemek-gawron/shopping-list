import {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function getTabLabel(options: BottomTabNavigationOptions, routeName: string) {
  if (typeof options.tabBarLabel === 'string') {
    return options.tabBarLabel;
  }

  if (typeof options.title === 'string') {
    return options.title;
  }

  return routeName;
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const supportsLiquidGlass =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  const dock = (
    <>
      {supportsLiquidGlass ? null : (
        <View
          pointerEvents="none"
          style={[
            styles.gloss,
            {
              backgroundColor: colors.overlayOnPrimarySubtle,
              opacity: colorScheme === 'dark' ? 0.35 : 0.85,
            },
          ]}
        />
      )}

      {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = getTabLabel(options, route.name);
          const iconColor = focused ? colors.onPrimary : colors.tintSecondary;
          const inactiveBackground =
            colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.38)';
          const contentBackground = focused
            ? colors.tint + 'D9'
            : colorScheme === 'dark'
              ? 'rgba(15, 23, 42, 0.34)'
              : 'rgba(255,255,255,0.62)';
          const iconBackground = focused
            ? 'rgba(255,255,255,0.18)'
            : colorScheme === 'dark'
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(4, 120, 87, 0.12)';

          const onPress = () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const content = (
            <View
              style={[
                styles.tabButtonContent,
                {
                  backgroundColor: contentBackground,
                  borderColor: focused ? colors.tint + '55' : colors.borderSubtle,
                },
                !supportsLiquidGlass && {
                  backgroundColor: focused ? colors.tint : inactiveBackground,
                  shadowColor: focused ? colors.shadowColor : 'transparent',
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: iconBackground },
                ]}
              >
                {options.tabBarIcon?.({
                  focused,
                  color: iconColor,
                  size: 20,
                })}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: focused ? colors.onPrimary : colors.text,
                    textShadowColor: focused
                      ? 'rgba(0,0,0,0.16)'
                      : colorScheme === 'dark'
                        ? 'transparent'
                        : 'rgba(255,255,255,0.72)',
                  },
                ]}
              >
                {label}
              </Text>
            </View>
          );

          return (
            <Pressable
              key={route.key}
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabPressable,
                pressed && styles.tabPressablePressed,
              ]}
            >
              {supportsLiquidGlass ? (
                <GlassView
                  isInteractive
                  glassEffectStyle={focused ? 'regular' : 'clear'}
                  colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}
                  tintColor={focused ? colors.tint : undefined}
                  style={[
                    styles.tabButton,
                    {
                      borderColor: focused ? colors.tint + '55' : colors.borderSubtle,
                      shadowColor: focused ? colors.shadowColor : 'transparent',
                    },
                  ]}
                >
                  {content}
                </GlassView>
              ) : (
                content
              )}
            </Pressable>
          );
        })}
    </>
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      {supportsLiquidGlass ? (
        <GlassContainer
          spacing={12}
          style={[
            styles.container,
            {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          {dock}
        </GlassContainer>
      ) : (
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surfaceGlass,
              borderColor: colors.borderSubtle,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          {dock}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  tabPressable: {
    flex: 1,
  },
  tabPressablePressed: {
    transform: [{ scale: 0.97 }],
  },
  tabButtonContent: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.1,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
