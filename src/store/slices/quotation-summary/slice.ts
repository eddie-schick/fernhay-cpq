import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { RootState } from "~/store";

type SliceInitState = {
  isSameAsDestinationAddressSelected: boolean;
  isCustomerInfoFormSaved: boolean;
};

const initialState: SliceInitState = {
  isSameAsDestinationAddressSelected: false,
  isCustomerInfoFormSaved: true,
};
const quotationSummarySlice = createSlice({
  name: "quotationSummary",
  initialState,
  reducers: {
    setIsSameAsDestinationAddressSelected: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isSameAsDestinationAddressSelected = action.payload;
    },
    setIsCustomerInfoFormSaved: (state, action: PayloadAction<boolean>) => {
      state.isCustomerInfoFormSaved = action.payload;
    },
  },
});

export const {
  setIsSameAsDestinationAddressSelected,
  setIsCustomerInfoFormSaved,
} = quotationSummarySlice.actions;
export default quotationSummarySlice.reducer;
export const quotationSummarySelector = (state: RootState) =>
  state.quotationSummary;
