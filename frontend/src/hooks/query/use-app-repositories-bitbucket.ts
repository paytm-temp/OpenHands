import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { retrieveBitbucketAppRepositories } from "#/api/bitbucket";
import { useAuth } from "#/context/auth-context";
import { useAppInstallations } from "./use-app-installations";
import { useConfig } from "./use-config";

export const useAppRepositories = () => {
  const { bitbucketPassword, bitbucketUsername } = useAuth();
  const { data: config } = useConfig();
  const { data: installations } = useAppInstallations();

  const repos = useInfiniteQuery({
    queryKey: [
      "repositories",
      bitbucketPassword,
      bitbucketUsername,
      installations,
    ],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: { installationIndex: number | null; repoPage: number | null };
    }) => {
      const { repoPage, installationIndex } = pageParam;

      if (!installations) {
        throw new Error("Missing installation list");
      }

      return retrieveBitbucketAppRepositories(
        installationIndex || 0,
        installations.map(String),
        repoPage || 1,
        30,
      );
    },
    initialPageParam: { installationIndex: 0, repoPage: 1 },
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage) {
        return {
          installationIndex: lastPage.installationIndex,
          repoPage: lastPage.nextPage,
        };
      }

      if (lastPage.installationIndex !== null) {
        return { installationIndex: lastPage.installationIndex, repoPage: 1 };
      }

      return null;
    },
    enabled:
      !!bitbucketPassword &&
      !!bitbucketUsername &&
      Array.isArray(installations) &&
      installations.length > 0 &&
      config?.APP_MODE === "saas",
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
