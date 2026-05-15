import React from 'react';
import { Image, View, StyleSheet, ImageProps } from 'react-native';
import theme from '../ui/theme';
import { assetsMap } from '../assetsMap';

export const RemoteImage = ({ source, style, ...rest }: ImageProps & { source: any }) => {
  // Support local assets by passing a string like 'assets/chicken.png'.
  // Add the mapping in `src/assetsMap.ts` (map filename -> require('../../assets/...')).
  if (typeof source === 'string' && source.startsWith('assets/')) {
    const key = source.replace(/^assets\//, '');
    const mod = assetsMap[key];
    if (mod) return <Image source={mod} style={[styles.image, style] as any} {...rest} />;
    // fall through to placeholder if mapping missing
    return (
      <View style={[styles.container, style] as any}>
        <View style={[styles.placeholder, style] as any} />
      </View>
    );
  }

  const uri = typeof source === 'string' ? source : source?.uri;
  return (
    <View style={[styles.container, style] as any}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, style] as any} {...rest} />
      ) : (
        <View style={[styles.placeholder, style] as any} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});

export default RemoteImage;
