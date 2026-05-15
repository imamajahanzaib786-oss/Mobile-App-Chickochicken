import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import theme from '../ui/theme';

export const GlassButton = ({ title, onPress, style }: { title: string; onPress?: () => void; style?: ViewStyle }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.btn, style] as any}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: theme.colors.glass,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...theme.shadow,
  },
  text: {
    color: theme.colors.text_btn,
    fontWeight: '600',
  },
});

export default GlassButton;
