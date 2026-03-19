import { AxiosRequestHeaders } from "axios";

import { apiSlice } from "~/store/api-slice";

import { UserSchema } from "~/context/auth-context/auth-context";

type SuspiciousLoginReportQueryResultType = { success: boolean };
type SuspiciousLoginReportQueryArgType = {
  token: string;
};

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Client-side stub — returns user data from localStorage (no auth service)
    getUser: builder.query<UserSchema["user"], { headers?: object }>({
      //@ts-ignore
      queryFn() {
        try {
          const stored = localStorage.getItem("shaed:cpq-Fernhay:user");
          if (stored) {
            const parsed = JSON.parse(stored) as UserSchema;
            return { data: parsed.user };
          }
          return {
            data: {
              id: "dev-user-001",
              email: "demo@fernhay.com",
              name: "Demo User",
              metadata: {
                dealer_address: "1234 Commerce Dr",
                dealership_name: "Fernhay Direct",
                dealer_city: "Denver",
                dealer_state: "CO",
                dealer_zip_code: "80202",
                job_title: "VP of Sales",
                role: "admin",
              },
            },
          };
        } catch {
          return { error: "Failed to read user" };
        }
      },
    }),
    // Client-side stub — saves user updates to localStorage
    updateUser: builder.mutation<
      UserSchema["user"],
      { data?: object; headers?: object | null }
    >({
      //@ts-ignore
      async queryFn(arg) {
        try {
          const stored = localStorage.getItem("shaed:cpq-Fernhay:user");
          const current = stored ? (JSON.parse(stored) as UserSchema) : null;
          const updated = { ...current?.user, ...arg?.data };
          localStorage.setItem(
            "shaed:cpq-Fernhay:user",
            JSON.stringify({ user: updated }),
          );
          return { data: updated };
        } catch {
          return { error: "Failed to update user" };
        }
      },
    }),
    // Client-side stub — no-op
    deleteUser: builder.mutation<unknown, { headers?: object | null }>({
      //@ts-ignore
      async queryFn() {
        localStorage.removeItem("shaed:cpq-Fernhay:user");
        return { data: { success: true } };
      },
    }),
    // Client-side stub — returns a fake signed URL
    getSignedUrl: builder.mutation<
      { url: string },
      {
        data: {
          fileName: string;
        };
        operationType?: "read" | "write";
      }
    >({
      //@ts-ignore
      async queryFn(arg) {
        return { data: { url: `local://${arg?.data?.fileName}` } };
      },
    }),
    // Client-side stub — no suspicious login reporting
    reportSuspiciousLogin: builder.query<
      SuspiciousLoginReportQueryResultType,
      SuspiciousLoginReportQueryArgType
    >({
      //@ts-ignore
      async queryFn() {
        return { data: { success: true } };
      },
    }),
    // Client-side stub — no cloud storage
    authServiceBucketStorageApi: builder.query<
      {
        url: string;
      },
      {
        fileName?: string;
        headers?: AxiosRequestHeaders;
        operationType?: "read" | "write";
        queryParams?: string;
        data?: object;
      }
    >({
      //@ts-ignore
      async queryFn(arg) {
        return { data: { url: `local://${arg?.fileName}` } };
      },
    }),
  }),
});

export const {
  useGetUserQuery,
  useLazyGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetSignedUrlMutation,
  useLazyReportSuspiciousLoginQuery,
  useAuthServiceBucketStorageApiQuery,
  useLazyAuthServiceBucketStorageApiQuery,
} = extendedApiSlice;
