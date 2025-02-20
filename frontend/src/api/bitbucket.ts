import { extractNextPageFromLink } from "#/utils/extract-next-page-from-link";
import { openHands } from "./open-hands-axios";
import { bitbucket } from "./bitbucket-axios-instance";
import {
  BitbucketRepository,
  BitbucketUser,
  BitbucketAppInstallation,
  BitbucketAppRepository,
} from "#/types/bitbucket";
/**
 * Given the user, retrieves app installations IDs for OpenHands Bitbucket App
 * Uses user access token for Bitbucket App
 */
export const retrieveBitbucketAppInstallations = async (): Promise<
  string[]
> => {
  const response = await bitbucket.get<BitbucketAppInstallation>(
    "/user/installations",
  );

  return response.data.installations.map((installation) => installation.uuid);
};

/**
 * Retrieves repositories where OpenHands Bitbucket App has been installed
 * @param installationIndex Pagination cursor position for app installation IDs
 * @param installations Collection of all App installation IDs for OpenHands Bitbucket App
 * @returns A list of repositories
 */
export const retrieveBitbucketAppRepositories = async (
  installationIndex: number,
  installations: string[],
  page = 1,
  per_page = 30,
) => {
  const installationId = installations[installationIndex];
  const response = await openHands.get<BitbucketAppRepository>(
    "/api/bitbucket/repositories",
    {
      params: {
        sort: "updated_on",
        page,
        per_page,
        installation_id: installationId,
      },
    },
  );

  const link = response.headers.link ?? "";
  const nextPage = extractNextPageFromLink(link);
  let nextInstallation: number | null;

  if (nextPage) {
    nextInstallation = installationIndex;
  } else if (installationIndex + 1 < installations.length) {
    nextInstallation = installationIndex + 1;
  } else {
    nextInstallation = null;
  }

  return {
    data: response.data.repositories,
    nextPage,
    installationIndex: nextInstallation,
  };
};

export const searchPublicRepositories = async (
  query: string,
  per_page = 5,
  sort: "" | "updated" | "stars" | "forks" = "stars",
  order: "desc" | "asc" = "desc",
): Promise<BitbucketRepository[]> => {
  const response = await bitbucket.get<{ values: BitbucketRepository[] }>(
    "/search/repositories",
    {
      params: {
        q: query,
        per_page,
        sort,
        order,
      },
    },
  );
  return response.data.values;
};

/**
 * Retrieves the repositories of the authenticated Bitbucket user
 * @param page The page number for pagination
 * @param per_page The number of repositories per page
 * @param username The Bitbucket username
 * @param password The Bitbucket password
 * @returns A list of repositories and the next page number
 */
export const retrieveBitbucketUserRepositories = async (
  username: string,
  password: string,
  page = 1,
  per_page = 30,
) => {
  const response = await bitbucket.get<{
    values: BitbucketRepository[];
    pagelen: number;
    size: number;
    page: number;
    next: string;
  }>(
    `repositories/paytmteam`,
    {
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      },
      params: {
        page,
        pagelen: per_page,
        sort: "updated_on",
      },
    },
  );

  const nextPage = response.data.next ? page + 1 : null;

  return { data: response.data.values, nextPage };
};

/**
 * Retrieves the authenticated Bitbucket user
 * @param username The Bitbucket username
 * @param password The Bitbucket password
 * @returns The authenticated user or an error response
 */
export const retrieveBitbucketUser = async (
  username: string,
  password: string,
) => {
  const response = await bitbucket.get<BitbucketUser>("/user", {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  });

  return response.data;
};
