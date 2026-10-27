import { useNavigation, useRoute } from 'expo-router';
import { useEffect, useReducer } from 'react';

/**
 * Whether this tab screen is the selected tab, even with a modal or pushed screen above it.
 * Layout animations (`entering`, `exiting`, `layout`) must be off on a tab that is not shown:
 * a hidden tab is frozen, so rows removed there (a new shopping list made from the Plan tab)
 * never finish fading out and stay on screen over the new rows.
 */
export function useTabSelected() {
  const navigation = useNavigation();
  const route = useRoute();
  // the tab navigator's state is not reactive here; focus and blur fire on every tab switch
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const unsubscribe = [navigation.addListener('focus', rerender), navigation.addListener('blur', rerender)];
    return () => unsubscribe.forEach((u) => u());
  }, [navigation]);
  const state = navigation.getState();
  return !state || state.routes[state.index]?.key === route.key;
}
