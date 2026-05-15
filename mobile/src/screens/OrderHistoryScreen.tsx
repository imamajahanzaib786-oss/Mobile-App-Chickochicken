import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Animated, Easing, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from './../contexts/CartContext';
import { useTheme } from '../hooks/useTheme';

export const OrderHistoryScreen: React.FC = () => {
  const { orders, refreshOrders } = useCart();
  const [loading, setLoading] = useState(false);

  const nav = useNavigation<any>();
  const theme = useTheme();

  const pulse = useRef(new Animated.Value(1)).current;
  const anim = useRef(new Animated.Value(0)).current;

  // ✅ Start animation on mount
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ Load orders on mount
  useEffect(() => {
    setLoading(true);
    refreshOrders().finally(() => setLoading(false));
  }, []);

  // Sort newest first
  const sortedOrders = [...(orders || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  async function handleRefresh() {
    setLoading(true);
    anim.setValue(0);
    try {
      await refreshOrders();
    } finally {
      setLoading(false);
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }

  // Empty state pulse animation
  useEffect(() => {
    if (!sortedOrders.length) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [sortedOrders.length]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={sortedOrders}
        keyExtractor={(o) => `${o.id}-${o.createdAt}`}
        contentContainerStyle={{
          padding: 16,
          flexGrow: sortedOrders.length ? 0 : 1,
        }}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <Text style={{ fontSize: 28, color: theme.colors.text, textAlign: 'center', marginTop: 28, marginBottom: 12 }}>
            Orders
          </Text>
        }
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={{ transform: [{ scale: pulse }], marginBottom: 16 }}>
              <View
                style={{
                  height: 120,
                  width: 120,
                  borderRadius: 60,
                  backgroundColor: theme.colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="receipt" size={48} color={theme.colors.primary} />
              </View>
            </Animated.View>

            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>
              No orders yet
            </Text>
            <Text style={{ color: theme.colors.muted, marginVertical: 8, textAlign: 'center' }}>
              Order something delicious to see it here.
            </Text>

            <TouchableOpacity
              onPress={() => nav.navigate('Menu')}
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 10,
                marginTop: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Browse Menu</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) => {
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [20 + index * 4, 0],
          });

          const opacity = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return (
            <Animated.View style={{ transform: [{ translateY }], opacity }}>
              <OrderCard item={item} theme={theme} />
            </Animated.View>
          );
        }}
      />
    </View>
  );
};


function OrderCard({ item, theme }: any) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <MaterialCommunityIcons
          name={item.deliveryMethod === 'pickup' ? 'storefront' : 'truck'}
          size={36}
          color={theme.colors.primary}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
            Order #{String(item.id).slice(0, 8)}
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {item.items?.map((it: any) => (
        <Text key={it.id} style={{ color: theme.colors.text }}>
          {it.menuItem.name} × {it.quantity}
        </Text>
      ))}

      <View
        style={{
          marginTop: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: theme.colors.muted }}>Total</Text>
        <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
          {formatPrice(item.totalAmount)}
        </Text>
      </View>
    </View>
  );
}


function formatPrice(p?: number | string) {
  if (p == null) return '';
  const n = Number(p);
  if (isNaN(n)) return '';
  return `£${n.toFixed(2)}`;
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || '').toLowerCase();
  let color = '#999';
  let label = status || 'unknown';
  if (s.includes('pending')) {
    color = '#f59e0b';
    label = 'Pending';
  } else if (s.includes('prepar') || s.includes('preparing')) {
    color = '#06b6d4';
    label = 'Preparing';
  } else if (s.includes('ready')) {
    color = '#10b981';
    label = 'Ready';
  } else if (s.includes('cancel') || s.includes('failed')) {
    color = '#ef4444';
    label = 'Cancelled';
  }
  return (
    <View
      style={{
        backgroundColor: color + '22',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
      }}
    >
      <Text style={{ color, fontWeight: '600', fontSize: 12 }}>{label}</Text>
    </View>
  );
}
