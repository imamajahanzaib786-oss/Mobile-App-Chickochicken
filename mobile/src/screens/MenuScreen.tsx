
import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMenu } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { CATEGORIES } from '../utils/constants';

import { useTheme } from '../hooks/useTheme'; // ✅ Zustand theme
import { ItemCard } from '../ui/item';
/* =======================
   MENU SCREEN
======================= */
export const MenuScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme(); 
  const { addToCart } = useCart();
  const [menu, setMenu] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchMenu()
      .then((items) => setMenu(items || []))
      .catch((e) => console.warn('Failed to fetch menu', e));
  }, []);

  const categoryOrder: Record<string, number> = CATEGORIES.reduce((acc, cat, idx) =>
     { acc[cat] = idx; return acc; }, {} as Record<string, number>); 
  const sortedMenu = [...menu].sort((a, b) => 
    { const catA = a.category || 'Other'; const catB = b.category || 'Other'; 
    return (categoryOrder[catA] ?? 999) - (categoryOrder[catB] ?? 999); }); 
    const filteredMenu = activeCategory === 'All' ? sortedMenu : menu.filter((m) => 
        (m.category || 'Other') === activeCategory);
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}>
    
  <View
    style={{
      paddingTop: 48,
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
    }}
  >
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
      }}
    >
      Menu
    </Text>

  </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
          style={{
                marginTop: 10,
                paddingVertical: 8,
                height: 56,
                marginBottom: 30,
                
              }}
          key={c} onPress={() => setActiveCategory(c)}>
            <View
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor:
                  activeCategory === c ? theme.colors.primary : theme.colors.glass,
                marginRight: 8,
              }}
            >
              <Text style={{ color: activeCategory === c ? '#fff' : theme.colors.text }}>
                {c}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemCard item={item} onAdd={addToCart} theme={theme} />
        )}
      />
    </View>
  );
};

