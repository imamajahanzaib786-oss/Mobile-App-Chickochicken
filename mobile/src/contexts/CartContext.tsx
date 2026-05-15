// 
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { placeOrder as apiPlaceOrder, fetchOrders as apiFetchOrders } from '../utils/api';
import { useAuthStore } from '../stores/useAuthStore'; // ✅ ZUSTAND AUTH

type Addon = {
  id: string | number;
  name: string;
  price?: number;
  basePrice?: number;
  quantity?: number;
  image?: string;
};

type MenuItem = {
  id: number | string;
  name: string;
  price?: number;
  basePrice?: number;
  description?: string;
  addons?: Addon[];
  availableAddOns?: Addon[];
  image?: string;
  imageUrl?: string;
};

type CartItem = MenuItem & {
  quantity: number;
  addons?: Addon[];
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (item: MenuItem, addons?: Addon[]) => void;
  removeFromCart: (id: string | number, addons?: Addon[]) => void;
  clearCart: () => void;
  placeOrder: () => Promise<any>;
  orders: any[];
  increaseQuantity: (id: string | number, addons?: Addon[]) => void;
  decreaseQuantity: (id: string | number, addons?: Addon[]) => void;

  refreshOrders: () => Promise<void>;
  addOrUpdateOrder: (order: any) => void;
  showMessage: (msg: string) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ AUTH FROM ZUSTAND
  const user = useAuthStore((s) => s.user);
  const openAuth = useAuthStore((s) => s.openAuth);

  function addonsKey(addons?: Addon[]) {
    if (!addons || addons.length === 0) return '';
    return addons
      .map((a) => `${String(a.id)}:${Number(a.quantity || 1)}`)
      .sort()
      .join(',');
  }

  function addToCart(item: MenuItem, addons?: Addon[]) {
    setItems((s) => {
      const key = addonsKey(addons);
      const existing = s.find(
        (i) =>
          String(i.id) === String(item.id) &&
          addonsKey(i.addons) === key
      );

      if (existing) {
        return s.map((i) =>
          String(i.id) === String(item.id) &&
          addonsKey(i.addons) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...s, { ...item, quantity: 1, addons: addons || [] }];
    });

    showMessage(`${item.name} added to cart`);
  }

 function removeFromCart(id: string | number, addons?: Addon[]) {
  setItems((s) =>
    s.filter(
      (i) =>
        !(
          String(i.id) === String(id) &&
          addonsKey(i.addons) === addonsKey(addons)
        )
    )
  );
}

function increaseQuantity(id: string | number, addons?: Addon[]) {
  setItems((s) =>
    s.map((i) => {
      const keyToMatch = addonsKey(addons ?? i.addons);
      return String(i.id) === String(id) &&
        addonsKey(i.addons) === keyToMatch
        ? { ...i, quantity: i.quantity + 1 }
        : i;
    })
  );
}

function decreaseQuantity(id: string | number, addons?: Addon[]) {
  setItems((s) =>
    s
      .map((i) => {
        const keyToMatch = addonsKey(addons ?? i.addons);
        return String(i.id) === String(id) &&
          addonsKey(i.addons) === keyToMatch
          ? { ...i, quantity: i.quantity - 1 }
          : i;
      })
      .filter((i) => i.quantity > 0)
  );
}



  function clearCart() {
    setItems([]);
  }

  async function doPlaceOrder() {
    const itemsDTO = items.map((item) => ({
      menuItemId: Number(item.id),
      quantity: item.quantity,
      size: '',
      addOns: (item.addons || []).map((a) => ({
        id: Number((a as any).id),
        quantity: Number((a as any).quantity || 1),
      })),
      AddOns: (item.addons || []).map((a) => ({
        id: Number((a as any).id),
        quantity: Number((a as any).quantity || 1),
      })),
    }));

    const payload = {
      items: itemsDTO,
      deliveryMethod: 'pickup',
    };

    console.log('Placing order with items', payload);

    const resp = await apiPlaceOrder(payload, user?.accessToken);

    clearCart();

    try {
      await refreshOrders();
    } catch {
      if (resp) setOrders((o) => [resp, ...o]);
    }

    return resp;
  }

  async function placeOrder() {
    if (!user) {
      openAuth(() => {
        void doPlaceOrder();
      });
      return null;
    }

    return await doPlaceOrder();
  }

  async function refreshOrders() {
    if (!user?.accessToken) return;

    try {
      const resp = await apiFetchOrders(user.accessToken);
      setOrders(resp || []);
  

    } catch (e) {
      console.warn('refreshOrders failed', e);
    }
  }

  // Initial load
  useEffect(() => {
    void refreshOrders();
  }, []);

  // React to login / logout
  useEffect(() => {
    if (user?.accessToken) {
      void refreshOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  function addOrUpdateOrder(order: any) {
    setOrders((s) => {
      const idx = s.findIndex((o) => String(o.id) === String(order.id));
      if (idx === -1) return [order, ...s];
      const copy = [...s];
      copy[idx] = order;
      return copy;
    });
  }

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        placeOrder,
        orders,
         increaseQuantity,
    decreaseQuantity,
        refreshOrders,
        addOrUpdateOrder,
        showMessage,
      }}
    >
      {children}
      {message && (
        <View style={styles.toastContainer} pointerEvents="box-none">
          <View style={styles.toast}>
            <Text style={styles.toastText}>{message}</Text>
          </View>
        </View>
      )}
    </CartContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  toastText: {
    color: '#fff',
  },
});

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
