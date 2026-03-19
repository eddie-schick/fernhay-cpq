import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { RootState } from "~/store";

export const SelectedGroupByValueEntitiesFieldName = {
  UPFIT: "upfit",
  CHARGER: "charger",
  SHELVING: "shelving",
} as const;
export type SelectedGroupByValueEntitiesFieldNamesType =
  (typeof SelectedGroupByValueEntitiesFieldName)[keyof typeof SelectedGroupByValueEntitiesFieldName];

export type SelectedGroupByValueType = Record<
  SelectedGroupByValueEntitiesFieldNamesType,
  string
>;
export type ConfigurationOptionsTabValuesType =
  | "quantity"
  | "paint"
  | "powertrain"
  | "chassis"
  | "dashboard"
  | "upfit"
  | "shelving"
  | "accessories"
  | "charger";
export const headingInUiToTabValueMap = {
  "order quantity": "quantity",
  paint: "paint",
  // battery: "powertrain",
  battery: "battery",
  chassis: "chassis",
  dashboard: "dashboard",
  upfit: "upfit",
  shelving: "shelving",
  accessories: "accessories",
  charger: "charger",
} as const;
export const tabValueToHeadingUiMap = Object.fromEntries(
  Object.entries(headingInUiToTabValueMap)?.map(([key, value]) => [value, key]),
);

type SliceInitState = {
  selectedTab: string;
  selectedGroupByValue: null | SelectedGroupByValueType;
};

const initialState: SliceInitState = {
  selectedTab: "quantity",
  selectedGroupByValue: null,
};
const configuratorSlice = createSlice({
  name: "configurator",
  initialState,
  reducers: {
    setSelectedTab: (state, action: PayloadAction<string>) => {
      state.selectedTab = action.payload;
    },
    setSelectedGroupByValue: (
      state,
      action: PayloadAction<{
        fieldName: SelectedGroupByValueEntitiesFieldNamesType;
        value: string;
      }>,
    ) => {
      const fieldName = action.payload.fieldName;
      const value = action.payload.value;

      if (!state.selectedGroupByValue) {
        state.selectedGroupByValue = {
          [fieldName]: value,
        } as SelectedGroupByValueType;

        return;
      }

      state.selectedGroupByValue[action.payload.fieldName] =
        action.payload.value;
    },
    resetSelectedGroupByValue: (state) => {
      state.selectedGroupByValue = null;
    },
  },
});

export const {
  setSelectedTab,
  setSelectedGroupByValue,
  resetSelectedGroupByValue,
} = configuratorSlice.actions;
export default configuratorSlice.reducer;
export const configuratorSelector = (state: RootState) => state.configurator;
export const selectedGroupByValueSelector = (state: RootState) =>
  state.configurator.selectedGroupByValue;
