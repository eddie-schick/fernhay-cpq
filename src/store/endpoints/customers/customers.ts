import { CustomerSchema } from "~/global/types/types";

import { apiSlice } from "~/store/api-slice";

// All customer endpoints are client-side stubs — no backend available
export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<
      { data: CustomerSchema[] },
      { headers?: object; filterString?: string } | void
    >({
      //@ts-ignore
      async queryFn() {
        // Return empty customer list — demo mode
        return { data: { data: [] } };
      },
    }),
    createCustomer: builder.mutation<
      {
        data: CustomerSchema;
      },
      {
        data: object;
        headers: object;
      }
    >({
      //@ts-ignore
      async queryFn(arg) {
        // Simulate customer creation with the provided data
        const customer = {
          id: `demo-${Date.now()}`,
          ...(arg?.data || {}),
        };
        return { data: { data: customer } };
      },
    }),
    updateCustomer: builder.mutation<
      {
        data: Partial<CustomerSchema>;
      },
      {
        id: string | number;
        data: object;
        headers: object;
      }
    >({
      //@ts-ignore
      async queryFn(arg) {
        return { data: { data: { id: arg?.id, ...arg?.data } } };
      },
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} = extendedApiSlice;
