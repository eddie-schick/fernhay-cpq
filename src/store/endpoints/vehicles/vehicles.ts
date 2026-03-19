import { TypedUseQueryHookResult } from "@reduxjs/toolkit/query/react";

import { VehicleSchema, WeightUnit } from "~/global/types/types";

import { AxiosBaseQueryFnType, apiSlice } from "~/store/api-slice";

import vehiclesData from "~/data/vehicles.json";

import {
  GetSingleVehicleQueryArgType,
  GetSingleVehicleQueryReturnType,
} from "./types";

// Vehicle config JSON files keyed by vehicle ID
// Add new vehicles here as you create their config JSON files
const vehicleConfigModules: Record<string, () => Promise<unknown>> = {
  "vehicle-fernhay-eav-standard-box": () => import("~/data/vehicle-configs/fernhay_eav_standard_box.json"),
  "vehicle-fernhay-eav-reefer": () => import("~/data/vehicle-configs/fernhay_eav_reefer.json"),
  "vehicle-fernhay-eav-kiosk": () => import("~/data/vehicle-configs/fernhay_eav_kiosk.json"),
  "vehicle-fernhay-eav-flatbed": () => import("~/data/vehicle-configs/fernhay_eav_flatbed.json"),
};

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query<Partial<VehicleSchema>[], void>({
      async queryFn() {
        try {
          const response = vehiclesData as typeof vehiclesData;

          const options: Partial<VehicleSchema>[] =
            response?.data?.items?.[0]?.elements?.vehicle?.linkedItems?.map(
              (item) => {
                const vehicleModel = item?.elements?.model?.value?.[0];

                return {
                  id: item?.system?.id,
                  name: vehicleModel?.name,
                  make: item?.elements?.make?.value?.[0]?.name,
                  model: vehicleModel?.name,
                  description: item?.elements?.description as VehicleSchema["description"],
                  image: [{ url: item?.elements?.image?.value?.[0]?.url }],
                  isBuildEnabled: item?.elements?.flags_384b6cf?.value?.find(
                    (flag) => flag?.name === "Enable Build",
                  )
                    ? true
                    : false,
                  isPoolInventoryEnabled:
                    item?.elements?.flags_384b6cf?.value?.find(
                      (flag) => flag?.name === "Enable Pool Inventory",
                    )
                      ? true
                      : false,
                  show_chargers: item?.elements?.flags_384b6cf?.value?.find(
                    (flag) => flag?.name === "Show Chargers",
                  )
                    ? true
                    : false,
                  gvwr: {
                    unit: item?.elements?.gvwr__gvwr_unit?.value?.[0]
                      ?.name as WeightUnit,
                    value: item?.elements?.gvwr__gvwr_value?.value || 0,
                  },

                  vehicle__kontentAi__id: item?.system?.id,
                  vehicle__kontentAi__codename: item?.system?.codename,
                  vehicleModel__kontentAi__codename: vehicleModel?.codename,
                };
              },
            );

          return { data: options };
        } catch (error) {
          return { error };
        }
      },
    }),
    getSingleVehicle: builder.query<
      GetSingleVehicleQueryReturnType,
      GetSingleVehicleQueryArgType
    >({
      async queryFn(arg) {
        const { vehicleId } = arg;

        try {
          const loader = vehicleConfigModules[String(vehicleId)];
          if (!loader) {
            return { error: new Error(`No vehicle config found for ID: ${vehicleId}`) };
          }

          const mod = await loader() as { default: { data: { items: GetSingleVehicleQueryReturnType[] } } };
          const response = mod.default;

          return { data: response?.data?.items?.[0] };
        } catch (error) {
          console.log("%cerror:", "background-color:red;color:white;", {
            error,
          });
          return { error };
        }
      },
    }),
  }),
});

export type GetSingleVehicleQueryResultType = TypedUseQueryHookResult<
  GetSingleVehicleQueryReturnType,
  GetSingleVehicleQueryArgType,
  AxiosBaseQueryFnType
>;

export const {
  useGetVehiclesQuery,
  useLazyGetVehiclesQuery,
  useGetSingleVehicleQuery,
  useLazyGetSingleVehicleQuery,
} = extendedApiSlice;
