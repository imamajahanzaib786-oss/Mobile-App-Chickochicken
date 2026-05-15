import Constants from 'expo-constants';

const extras = (Constants as any).manifest?.extra || {};
const API_BASE = extras.API_BASE_URL || 'https://food-server-k957.onrender.com';

export async function fetchMenu() {
  const res = await fetch(`${API_BASE}/api/Menu`);
  if (!res.ok) throw new Error('Failed fetching menu');
  const data = await res.json();
  return data?.data || data;
}

export async function fetchOrders(token?: string) {
//   const res = await fetch(`${API_BASE}/api/Orders`);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}/api/orders/history`, {
      headers,
    });
  //console.log('order response',     response);

  if (!response.ok) throw new Error('Failed fetching orders');
  const data = await response.json();
  return data?.data || data;
}

export async function placeOrder(payload: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/Orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  // Read raw text then try to parse JSON — some RN environments or servers
  // may return compressed responses that `res.json()` can fail on.
  let rawText: string | null = null;
  try {
    rawText = await res.text();
  } catch (e) {
    // fallback: try to read blob and convert if available
    try {
      const blob: any = (res as any)._bodyBlob || (res as any).blob && await (res as any).blob();
      rawText = blob ? String(blob) : null;
    } catch (_) {
      rawText = null;
    }
  }

  let data: any = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      // not JSON — keep rawText
      data = rawText;
    }
  }

  if (!res.ok) {
    const errMsg = typeof data === 'string' ? data : (data?.message || JSON.stringify(data));
    throw new Error(`placeOrder failed: ${res.status} ${errMsg}`);
  }

  return data?.data || data;
}
