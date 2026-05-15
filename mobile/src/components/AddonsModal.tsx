import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../ui/theme';
import GlassButton from './GlassButton';
import RemoteImage from './RemoteImage';
import * as Haptics from 'expo-haptics';

export default function AddonsModal({
  visible,
  item,
  onClose,
  onAdd,
}: {
  visible: boolean;
  item: any;
  onClose: () => void;
  onAdd: (item: any, addons: any[]) => void;
}) {
  const [selected, setSelected] = useState<any[]>([]);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // load last selection
      (async () => {
        try {
          const raw = await AsyncStorage.getItem(`last_addons_${item.id}`);
          if (raw) setSelected(JSON.parse(raw));
        } catch (e) {
          // ignore
        }
      })();
      Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [visible]);

  function changeQty(a: any, delta: number) {
    setSelected((s) => {
      const found = s.find((x) => String(x.id) === String(a.id));
      if (!found && delta > 0) return [...s, { ...a, quantity: 1 }];
      return s.map((x) => (String(x.id) === String(a.id) ? { ...x, quantity: Math.max(0, (x.quantity || 0) + delta) } : x)).filter((x) => (x.quantity || 0) > 0);
    });
  }

  function getPriceOf(o: any) {
    return Number(o?.basePrice ?? o?.price ?? 0);
  }

  const addonsTotal = useMemo(() => selected.reduce((s, a) => s + getPriceOf(a) * (a.quantity || 1), 0), [selected]);

  const base = getPriceOf(item);

  async function handleAdd() {
    try {
      await AsyncStorage.setItem(`last_addons_${item.id}`, JSON.stringify(selected));
    } catch (e) {
      // ignore
    }
    try {
      await Haptics.selectionAsync();
    } catch (e) {}
    onAdd(item, selected);
    setSelected([]);
    onClose();
  }

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });

  return (
    <Modal visible={visible} animationType="none" onRequestClose={onClose} transparent>
      <View style={styles.modalBackdrop}>
        <Animated.View style={[styles.container, { opacity: anim, transform: [{ translateY }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.description}</Text>
          </View>

          <Text style={styles.section}>Choose add-ons</Text>
          <FlatList
            data={item.availableAddOns || item.addons || []}
            keyExtractor={(a) => String(a.id)}
            renderItem={({ item: a }) => {
              const found = selected.find((x) => String(x.id) === String(a.id));
              const qty = found?.quantity || 0;
              // tapping the row toggles between qty 0 and 1
              return (
                <TouchableOpacity onPress={() => (qty > 0 ? changeQty(a, -qty) : changeQty(a, +1))} style={[styles.addonRow, qty > 0 && styles.addonRowSel]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {a.image || a.imageUrl ? (
                      <RemoteImage source={a.image || a.imageUrl} style={styles.addonImageWrap as any} />
                    ) : null}
                    <View style={{ marginLeft: 8 }}>
                      <Text style={[styles.addonText, qty > 0 && styles.addonTextSel]}>{a.name}</Text>
                      <Text style={styles.addonPrice}>{getPriceOf(a) ? `£${getPriceOf(a).toFixed(2)}` : ''}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => changeQty(a, -1)} style={styles.qtyBtn} accessibilityLabel="decrease-qty"><Text style={styles.qtyText}>-</Text></TouchableOpacity>
                    <Text style={[styles.qtyText, { marginHorizontal: 8 }]}>{qty}</Text>
                    <TouchableOpacity onPress={() => changeQty(a, +1)} style={styles.qtyBtn} accessibilityLabel="increase-qty"><Text style={styles.qtyText}>+</Text></TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.summary}>
            <Text style={styles.summaryText}>Base: £{base.toFixed(2)}</Text>
            <Text style={styles.summaryText}>Add-ons: £{addonsTotal.toFixed(2)}</Text>
            <Text style={styles.summaryTotal}>Total: £{(base + addonsTotal).toFixed(2)}</Text>
            <View style={{ marginTop: 10 }}>
              <GlassButton title="Add to cart" style={{ backgroundColor: theme.colors.primary }} onPress={handleAdd} />
            </View>
            <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  container: { backgroundColor: theme.colors.background, padding: 16, maxHeight: '85%', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  header: { marginBottom: 12 },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  subtitle: { color: theme.colors.muted, marginTop: 4 },
  section: { color: theme.colors.text, marginTop: 6, marginBottom: 8 },
  addonRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 10, backgroundColor: theme.colors.surface, marginBottom: 8, alignItems: 'center' },
  addonRowSel: { backgroundColor: 'rgba(255,255,255,0.06)' },
  addonText: { color: theme.colors.text },
  addonTextSel: { color: theme.colors.accent },
  addonPrice: { color: theme.colors.muted },
  summary: { marginTop: 12, padding: 12 },
  summaryText: { color: theme.colors.text },
  summaryTotal: { color: theme.colors.primary, fontSize: 18, fontWeight: '700', marginTop: 6 },
  cancel: { color: theme.colors.muted, textAlign: 'center' },
  qtyBtn: { padding: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.02)' },
  qtyText: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  addonImageWrap: { width: 44, height: 44, borderRadius: 8, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
});
