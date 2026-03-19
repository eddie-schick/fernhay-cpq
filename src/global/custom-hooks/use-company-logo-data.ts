import { useContext } from "react";

import { useAuthServiceBucketStorageApiQuery } from "~/store/endpoints/auth/auth";

import { AuthContextFactory } from "~/context/auth-context/auth-context";

export default function useCompanyLogoData() {
  const { user } = useContext(AuthContextFactory);

  const companyLogoName = user?.user?.metadata?.company_logo_url || "";

  const getAuthServiceBucketBucketStorageApiQueryState =
    useAuthServiceBucketStorageApiQuery(
      {
        operationType: "read",
        fileName: companyLogoName,
      },
      {
        skip: !companyLogoName || companyLogoName?.startsWith("https"),
      },
    );

  const isLoadingCompanyLogo =
    getAuthServiceBucketBucketStorageApiQueryState?.isFetching;
  const companyLogoImageUrl = companyLogoName?.startsWith("https")
    ? companyLogoName
    : getAuthServiceBucketBucketStorageApiQueryState?.currentData?.url || "";

  return { isLoadingCompanyLogo, companyLogoImageUrl };
}
