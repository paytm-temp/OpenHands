import axios, { AxiosError } from "axios";
import { BitbucketErrorResponse } from "#/types/bitbucket";

// Create an axios instance for Bitbucket API
const bitbucket = axios.create({
  baseURL: "https://api.bitbucket.org/2.0",
  headers: {
    Accept: "application/json",
  },
});

const setAuthTokenHeader = (username: string, password: string) => {
  const token = btoa(`${username}:${password}`);
  bitbucket.defaults.headers.common.Authorization = `Basic ${token}`;
};

const removeAuthTokenHeader = () => {
  if (bitbucket.defaults.headers.common.Authorization) {
    delete bitbucket.defaults.headers.common.Authorization;
  }
};

/**
 * Checks if the data is a Bitbucket error response
 * @param data The data to check
 * @returns Boolean indicating if the data is a Bitbucket error response
 */
export const isBitbucketErrorResponse = <T extends object | Array<unknown>>(
  data: T | BitbucketErrorResponse | null,
): data is BitbucketErrorResponse =>
  !!data && "error" in data && data.error.message !== undefined;

/**
 * Checks if response has attributes to perform refresh
 */
const canRefresh = (error: unknown): boolean =>
  !!(
    error instanceof AxiosError &&
    error.config &&
    error.response &&
    error.response.status
  );

// Axios interceptor to handle token refresh
const setupAxiosInterceptors = (
  refreshToken: () => Promise<boolean>,
  logout: () => void,
) => {
  bitbucket.interceptors.response.use(
    // Pass successful responses through
    (response) => {
      const parsedData = response.data;
      if (isBitbucketErrorResponse(parsedData)) {
        const error = new AxiosError(
          "Failed",
          "",
          response.config,
          response.request,
          response,
        );
        throw error;
      }
      return response;
    },
    // Retry request exactly once if token is expired
    async (error) => {
      if (!canRefresh(error)) {
        return Promise.reject(new Error("Failed to refresh token"));
      }

      const originalRequest = error.config;

      // Check if the error is due to an expired token
      if (
        error.response.status === 401 &&
        !originalRequest._retry // Prevent infinite retry loops
      ) {
        originalRequest._retry = true;
        try {
          const refreshed = await refreshToken();
          if (refreshed) {
            return await bitbucket(originalRequest);
          }

          logout();
          return await Promise.reject(new Error("Failed to refresh token"));
        } catch (refreshError) {
          // If token refresh fails, evict the user
          logout();
          return Promise.reject(refreshError);
        }
      }

      // If the error is not due to an expired token, propagate the error
      return Promise.reject(error);
    },
  );
};

export {
  bitbucket,
  setAuthTokenHeader,
  removeAuthTokenHeader,
  setupAxiosInterceptors,
};
