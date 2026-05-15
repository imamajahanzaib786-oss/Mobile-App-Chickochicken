import * as signalR from '@microsoft/signalr';
import Constants from 'expo-constants';

const extras = (Constants as any).manifest?.extra || {};
const DEFAULT_SIGNALR_URL = extras.SIGNALR_URL || 'https://food-server-k957.onrender.com/order';

let connection: signalR.HubConnection | null = null;

export async function startSignalRConnection(url?: string) {
  const endpoint = url || DEFAULT_SIGNALR_URL;
  if (connection) return connection;

  // Try normal start (will perform negotiation). If negotiation fails (network/CORS),
  // fall back to WebSocket-only connection using skipNegotiation.
  const build = (opts?: signalR.IHttpConnectionOptions) => {
    const builder = new signalR.HubConnectionBuilder().withAutomaticReconnect();
    return opts ? builder.withUrl(endpoint, opts).build() : builder.withUrl(endpoint).build();
  };

  connection = build();
  try {
    await connection.start();
    console.info('SignalR connected to', endpoint);
    return connection;
  } catch (err: any) {
    console.warn('SignalR initial start failed, attempting WebSocket-only fallback', err?.message || err);
    try {
      connection = build({ skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets });
      await connection.start();
      console.info('SignalR connected (WebSocket-only) to', endpoint);
      return connection;
    } catch (err2) {
      console.warn('SignalR fallback also failed', err2);
      connection = null;
      throw err2;
    }
  }
}

export function getConnection() {
  return connection;
}

export function subscribeNewOrder(handler: (payload: any) => void) {
  connection?.on('NewOrder', handler);
}

export function unsubscribeNewOrder(handler: (payload: any) => void) {
  connection?.off('NewOrder', handler);
}

export function subscribeOrderUpdated(handler: (payload: any) => void) {
  connection?.on('OrderUpdated', handler);
}

export function unsubscribeOrderUpdated(handler: (payload: any) => void) {
  connection?.off('OrderUpdated', handler);
}
