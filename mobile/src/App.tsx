import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MenuScreen } from './screens/MenuScreen';
import { CartScreen } from './screens/CartScreen';
import { OrderHistoryScreen } from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CartProvider, useCart } from './contexts/CartContext';
import AuthModal from './components/AuthModal';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';
import { startSignalRConnection, subscribeNewOrder, subscribeOrderUpdated } from './utils/signalr';
import { useAuthStore } from './stores/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './contexts/AuthContext';

export type RootStackParamList = {
  Menu: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

export default function App() {
  function SignalRSubscriber() {
    const { addOrUpdateOrder, refreshOrders } = useCart();
useEffect(() => {
  AsyncStorage.getItem('@auth_user').then((stored) => {
    if (stored) {
      useAuthStore.setState({ user: JSON.parse(stored) });
    }
  });
}, []); 
    useEffect(() => {
      let mounted = true;
      startSignalRConnection().then(() => {
        subscribeNewOrder((payload: any) => {
          const order = payload?.data || payload;
          if (mounted) addOrUpdateOrder(order);
        });
        subscribeOrderUpdated((payload: any) => {
          const order = payload?.data || payload;
          if (mounted) addOrUpdateOrder(order);
        });
      }).catch((e) => console.warn('SignalR start failed', e));

      // initial orders load
      refreshOrders();

      return () => {
        mounted = false;
      };
    }, []);

    return null;
  }
  function InnerApp() {
    const { mode } = useThemeMode();
    const barColor = mode === 'dark' ? '#111827' : '#ffffff';
    const tint = mode === 'dark' ? '#e0a2127a' : '#e6a387ff';
    const tintActive = mode === 'dark' ? '#fff' : '#f14a02ff';

    
    const statusBarStyle = mode === 'dark' ? 'light' : 'dark';

    return (
      <>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Menu"
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: tintActive,
              tabBarInactiveTintColor: tint,
              tabBarStyle: { backgroundColor: barColor },
              tabBarIcon: ({ color, size }) => {
                let name: any = 'home';
                if (route.name === 'Cart') name = 'cart';
                else if (route.name === 'Orders') name = 'list';
                else if (route.name === 'Profile') name = 'person';
                return <Ionicons name={name} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Home' }} />
            <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
            <Tab.Screen name="Orders" component={OrderHistoryScreen} options={{ title: 'Orders' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
          </Tab.Navigator>
        </NavigationContainer>
        <SignalRSubscriber />
        <AuthModal />
        <StatusBar style={statusBarStyle as any} />
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
              <AuthProvider>

        <CartProvider>
          <InnerApp />
        </CartProvider>
          </AuthProvider>

      </ThemeProvider>
    </SafeAreaProvider>
  );
}
