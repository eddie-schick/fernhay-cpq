import { TypedUseQueryHookResult } from "@reduxjs/toolkit/query/react";

import {
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import {
  FilterObjType,
  OrderByType,
  PaginationObjType,
} from "~/helpers/kontent-ai-helpers";

import { AxiosBaseQueryFnType, apiSlice } from "~/store/api-slice";

import { UserSchema } from "~/context/auth-context/auth-context";

import {
  getAllOrders,
  getNextOrderId,
  saveOrder,
  buildInitialPipelineHistory,
  OrderWithPipeline,
} from "~/services/order-service";

type QueryArgType = {
  paginationData?: {
    page?: number;
    limit?: number;
  };
  orderBy?: {
    orderElement: string;
    sortOrder: string;
  };
  headers?: object;
  filters: FilterObjType[];
  searchText?: string;
};

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuotes: builder.query<
      {
        data: QuoteOrder200ResponseSchema[];
      },
      QueryArgType | void
    >({
      //@ts-ignore
      async queryFn(arg) {
        const { paginationData, orderBy, filters, searchText } = arg || {};

        try {
          // ── Local data instead of API call ──
          let allOrders: QuoteOrder200ResponseSchema[] = getAllOrders();

          // Apply status filter
          const statusFilter = filters?.find(
            (f) => f.filterElement === "filter.quote.status",
          );
          if (statusFilter && statusFilter.filterValue) {
            const statusValues = Array.isArray(statusFilter.filterValue)
              ? statusFilter.filterValue
              : [statusFilter.filterValue];
            allOrders = allOrders.filter((o) =>
              statusValues.includes((o.statusV2 || "Quote Generated") as string),
            );
          }

          // Apply dealer email filter
          const dealerFilter = filters?.find(
            (f) => f.filterElement === "filter.quote.dealerEmail",
          );
          if (dealerFilter && dealerFilter.filterValue) {
            allOrders = allOrders.filter(
              (o) => o.dealer?.email === dealerFilter.filterValue,
            );
          }

          // Apply customer name filter
          const customerFilter = filters?.find(
            (f) => f.filterElement === "filter.quote.customerName",
          );
          if (customerFilter && customerFilter.filterValue) {
            const names = Array.isArray(customerFilter.filterValue)
              ? customerFilter.filterValue
              : [customerFilter.filterValue];
            allOrders = allOrders.filter((o) =>
              names.some((n) =>
                o.customer?.buyerName?.toLowerCase().includes(String(n).toLowerCase()),
              ),
            );
          }

          // Apply search text
          if (searchText) {
            const lc = searchText.toLowerCase();
            allOrders = allOrders.filter(
              (o) =>
                o.formattedId?.toLowerCase().includes(lc) ||
                o.customer?.buyerName?.toLowerCase().includes(lc) ||
                o.orderNo?.toLowerCase().includes(lc),
            );
          }

          // Sort
          if (orderBy?.sortOrder === "desc") {
            allOrders.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
          } else {
            allOrders.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            );
          }

          // Paginate
          const page = (paginationData?.page || 1) - 1;
          const limit = paginationData?.limit || 20;
          const paginated = allOrders.slice(page * limit, page * limit + limit);

          const returnValue = {
            data: { data: paginated },
          };

          return returnValue;
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["Quotes"],
    }),
    // localStorage-based getSingleQuote (no backend needed)
    getSingleQuote: builder.query<
      {
        data: QuoteOrder200ResponseSchema;
      },
      { id: number | string } | void
    >({
      //@ts-ignore
      async queryFn(arg) {
        const { id } = arg || {};

        try {
          // Look up the order in local data by id or formattedId
          const allOrders = getAllOrders();
          const found = allOrders.find(
            (o) =>
              String(o.id) === String(id) ||
              o.formattedId === String(id),
          );

          if (found) {
            return { data: { data: found } };
          }

          // Return a minimal placeholder if not found (quote was just created locally)
          return {
            data: {
              data: {
                id: id || 0,
                formattedId: String(id),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                quantity: 1,
                quantityIndex: 1,
                customer: { buyerName: "", email: "" },
                description: "",
                model: "",
                vin: "",
                group: "A",
                groupQuantity: 1,
                groupVehicleIndex: 1,
                price: { value: 0, currency: "$" },
                payload: { value: 0, unit: "lbs" },
                leadTime: { value: 0, unit: "day" },
                statusV2: "Quote Generated",
                bom: { name: String(id), fileLink: "" },
                quote: { name: String(id), fileLink: "", signedFileLink: "" },
              } as unknown as QuoteOrder200ResponseSchema,
            },
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    // localStorage-based getDistinctValues (no backend needed)
    getDistinctValues: builder.query<
      {
        data: string[];
      },
      {
        field: string;
        headers: object;
      }
    >({
      //@ts-ignore
      async queryFn(params) {
        try {
          const allOrders = getAllOrders();
          const field = params?.field;
          const values = new Set<string>();

          allOrders.forEach((o) => {
            if (field === "status" || field === "statusV2") {
              values.add((o.statusV2 || "Quote Generated") as string);
            } else if (field === "customerName") {
              if (o.customer?.buyerName) values.add(o.customer.buyerName);
            }
          });

          return { data: { data: Array.from(values) } };
        } catch (error) {
          return { error };
        }
      },
    }),
    getQuotesCount: builder.query<
      {
        meta: {
          pagination: {
            total: number;
          };
        };
      },
      QueryArgType | void
    >({
      //@ts-ignore
      async queryFn(arg) {
        const { filters } = arg || {};

        try {
          // ── Local count instead of API call ──
          let allOrders: QuoteOrder200ResponseSchema[] = getAllOrders();

          // Apply status filter
          const statusFilter = filters?.find(
            (f) => f.filterElement === "filter.quote.status",
          );
          if (statusFilter && statusFilter.filterValue) {
            const statusValues = Array.isArray(statusFilter.filterValue)
              ? statusFilter.filterValue
              : [statusFilter.filterValue];
            allOrders = allOrders.filter((o) =>
              statusValues.includes((o.statusV2 || "Quote Generated") as string),
            );
          }

          // Apply dealer email filter
          const dealerFilter = filters?.find(
            (f) =>
              f.filterElement === "filter.quote.dealerEmail" ||
              f.filterElement === "filter.dealerEmail",
          );
          if (dealerFilter && dealerFilter.filterValue) {
            allOrders = allOrders.filter(
              (o) => o.dealer?.email === dealerFilter.filterValue,
            );
          }

          return {
            data: {
              meta: {
                pagination: {
                  total: allOrders.length,
                },
              },
            },
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    // localStorage-based updateQuote (no backend needed)
    updateQuote: builder.mutation<
      {
        data: object;
      },
      {
        data?: object;
        id: number | string;
        customerId?: number;
        headers: object;
      }
    >({
      //@ts-ignore
      async queryFn(params) {
        try {
          // No-op for now since we don't have a real backend.
          // The data is already stored in localStorage via saveOrder.
          console.log("[updateQuote] localStorage stub for id:", params?.id, params?.data);
          return { data: { data: params?.data || {} } };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Quotes"],
    }),
    // localStorage-based updateGeneratedQuoteStatus (no backend needed)
    updateGeneratedQuoteStatus: builder.mutation<
      {
        data: object;
      },
      {
        data: object;
        id: number | string;
        headers: object;
      }
    >({
      //@ts-ignore
      async queryFn(params) {
        try {
          console.log("[updateGeneratedQuoteStatus] localStorage stub for id:", params?.id);
          return { data: { data: params?.data || {} } };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Quotes"],
    }),

    // localStorage-based createQuote (no backend needed)
    createQuote: builder.mutation<
      {
        data: object;
      },
      {
        data: object;
        customerId?: number;
        headers: object;
      }
    >({
      //@ts-ignore
      async queryFn(params) {
        try {
          const payload = params?.data as Record<string, unknown>;
          const formattedId = getNextOrderId();
          const now = new Date().toISOString();

          // Extract customer & dealer info from the full quote state if passed
          const quoteState = payload?.quoteState as Record<string, unknown> | undefined;
          const customerForm = (quoteState?.customerDetailsForm || {}) as Record<string, unknown>;
          const dealerForm = (quoteState?.dealerDetailsForm || {}) as Record<string, unknown>;

          // Extract configuration details from customizationOptions
          const customOpts = payload?.customizationOptions as Record<string, unknown> | undefined;
          const paintSection = customOpts?.paintType as { options?: Array<{ title?: string; hexCode?: string; kontentAi__item__codename?: string }> } | undefined;
          const chassisSection = customOpts?.chassis as { options?: Array<{ title?: string; image?: { url?: string }; additional_images?: Array<{ url?: string; name?: string }> }> } | undefined;
          const upfitSection = customOpts?.["interior upfit"] as { options?: Array<{ title?: string; image?: { url?: string }; additional_images?: Array<{ url?: string; name?: string }> }> } | undefined;
          const doorSection = customOpts?.["door configuration"] as { options?: Array<{ title?: string }> } | undefined;

          const paintOption = paintSection?.options?.[0];
          const chassisOption = chassisSection?.options?.[0];
          const upfitOption = upfitSection?.options?.[0];
          const doorOption = doorSection?.options?.[0];

          const vehicleQuantity = (payload?.vehicles as unknown[])?.length || 1;

          // Build a new order record for localStorage
          const newOrder = {
            id: formattedId,
            formattedId,
            timestampId: String(Date.now()),
            createdAt: now,
            updatedAt: now,
            quantity: vehicleQuantity,
            quantityIndex: 0,
            customer: {
              buyerName: (customerForm?.name as string) || (customerForm?.buyerName as string) || undefined,
              coBuyerName: (customerForm?.representativeName as string) || "",
              email: (customerForm?.email as string) || "",
              address: (customerForm?.address as string) || "",
              phone: (customerForm?.phone as string) || "",
              city: (customerForm?.city as string) || "",
              state: (customerForm?.state as string) || "",
              zipCode: (customerForm?.zipCode as string) || "",
              country: (customerForm?.country as string) || "",
            },
            dealer: {
              name: (dealerForm?.name as string) || "",
              email: (dealerForm?.email as string) || "",
              address: (dealerForm?.address as string) || "",
              city: (dealerForm?.city as string) || "",
              state: (dealerForm?.state as string) || "",
              zipCode: (dealerForm?.zipCode as string) || "",
              phone: (dealerForm?.phone as string) || "",
              country: (dealerForm?.country as string) || "",
              dealershipName: (dealerForm?.dealershipName as string) || "",
              jobTitle: (dealerForm?.jobTitle as string) || "",
            },
            dealerId: "",
            description: (payload?.description as string) || "",
            vehicleModel: (payload?.vehicleModel as string) || "",
            model: (payload?.vehicleModel as string) || "",
            vin: "",
            group: "A",
            groupQuantity: vehicleQuantity,
            groupVehicleIndex: 1,
            orderType: vehicleQuantity > 1 ? "Fleet" : "Retail",
            price: {
              value: (payload?.dealerPrice as { value: number })?.value || 0,
              currency: "$",
            },
            payload: {
              value: (payload?.payloadCapacity as { value: number })?.value || 0,
              unit: (payload?.payloadCapacity as { unit: string })?.unit || "lbs",
            },
            leadTime: {
              value: (payload?.leadTime as { value: number })?.value || 0,
              unit: (payload?.leadTime as { unit: string })?.unit || "day",
            },
            expiryDurationInDays: 30,
            status: { id: "qs-1", group: "quote", status: "Quote Generated" },
            statusV2: "Quote Generated",
            // Store config details for the order detail view
            paint: paintOption ? { name: paintOption.title || "White (Standard)", colorCode: paintOption.hexCode || "#FFFFFF", kontentAi__item__codename: paintOption.kontentAi__item__codename || "" } : { name: "White (Standard)", colorCode: "#FFFFFF", kontentAi__item__codename: "" },
            upfits: [
              chassisOption ? { title: chassisOption.title || "eAV Cutaway Chassis", image: chassisOption.image, additional_images: chassisOption.additional_images } : { title: "eAV Cutaway Chassis" },
              ...(upfitOption ? [{ title: upfitOption.title, image: upfitOption.image, additional_images: upfitOption.additional_images }] : []),
            ],
            shelving: doorOption ? { title: doorOption.title } : undefined,
            customizationOptions: payload?.customizationOptions,
            bom: { name: `QUOTE-${formattedId}`, fileLink: "" },
            quote: { name: `QUOTE-${formattedId}`, fileLink: "", signedFileLink: "" },
            orderNo: null,
            pipelineStage: 1,
            pipelineHistory: buildInitialPipelineHistory(now),
            estimatedDeliveryDate: new Date(
              Date.now() + 120 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            isOverdue: false,
            bodyType: "",
            variantCodename: "",
          } as OrderWithPipeline;

          saveOrder(newOrder);

          // Return shape that the caller (configurator-right-side) expects
          return {
            data: {
              id: formattedId,
              formattedId,
            },
          };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
});
export type GetQuotesResultType = TypedUseQueryHookResult<
  { data: QuoteOrder200ResponseSchema[] },
  {
    dealerDetails?: UserSchema;
    filters?: FilterObjType[];
    orderBy?: OrderByType;
    paginationData?: PaginationObjType;
    elements?: string[];
    depth?: number;
  } | void,
  AxiosBaseQueryFnType
>;

export const {
  useGetQuotesQuery,
  useGetSingleQuoteQuery,
  useGetDistinctValuesQuery,
  useGetQuotesCountQuery,
  useUpdateQuoteMutation,
  useUpdateGeneratedQuoteStatusMutation,
  useCreateQuoteMutation,
} = extendedApiSlice;
