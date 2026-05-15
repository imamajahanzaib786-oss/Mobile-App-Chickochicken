import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import theme from '../ui/theme';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '../contexts/ThemeContext';
import { useTheme } from 'src/hooks/useTheme';
import { useAuthStore } from '../stores/useAuthStore';
export default function ProfileScreen() {
const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.logout);
  const openAuth = useAuthStore((s) => s.openAuth);

  const { mode, toggle } = useThemeMode();
  const theme = useTheme();
  function initials(name?: string) {
    if (!name) return 'U';
    return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.colors.background }}>
      <View style={{ alignItems: 'center', marginTop: 30 }}>
        <View style={{ height: 96, width: 96, borderRadius: 48, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 28, color: theme.colors.primary, fontWeight: '700' }}>{initials(user?.name ?? user?.email)}</Text>
        </View>
        <Text style={{ color: theme.colors.text, fontSize: 18, marginTop: 12 }}>{user?.name ?? 'Guest'}</Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{user?.email ?? 'Not signed in'}</Text>
      </View>

      <View style={{ marginTop: 30 }}>
        <View style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="theme-light-dark" size={18} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, marginLeft: 10 }}>Theme</Text>
          </View>
          <Switch value={mode === 'dark'} onValueChange={toggle} thumbColor={mode === 'dark' ? theme.colors.primary : '#fff'} trackColor={{ true: theme.colors.primary, false: 'rgba(255,255,255,0.08)' }} />
        </View>
        {user ? (
          <>
            <TouchableOpacity onPress={signOut} style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="logout" size={18} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, marginLeft: 10 }}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="account-cog" size={18} color={theme.colors.muted} />
              <Text style={{ color: theme.colors.text, marginLeft: 10 }}>Account Settings</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => openAuth()} style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openAuth()} style={{ backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
