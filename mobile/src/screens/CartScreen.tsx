import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, Image, FlatList, Alert, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import GlassButton from '../components/GlassButton';
import RemoteImage from '../components/RemoteImage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme'; // ✅ Zustand theme
import { resolveImage } from 'src/utils/resolveImage';

export const CartScreen: React.FC = () => {
  const { items, removeFromCart, placeOrder, increaseQuantity, decreaseQuantity } = useCart();
  const theme = useTheme(); 
  const [loading, setLoading] = useState(false);
  const nav = useNavigation<any>();
  function getPriceOf(obj?: any) {
    return Number(obj?.basePrice ?? obj?.price ?? obj?.unitPrice ?? 0);
  }

  function formatPrice(p?: number | string) {
    const n = Number(p);
    return isNaN(n) ? '' : `£${n.toFixed(2)}`;
  }
  const addonsTotal = useMemo(() => items.reduce((s, i) => s + (i.addons || []).reduce((a: number, x: any) => a + getPriceOf(x), 0) * i.quantity, 0), [items]);


  const total = items.reduce((s, i) => {
    const base = getPriceOf(i);

    const addonsSum =
     (i.addons || []).reduce((a: number, x: any) => a + getPriceOf(x), 0);
    return s + (base + addonsSum) * i.quantity;
  }, 0);

  async function onPlace() {
    setLoading(true);
    try {
      const resp = await placeOrder();
      Alert.alert('Order placed', `Order #${resp?.id || 'created'}`);
    } catch (e) {
      Alert.alert('Error', 'Failed placing order');
    } finally {
      setLoading(false);
    }
  }

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (items.length === 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.04, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ transform: [{ scale: pulse }], marginBottom: 18 }}>
          <TouchableOpacity onPress={() => nav.navigate('Menu')}>
            <View style={{ height: 120, width: 120, borderRadius: 60, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="cart" size={48} color={theme.colors.primary} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>
          Your cart is empty
        </Text>

        <TouchableOpacity
          onPress={() => nav.navigate('Menu')}
          style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 10, marginTop: 16 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16,paddingTop:50, backgroundColor: theme.colors.background }}>
      <Text style={{ fontSize: 28, marginBottom: 20, color: theme.colors.text, textAlign: 'center' }}>
        Cart
      </Text>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
  
  <View
    style={{
      flexDirection: 'row',          // 👈 horizontal layout
      padding: 12,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      alignItems: 'center',
    }}
  >
    {/* LEFT: Product Image */}
    <Image
      source={resolveImage(item.image)}
      style={{
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 12,
      }}
      resizeMode="cover"
    />

    {/* RIGHT: Product Info */}
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
        }}
        numberOfLines={2}
      >
        {item.name}
      </Text>

      <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
        Quantity: {item.quantity}
      </Text>
      {/* Quantity Stepper */}
<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  }}
>
  {/* Minus */}
  <TouchableOpacity
  onPress={() => decreaseQuantity(item.id, item.addons)}
    style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>
      −
    </Text>
  </TouchableOpacity>

  {/* Quantity */}
  <Text
    style={{
      marginHorizontal: 12,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      minWidth: 20,
      textAlign: 'center',
    }}
  >
    {item.quantity}
  </Text>

  {/* Plus */}
  <TouchableOpacity
  onPress={() => increaseQuantity(item.id, item.addons)}

    style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
      +
    </Text>
  </TouchableOpacity>
</View>


      <Text style={{ color: theme.colors.text, marginTop: 4 }}>
        Subtotal:{' '}
        {formatPrice(
          (getPriceOf(item) +
            (item.addons || []).reduce(
              (a: number, x: any) => a + getPriceOf(x),
              0
            )) * item.quantity
        )}
      </Text>

      <GlassButton
        title="Remove"
onPress={() => removeFromCart(item.id, item.addons)}
        style={{ marginTop: 8, alignSelf: 'flex-start', backgroundColor: theme.colors.primary }}
      />
    </View>
  </View>

        )}
      />
    
      <Text style={{ fontSize: 18, color: theme.colors.text }}>
        Total: {formatPrice(total)}
      </Text>

      <GlassButton
        title={loading ? 'Placing...' : 'Place Order'}
        onPress={onPlace}
        style={{ marginTop: 8, backgroundColor: theme.colors.primary }}
      />
    </View>
  );
};
