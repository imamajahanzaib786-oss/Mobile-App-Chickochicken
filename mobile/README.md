# ChickoChicken Mobile (Expo)

This folder contains an Expo React Native scaffold mirroring the web app features.

Quick start

```bash
cd mobile
npm install
npx expo start
```

Notes
- API base URL and SignalR URL are configured in `app.json` under `expo.extra` (`API_BASE_URL`, `SIGNALR_URL`). Update them for your backend.
- This scaffold provides basic screens (`Menu`, `Cart`, `Orders`) and utilities in `src/utils`.
- To use React Navigation fully on native, follow React Navigation docs and install native dependencies as needed:

```bash
npx expo install react-native-screens react-native-safe-area-context
npm install @react-navigation/native @react-navigation/native-stack
```

SignalR
- `@microsoft/signalr` works in React Native; ensure your backend hub allows WebSocket transport and CORS.

Next steps
- Port UI components from the web `src/components` into RN equivalents (use `react-native` or a UI kit).
- Implement cart state and order placement logic in `src/App.tsx` or a context provider.
- Optionally share code between web and mobile by extracting business logic into a shared package.
