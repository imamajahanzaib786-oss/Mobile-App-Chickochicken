import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMenu } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import GlassButton from '../components/GlassButton';
import AddonsModal from '../components/AddonsModal';
import { resolveImage } from '../utils/resolveImage';
import { CATEGORIES } from '../utils/constants';

import { useTheme } from '../hooks/useTheme'; // ✅ Zustand theme

/* =======================
   ITEM CARD
======================= */
export const ItemCard = ({ item, onAdd, theme }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [lastSelection, setLastSelection] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(`last_addons_${item.id}`);
        if (raw) setLastSelection(JSON.parse(raw));
      } catch {}
    })();
  }, [item.id]);

  function getPriceOf(obj: any) {
    return Number(obj?.basePrice ?? obj?.price ?? obj?.unitPrice ?? 0);
  }

  return (
    <View
      style={{
        padding: 12,
        borderRadius: 14,
        backgroundColor: theme.colors.surface,
        marginBottom: 12,
        overflow: 'hidden',
        ...theme.shadow,
      }}
    >
      <View
        style={{
          width: '100%',
          height: 180,
          borderRadius: 12,
          marginBottom: 18,
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
        }}
      >
        <Image
          source={resolveImage(item.image)}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, color: theme.colors.text, flex: 1 }}>
          {item.name}
        </Text>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Price: {formatPrice(getPriceOf(item))}
          </Text>
        </View>
      </View>

      <Text style={{ color: theme.colors.muted, marginTop: 12 }}>
        {item.description}
      </Text>

      <View style={{ marginTop: 14 }}>
        <GlassButton
          title="Add to Cart"
          style={{backgroundColor:theme.colors.primary}}
          onPress={() => {
            if (item.availableAddOns || item.addons) setModalVisible(true);
            else onAdd(item, []);
          }}
        />
      </View>

      <AddonsModal
        visible={modalVisible}
        item={item}
        onClose={() => setModalVisible(false)}
        onAdd={(i, addons) => {
          onAdd(i, addons);
          setLastSelection(addons);
        }}
      />
    </View>
  );
};

function formatPrice(p?: number | string) {
  const n = Number(p);
  return isNaN(n) ? '' : `£${n.toFixed(2)}`;
}
