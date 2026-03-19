import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import { apiSlice } from "./api-slice";
import configuratorSlice from "./slices/configurator/slice";
import customersSlice from "./slices/customers/slice";
import myOrdersSlice from "./slices/my-orders/slice";
import quotationSummarySlice from "./slices/quotation-summary/slice";
import quotesSlice from "./slices/quotes/slice";
import rootSlice from "./slices/root/slice";

const allReducers = combineReducers({
  root: rootSlice,
  myOrders: myOrdersSlice,
  quotes: quotesSlice,
  configurator: configuratorSlice,
  quotationSummary: quotationSummarySlice,
  customers: customersSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["configurator", "quotes", "quotationSummary"],
};

const persistedReducer = persistReducer(persistConfig, allReducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: [
          apiSlice.reducerPath,
        ],
        ignoredActionPaths: ["payload", "meta"],
      },
    }).concat(apiSlice.middleware),
});

// enable listener behavior for the store
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const persistor = persistStore(store);

export { store, persistor };
