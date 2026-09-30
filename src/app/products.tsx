import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { DEPARTMENT_EMOJI } from '@/constants/departments';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

export default function ProductsScreen() {
  const t = useT();
  const theme = useTheme();
  const products = useStore((s) => s.products);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, query]);

  return (
    <Page>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('search_placeholder')}
        placeholderTextColor={theme.icon}
        clearButtonMode="while-editing"
        style={[styles.search, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      />
      {products.length === 0 && <EmptyState emoji="🥕" title={t('products_empty_title')} subtitle={t('products_empty_subtitle')} />}
      {visible.map((p) => (
        <Card key={p.id} onPress={() => router.push({ pathname: '/product/form', params: { id: p.id } })} style={styles.row}>
          <ThemedText style={styles.emoji}>{DEPARTMENT_EMOJI[p.departmentId]}</ThemedText>
          <View style={styles.text}>
            <ThemedText style={styles.name}>{p.name}</ThemedText>
            <ThemedText type="small">{t(`dept_${p.departmentId}`)} · {t(`unit_${p.defaultUnit}`)}</ThemedText>
          </View>
        </Card>
      ))}
      <Button label={t('product_add')} onPress={() => router.push('/product/form')} />
    </Page>
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 10 },
  emoji: { fontSize: 24, lineHeight: 30 },
  text: { flex: 1 },
  name: { fontWeight: '700' },
});
