import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { CustomerSchema } from "~/global/types/types";

import { RootState } from "~/store";
import { extendedApiSlice as customersApiSlice } from "~/store/endpoints/customers/customers";

type CustomersSliceInitialState = {
  customers: CustomerSchema[];
};
const initialState: CustomersSliceInitialState = {
  customers: [],
};
const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<CustomerSchema[]>) => {
      state.customers = action.payload;
    },
    addCustomer: (state, action: PayloadAction<CustomerSchema>) => {
      state.customers = [...state.customers, action.payload];
    },
    updateCustomer: (
      state,
      action: PayloadAction<{
        customerId: string | number;
        updatedData: CustomerSchema;
      }>,
    ) => {
      const { customerId, updatedData } = action?.payload || {};
      state.customers = state.customers.map((v) =>
        v?.id !== customerId ? v : updatedData,
      );
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      customersApiSlice.endpoints.getCustomers.matchFulfilled,
      (state, action) => {
        state.customers = action.payload.data;
      },
    );
  },
});

export const { setCustomers, addCustomer, updateCustomer } =
  customersSlice.actions;
export default customersSlice.reducer;
export const customersSelector = (state: RootState) => state.customers;
