import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Stepper } from '@/components/stepper';
import { Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n';

export const MIN_SERVINGS = 0.5;
const MULTIPLIERS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6];

/** "1,5×" / "1.5×" depending on the app language. */
export function useFormatServings() {
  const locale = useLocale();
  return (value: number) => `${value.toLocaleString(locale, { maximumFractionDigits: 2 })}×`;
}

type Props = { value: number; onChange: (value: number) => void; onValuePress: () => void };

/** − 1,5× + for a recipe multiplier; tapping the number asks the parent to show `ServingsChips`. */
export function ServingsStepper({ value, onChange, onValuePress }: Props) {
  const format = useFormatServings();
  return <Stepper value={value} onChange={onChange} min={MIN_SERVINGS} format={format} onValuePress={onValuePress} />;
}

/** Quick choice of whole and half multipliers. */
export function ServingsChips({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const format = useFormatServings();
  return (
    <View style={styles.chips}>
      {MULTIPLIERS.map((m) => (
        <Chip key={m} label={format(m)} selected={m === value} onPress={() => onChange(m)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
