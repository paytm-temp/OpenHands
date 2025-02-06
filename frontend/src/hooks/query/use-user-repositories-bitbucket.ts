import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { retrieveBitbucketUserRepositories } from "#/api/bitbucket";
import { useAuth } from "#/context/auth-context";
import { useConfig } from "./use-config";

export const useUserRepositories = () => {
  const { bitbucketPassword, bitbucketUsername } = useAuth();
  const { data: config } = useConfig();

  const username = bitbucketUsername ?? "";
  const password = bitbucketPassword ?? "";

  const repos = useInfiniteQuery({
    queryKey: ["bitbucketRepositories", username, password],
    queryFn: async ({ pageParam = 1 }) =>
      retrieveBitbucketUserRepositories(username, password, pageParam, 100),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled:
      !!bitbucketPassword && !!bitbucketUsername && config?.APP_MODE === "oss",
    initialPageParam: 1,
  });

  // TODO: Once we create our custom dropdown component, we should fetch data onEndReached
  // (nextui autocomplete doesn't support onEndReached nor is it compatible for extending)
  const { isSuccess, isFetchingNextPage, hasNextPage, fetchNextPage } = repos;
  React.useEffect(() => {
    if (!isFetchingNextPage && isSuccess && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, isSuccess, hasNextPage, fetchNextPage]);

  return repos;
};
