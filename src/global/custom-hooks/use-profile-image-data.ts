import { useContext } from "react";

import { useAuthServiceBucketStorageApiQuery } from "~/store/endpoints/auth/auth";

import { AuthContextFactory } from "~/context/auth-context/auth-context";

export default function useProfileImageData() {
  const { user } = useContext(AuthContextFactory);

  const profileImageName = user?.user?.metadata?.image;

  const getAuthServiceBucketBucketStorageApiQueryState =
    useAuthServiceBucketStorageApiQuery(
      {
        operationType: "read",
        fileName: profileImageName,
      },
      {
        skip: !profileImageName || profileImageName?.startsWith("https"),
      },
    );

  const isLoadingProfilePicture =
    getAuthServiceBucketBucketStorageApiQueryState?.isFetching;
  const profileImageUrl = profileImageName?.startsWith("https")
    ? profileImageName
    : getAuthServiceBucketBucketStorageApiQueryState?.currentData?.url || "";

  return { isLoadingProfilePicture, profileImageUrl };
}
