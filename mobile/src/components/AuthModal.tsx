import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Constants from 'expo-constants';
import theme from '../ui/theme';
import { useAuthStore } from '../stores/useAuthStore';

const extras = (Constants as any).manifest?.extra || {};
const API_BASE =
  extras.API_BASE_URL || 'https://food-server-k957.onrender.com';

export default function AuthModal() {
  // ✅ AUTH FROM ZUSTAND
  const showAuth = useAuthStore((s) => s.showAuth);
  const closeAuth = useAuthStore((s) => s.closeAuth);
  const login = useAuthStore((s) => s.login);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    setLoading(true);

    try {
      // 🔹 Signup (if needed)
      if (mode === 'signup') {
        const signupRes = await fetch(`${API_BASE}/api/Auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, phone }),
        });

        if (!signupRes.ok) {
          const err = await signupRes.json();
          throw new Error(err?.message || 'Signup failed');
        }
      }

      // 🔹 Login
      const res = await fetch(`${API_BASE}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok && !data?.success) {
        throw new Error(data?.message || 'Login failed');
      }

      const token =
        data?.data?.token?.result ??
        data?.data?.token ??
        data?.token ??
        null;

      if (!token) {
        throw new Error('No token received');
      }

      const userName =
        data?.data?.user?.fullName ||
        name ||
        email.split('@')[0];

      // ✅ LOGIN VIA ZUSTAND (runs pending actions automatically)
      await login({
        accessToken: token,
        name: userName,
        email,
      });
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={showAuth}
      transparent
      animationType="fade"
      onRequestClose={closeAuth}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {mode === 'signup' && (
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          )}

          {mode === 'signup' && (
            <TextInput
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
          )}

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            style={{ marginTop: 8 }}
          >
            <Text
              style={{
                color: theme.colors.primary,
                textAlign: 'center',
              }}
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={closeAuth} style={{ marginTop: 12 }}>
            <Text
              style={{
                color: theme.colors.muted,
                textAlign: 'center',
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: theme.colors.background,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 6,
  },
});
