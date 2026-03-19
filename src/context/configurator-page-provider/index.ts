import { createContext, useContext } from "react";

import { Vehicle } from "~/global/types/kontent-ai";
import { ColorPickerSectionOptionSchema } from "~/global/types/types";

import { GetSingleVehicleQueryResultType } from "~/store/endpoints/vehicles/vehicles";
import { NewQuoteShape } from "~/store/slices/quotes/types";

export type GroupTypeForUpdate = {
  id: string | number;
  quantity: number | string;
  name: string;
};

type InitialValuesType = {
  newQuoteById?: NewQuoteShape;
  selectedGroup?: NewQuoteShape["groups"][number];
  getVehicleQueryState?: GetSingleVehicleQueryResultType;
  vehicleItemKontentAi?: Vehicle;
  paintTypeOptions: ColorPickerSectionOptionSchema[];

  onQuantityChange: (group: GroupTypeForUpdate, quantity: number) => void;
  onPaintColorChange: (
    colorOption: ColorPickerSectionOptionSchema | undefined,
    group: GroupTypeForUpdate,
  ) => void;
};
export const initialValue: InitialValuesType = {
  paintTypeOptions: [],
  onQuantityChange: () => {},
  onPaintColorChange: () => {},
};

export const ConfiguratorPageContext = createContext(initialValue);

export const useConfiguratorPageContextValue = () =>
  useContext(ConfiguratorPageContext);
