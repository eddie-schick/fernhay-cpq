/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

import { ThemeColors } from "~/global/types/types";

export type ThemeOptions = {
  colors?: Optional<ThemeColors>;
};
type InitialValuesType = object;
export const initialValue: InitialValuesType = {};

export const GlobalThemeContext = createContext(initialValue);

export const useGlobalThemeContextValue = () => useContext(GlobalThemeContext);
