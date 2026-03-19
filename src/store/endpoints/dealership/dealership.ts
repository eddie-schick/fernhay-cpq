import { AxiosRequestConfig } from "axios";

import { apiSlice } from "~/store/api-slice";

type GetDealerShipNameReturnType = unknown;
type GetDealerShipNameArgType = {
  headers?: AxiosRequestConfig["headers"];
} & AxiosRequestConfig;

// Client-side stub — no HubSpot backend available
export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDealerShipNames: builder.query<
      GetDealerShipNameReturnType,
      GetDealerShipNameArgType
    >({
      //@ts-ignore
      async queryFn() {
        // Return demo dealership names
        return {
          data: {
            data: [
              { name: "Fernhay Direct", id: "demo-1" },
              { name: "EV Fleet Solutions", id: "demo-2" },
              { name: "Green Transit Corp", id: "demo-3" },
            ],
          },
        };
      },
    }),
  }),
});

export const { useGetDealerShipNamesQuery, useLazyGetDealerShipNamesQuery } =
  extendedApiSlice;
