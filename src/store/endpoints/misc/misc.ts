import { TypedUseQueryHookResult } from "@reduxjs/toolkit/query/react";
import { AxiosRequestConfig, AxiosRequestHeaders } from "axios";

import { SettingSchema } from "~/global/types/types";

import { NewQuoteShape } from "~/store/slices/quotes/types";

import { ContactUsInputs } from "~/components/contact-us/contact-us";

import appSettingsData from "~/data/app-settings.json";

import { AxiosBaseQueryFnType, apiSlice } from "../../api-slice";

import { GetGeneralQueryArgType, GetGeneralQueryReturnType } from "./types";

export type SendEmailQueryArgs = void | {
  headers?: object;
  data?: ContactUsInputs;
};

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGeneral: builder.query<
      GetGeneralQueryReturnType,
      GetGeneralQueryArgType
    >({
      query: (params) => {
        const { url, headers, dontUseBaseUrl, ...rest } = params;

        return {
          method: "GET",
          url,
          headers: {
            ...headers,
          },
          dontUseBaseUrl,
          ...rest,
        };
      },
    }),
    putGeneral: builder.mutation<
      GetGeneralQueryReturnType,
      GetGeneralQueryArgType
    >({
      query: (params) => {
        const { url, headers, dontUseBaseUrl, ...rest } = params;

        return {
          method: "PUT",
          url,
          headers: {
            ...headers,
          },
          dontUseBaseUrl,
          ...rest,
        };
      },
    }),
    // localStorage stub — no cloud storage available
    getBucketWriteSignedUrl: builder.mutation<
      { url: string },
      {
        data: {
          fileName: string;
          type: string;
        };
        headers?: AxiosRequestConfig["headers"];
      }
    >({
      //@ts-ignore
      async queryFn(arg) {
        // Return a fake URL; actual upload is skipped in useQuoteMethods
        return { data: { url: `local://${arg?.data?.fileName}` } };
      },
    }),
    // getWHBucketSignedUrl: builder.mutation<
    //   { url: string },
    //   {
    //     data: {
    //       fileName: string;
    //     };
    //   }
    // >({
    //   query: (params) => ({
    //     method: "GET",
    //     url: `${ENDPOINT.GET_SIGNED_URL_CLOUD_FUNCTION}?bucketName=fernhay-cpq&type=write&env=${Envs.GET_SIGNED_URL_CLOUD_FUNCTION_ENVIRONMENT}&file=${params?.data?.fileName}`,
    //     // url: `/storage?type=write&file=${params?.data?.fileName}`,
    //     dontUseBaseUrl: true,
    //   }),
    // }),
    getAppSettings: builder.query<{ data: SettingSchema }, void>({
      queryFn() {
        try {
          const appSettingsItem = appSettingsData;
          const e = appSettingsItem.elements;
          const returnValue: SettingSchema = {
            name: e.name.value,
            logoPng: { url: e.logo_png.value[0]?.url },
            logoSvg: { url: e.logo_svg.value[0]?.url },
            headerLogoPng: { url: e.header_logo_png.value[0]?.url },
            headerLogoSvg: { url: e.header_logo_svg.value[0]?.url },
            loginBannerImagePng: { url: e.login_banner_image_png.value[0]?.url },
            loginBannerImageSvg: { url: e.login_banner_image_svg.value[0]?.url },
            sidebarLogoPng: { url: e.sidebar_logo_png.value[0]?.url },
            sidebarLogoSvg: { url: e.sidebar_logo_svg.value[0]?.url },
            splashScreenLogoPng: { url: e.splash_screen_logo_png.value[0]?.url },
            splashScreenLogoSvg: { url: e.splash_screen_logo_svg.value[0]?.url },
            colors: {
              primaryColor: e.primary_color.value,
              primaryHoverColor: e.primary_hover_color.value,
              secondaryColor: e.secondary_color.value,
              splashScreenLoaderColor1: e.splash_screen_loader_color_1.value,
              splashScreenLoaderColor2: e.splash_screen_loader_color_2.value,
              splashScreenLoaderColor3: e.splash_screen_loader_color_3.value,
              navLinkActiveColor: e.nav_link_active_color.value,
              miscActiveColor: e.misc_active_color.value,
            },
          };

          return { data: { data: returnValue } };
        } catch (error) {
          return { error };
        }
      },
    }),
    // Client-side stub — no email backend available
    sendContactEmail: builder.mutation<{ message: string }, SendEmailQueryArgs>(
      {
        //@ts-ignore
        async queryFn() {
          console.log("[sendContactEmail] Client-side stub — no backend");
          return { data: { message: "Email simulated (no backend)" } };
        },
      },
    ),
    // Client-side stub — no email backend available, simulates success
    sendPdfByEmail: builder.mutation<
      { success: boolean },
      {
        quoteId: string | number;
        files: { file: Blob }[];
        quote: NewQuoteShape;
        miscDetails?: {
          sendToMySelf?: boolean;
          subject?: string;
          message?: string;
        };
        headers?: AxiosRequestConfig["headers"];
      }
    >({
      //@ts-ignore
      async queryFn(arg) {
        console.log("[sendPdfByEmail] Client-side stub — email simulated for quote:", arg?.quoteId);
        // Simulate a short delay so the UI loading state works
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { data: { success: true } };
      },
    }),
    // Client-side stub — no CEVS backend
    pushVehicleToCevs: builder.mutation<
      { success: boolean },
      {
        data: {
          make: string;
          model: string;
          battery: string;
          charger: string;
          accessories: string;
          color: string;
          gvwr: string;
          imageUrl: string;
          upfit: string;
          msrp: string;
          salePrice: string;
          vins: string[];
        };
        headers?: AxiosRequestConfig["headers"];
      }
    >({
      //@ts-ignore
      async queryFn(arg) {
        console.log("[pushVehicleToCevs] Client-side stub — no backend");
        return { data: { success: true } };
      },
    }),
    // Client-side stub — no event logging backend
    pushEventsLogsToDB: builder.mutation({
      queryFn: async (
        params: {
          events: {
            metric: string;
            element?: string;
            page?: string;
            miscDetails?: object;
          }[];
          headers?: AxiosRequestHeaders;
        },
      ) => {
        console.log("[pushEventsLogsToDB] Client-side stub — events logged locally:", params?.events);
        return { data: {} };
      },
    }),
  }),
});

export const {
  useGetGeneralQuery,
  useLazyGetGeneralQuery,
  usePutGeneralMutation,
  useGetBucketWriteSignedUrlMutation,
  // useGetWHBucketSignedUrlMutation,
  useGetAppSettingsQuery,
  useLazyGetAppSettingsQuery,
  useSendContactEmailMutation,
  useSendPdfByEmailMutation,
  usePushVehicleToCevsMutation,
  usePushEventsLogsToDBMutation,
} = extendedApiSlice;

export type GetGeneralQueryResultType = TypedUseQueryHookResult<
  GetGeneralQueryReturnType,
  GetGeneralQueryArgType,
  AxiosBaseQueryFnType
>;
