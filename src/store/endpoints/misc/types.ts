import { AxiosRequestConfig } from "axios";

export type GetGeneralQueryReturnType = unknown;
export type GetGeneralQueryArgType = {
  url: string;
  headers?: AxiosRequestConfig["headers"];
  dontUseBaseUrl?: boolean;
} & AxiosRequestConfig;
