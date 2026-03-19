import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

import LocalStorageKeys from "~/constants/local-storage-keys";

export type AxiosBaseQueryFnType = BaseQueryFn<
  {
    url: string;
    method: AxiosRequestConfig["method"];
    data?: AxiosRequestConfig["data"];
    headers?: AxiosRequestConfig["headers"];
    dontUseBaseUrl?: boolean;
  },
  unknown,
  unknown
>;
const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: "" }): AxiosBaseQueryFnType =>
  async ({ url, method, data, headers, dontUseBaseUrl, ...rest }) => {
    try {
      const result = await axios({
        url: dontUseBaseUrl ? url : baseUrl + url,
        method,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        ...rest,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      if (err?.response?.status === 401) {
        // Only clear auth and reload if we actually have a token (prevents infinite reload loop)
        const hasToken = localStorage.getItem(LocalStorageKeys.TOKEN);
        if (hasToken) {
          localStorage.removeItem(LocalStorageKeys.TOKEN);
          localStorage.removeItem(LocalStorageKeys.USER);
          window.location.reload();
        }
      }

      throw err;
    }
  };

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: ``,
  }),
  tagTypes: ["Quotes"],
  endpoints: () => ({}),
});
