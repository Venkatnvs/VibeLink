import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import postsReducer from './slices/postsSlice'
import chatReducer from './slices/chatSlice'
import socialReducer from './slices/socialSlice'
import emailNotificationsReducer from './slices/emailNotificationsSlice'
import settingsReducer from './slices/settingsSlice'
import searchReducer from './slices/searchSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
}

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    posts: postsReducer,
    chat: chatReducer,
    social: socialReducer,
    emailNotifications: emailNotificationsReducer,
    settings: settingsReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
