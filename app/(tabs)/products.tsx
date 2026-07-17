import React from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useProducts } from '@/hooks/use-products';
import { useAppContext } from '@/context/app-context';
import { ProductListItem } from '@/components/products/product-list-item';
import { GradientHeader } from '@/components/ui/gradient-header';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { t } from '@/i18n';

export default function ProductsScreen() {
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);
  const { isLoading } = useAppContext();
  const { products, deleteProduct } = useProducts();

  if (isLoading) {
    return (
      <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
        <AmbientBackground variant="products" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
      <AmbientBackground variant="products" />
      <View style={styles.container}>
        <GradientHeader title={t('products_header')} onAdd={() => router.push('/product/new')} />

        <View
          style={[
            styles.accountRow,
            { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.borderSubtle },
          ]}
        >
          <Text style={[styles.accountLabel, { color: colors.textSecondary }]} numberOfLines={1}>
            {t('auth_signed_in_as')}:{' '}
            <Text style={{ color: colors.text }}>
              {isGuest ? t('auth_guest') : user?.email ?? user?.displayName ?? '—'}
            </Text>
          </Text>
          <Pressable
            onPress={() => {
              if (isGuest) {
                router.push('/(auth)/login');
                return;
              }
              Alert.alert(t('auth_sign_out'), '', [
                { text: t('cancel'), style: 'cancel' },
                { text: t('auth_sign_out'), style: 'destructive', onPress: () => void signOut() },
              ]);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={[styles.accountAction, { color: colors.tint }]}>
              {isGuest ? t('auth_sign_in') : t('auth_sign_out')}
            </Text>
          </Pressable>
        </View>

        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('products_empty_title')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('products_empty_subtitle')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductListItem product={item} onDelete={() => deleteProduct(item.id)} />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  accountLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  accountAction: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 24,
  },
});
