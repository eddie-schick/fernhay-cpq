import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { SettingSchema } from "~/global/types/types";

import { RootState } from "~/store";
import { extendedApiSlice as settingsApiSlice } from "~/store/endpoints/misc/misc";

type RootSliceInitialState = {
  drawerState: boolean;
  appSettings: SettingSchema | null;
  is3dModelAnimationPlaying: boolean;
  allowPlaying3dModelAnimations: boolean;
};
const initialState: RootSliceInitialState = {
  drawerState: false,
  appSettings: null,
  is3dModelAnimationPlaying: false,
  allowPlaying3dModelAnimations: false,
};
const rootSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    setIs3dModelAnimationPlaying: (state, action: PayloadAction<boolean>) => {
      state.is3dModelAnimationPlaying = action.payload;
    },
    setAllowPlaying3dModelAnimations: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.allowPlaying3dModelAnimations = action.payload;
    },
    setDrawerState: (state, action: PayloadAction<boolean>) => {
      state.drawerState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      settingsApiSlice.endpoints.getAppSettings.matchFulfilled,
      (state, action) => {
        state.appSettings = action.payload?.data;
      },
    );
  },
});

export const {
  setIs3dModelAnimationPlaying,
  setAllowPlaying3dModelAnimations,
  setDrawerState,
} = rootSlice.actions;
export default rootSlice.reducer;
export const rootSelector = (state: RootState) => state.root;
