import { configureStore } from '@reduxjs/toolkit';

export function createAppStore() {
  return configureStore({ reducer: {} });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
