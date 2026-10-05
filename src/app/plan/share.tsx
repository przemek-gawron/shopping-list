import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { Button } from '@/components/button';
import { Page } from '@/components/screen';
import { useFormatServings } from '@/components/servings';
import { Stepper } from '@/components/stepper';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useSlotName } from '@/data/labels';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { addDays, formatDate, today } from '@/utils/dates';
import { sharePlanImage, sharePlanPdf, type ShareDay } from '@/utils/plan-share';

const MAX_DAYS = 14;
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** The shared picture and PDF are always light, whatever theme the sender uses. */
const light = Colors.light;

/** Preview of the plan for a chosen range of days, shared as a picture or a PDF. */
export default function SharePlanScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const slotName = useSlotName();
  const formatServings = useFormatServings();
  const plan = useStore((s) => s.plan);
  const recipes = useStore((s) => s.recipes);
  const allSlots = useStore((s) => s.slots);
  const mealCount = useStore((s) => s.mealCount);

  const [start, setStart] = useState(params.date ?? today());
  const [count, setCount] = useState(7);
  const [busy, setBusy] = useState(false);
  const preview = useRef<View>(null);

  const end = addDays(start, count - 1);
  const short = (date: string) => formatDate(date, locale, { day: 'numeric', month: 'short' });
  const range = count === 1 ? short(start) : `${short(start)} – ${short(end)}`;
  const title = t('share_plan_title');

  // only meals of the visible slots, and only days that have any
  const days = useMemo<ShareDay[]>(() => {
    const slots = allSlots.slice(0, mealCount);
    return Array.from({ length: count }, (_, i) => addDays(start, i))
      .map((date) => ({
        date,
        label: capitalize(formatDate(date, locale, { weekday: 'long', day: 'numeric', month: 'long' })),
        meals: slots.flatMap((slot, index) => {
          const entry = plan.find((e) => e.date === date && e.slotId === slot.id);
          const recipe = entry && recipes.find((r) => r.id === entry.recipeId);
          if (!entry || !recipe) return [];
          return [{ slot: slotName(slot, index), recipe: recipe.title, servings: entry.servings !== 1 ? formatServings(entry.servings) : undefined }];
        }),
      }))
      .filter((d) => d.meals.length > 0);
  }, [allSlots, mealCount, count, start, locale, plan, recipes, slotName, formatServings]);

  const run = async (share: () => Promise<void>) => {
    setBusy(true);
    try {
      await share();
    } catch (error) {
      Alert.alert(t('share_failed'), error instanceof Error ? error.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const shareImage = () =>
    run(async () => sharePlanImage(await captureRef(preview, { format: 'png', quality: 1, result: 'tmpfile' }), title, days[0].date));
  const sharePdf = () => run(() => sharePlanPdf(title, range, days));

  const arrow = (icon: 'chevron.left' | 'chevron.right', step: number, label: string) => (
    <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel={label} onPress={() => setStart(addDays(start, step))}>
      <IconSymbol name={icon} size={22} color={theme.tint} />
    </Pressable>
  );

  return (
    <Page>
      <Stack.Screen options={{ title: t('share_plan') }} />

      <View style={styles.row}>
        <ThemedText type="label" style={styles.flex}>
          {t('share_from')}
        </ThemedText>
        {arrow('chevron.left', -1, t('share_prev_day'))}
        <ThemedText style={styles.date}>{formatDate(start, locale, { weekday: 'short', day: 'numeric', month: 'short' })}</ThemedText>
        {arrow('chevron.right', 1, t('share_next_day'))}
      </View>
      <View style={styles.row}>
        <ThemedText type="label" style={styles.flex}>
          {t('share_days')}
        </ThemedText>
        <Stepper value={count} onChange={setCount} min={1} max={MAX_DAYS} />
      </View>

      {days.length === 0 ? (
        <ThemedText type="small">{t('share_empty')}</ThemedText>
      ) : (
        <View style={styles.buttons}>
          <View style={styles.flex}>
            <Button label={t('share_image')} onPress={() => void shareImage()} disabled={busy} />
          </View>
          <View style={styles.flex}>
            <Button label={t('share_pdf')} onPress={() => void sharePdf()} disabled={busy} variant="secondary" />
          </View>
        </View>
      )}

      {days.length > 0 && (
        // captured as the shared picture: plain light colours, no theme
        <View ref={preview} collapsable={false} style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.range}>{range}</Text>
          {days.map((d) => (
            <View key={d.date} style={styles.day}>
              <Text style={styles.dayLabel}>{d.label}</Text>
              {d.meals.map((m) => (
                <View key={m.slot} style={styles.meal}>
                  <Text style={styles.slot}>{m.slot}</Text>
                  <Text style={styles.recipe}>
                    {m.recipe}
                    {m.servings && <Text style={styles.servings}> {m.servings}</Text>}
                  </Text>
                </View>
              ))}
            </View>
          ))}
          <Text style={styles.footer}>Dishdeck</Text>
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
  date: { fontWeight: '700', minWidth: 110, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  sheet: { backgroundColor: '#FFFFFF', borderRadius: Radius.card, padding: Spacing.three, gap: Spacing.two },
  title: { color: light.text, fontSize: 22, fontWeight: '800' },
  range: { color: light.textSecondary, fontSize: 14, fontWeight: '500', marginTop: -6 },
  day: { borderWidth: 1, borderColor: light.surfaceCard, borderRadius: Radius.control, padding: 10, gap: 4 },
  dayLabel: { color: light.tint, fontSize: 15, fontWeight: '700' },
  meal: { paddingVertical: 2 },
  slot: { color: light.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  recipe: { color: light.text, fontSize: 15, fontWeight: '600' },
  servings: { color: light.tint },
  footer: { color: light.textSecondary, fontSize: 11, textAlign: 'right' },
});
