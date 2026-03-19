/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useContext, useMemo } from "react";

import { useGetCustomersQuery } from "~/store/endpoints/customers/customers";

import { AuthContextFactory } from "~/context/auth-context/auth-context";

import { QuoteOrder200ResponseSchema } from "../../../global/types/types";

export default function useCustomersNameQuery(): {
  customers: QuoteOrder200ResponseSchema["customer"][];
  isLoading: boolean;
} {
  const authContext = useContext(AuthContextFactory);
  const { user } = authContext;

  const getCustomersQuery = useGetCustomersQuery(
    {
      user: user!,
    },

    {
      refetchOnMountOrArgChange: false,
    }
  );

  const customers = useMemo(() => {
    if (getCustomersQuery.data as QuoteOrder200ResponseSchema["customer"][]) {
      return getCustomersQuery.data as QuoteOrder200ResponseSchema["customer"][];
    }

    return [];
  }, [getCustomersQuery.data]);

  return { customers, isLoading: getCustomersQuery.isLoading };
}
