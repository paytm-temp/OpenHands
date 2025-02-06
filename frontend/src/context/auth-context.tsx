import posthog from "posthog-js";
import React, { createContext, useContext, useState } from "react";
import OpenHands from "#/api/open-hands";
import {
  removeGitHubTokenHeader as removeOpenHandsGitHubTokenHeader,
  setGitHubTokenHeader as setOpenHandsGitHubTokenHeader,
} from "#/api/open-hands-axios";
import {
  setAuthTokenHeader as setGitHubAuthTokenHeader,
  removeAuthTokenHeader as removeGitHubAuthTokenHeader,
  setupAxiosInterceptors as setupGithubAxiosInterceptors,
} from "#/api/github-axios-instance";

interface AuthContextType {
  gitHubToken: string | null;
  setUserId: (userId: string) => void;
  setGitHubToken: (token: string | null) => void;
  clearGitHubToken: () => void;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
  bitbucketPassword: string | null;
  setBitbucketPassword: (password: string | null) => void;
  clearBitbucketPassword: () => void;
  bitbucketUsername: string | null;
  setBitbucketUsername: (username: string | null) => void;
  clearBitbucketUsername: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [gitHubTokenState, setGitHubTokenState] = useState<string | null>(() =>
    localStorage.getItem("ghToken"),
  );

  const [userIdState, setUserIdState] = useState<string>(
    () => localStorage.getItem("userId") || "",
  );

  const [bitbucketPasswordState, setBitbucketPasswordState] = useState<
    string | null
  >(() => localStorage.getItem("bbPassword"));

  const [bitbucketUsernameState, setBitbucketUsernameState] = useState<
    string | null
  >(() => localStorage.getItem("bbUsername"));

  const clearGitHubToken = () => {
    setGitHubTokenState(null);
    setUserIdState("");
    localStorage.removeItem("ghToken");
    localStorage.removeItem("userId");

    removeOpenHandsGitHubTokenHeader();
    removeGitHubAuthTokenHeader();
  };

  const setGitHubToken = (token: string | null) => {
    setGitHubTokenState(token);

    if (token) {
      localStorage.setItem("ghToken", token);
      setOpenHandsGitHubTokenHeader(token);
      setGitHubAuthTokenHeader(token);
    } else {
      clearGitHubToken();
    }
  };

  const setUserId = (userId: string) => {
    setUserIdState(userId);
    localStorage.setItem("userId", userId);
  };

  const logout = () => {
    clearGitHubToken();
    posthog.reset();
  };

  const refreshToken = async (): Promise<boolean> => {
    const config = await OpenHands.getConfig();

    if (config.APP_MODE !== "saas" || !gitHubTokenState) {
      return false;
    }

    const newToken = await OpenHands.refreshToken(config.APP_MODE, userIdState);
    if (newToken) {
      setGitHubToken(newToken);
      return true;
    }

    clearGitHubToken();
    return false;
  };

  React.useEffect(() => {
    const storedGitHubToken = localStorage.getItem("ghToken");

    const userId = localStorage.getItem("userId") || "";

    setGitHubToken(storedGitHubToken);
    setUserId(userId);
    setupGithubAxiosInterceptors(refreshToken, logout);
  }, []);

  const value = React.useMemo(
    () => ({
      gitHubToken: gitHubTokenState,
      setGitHubToken,
      setUserId,
      clearGitHubToken,
      refreshToken,
      logout,
      bitbucketPassword: bitbucketPasswordState,
      setBitbucketPassword: setBitbucketPasswordState,
      clearBitbucketPassword: () => setBitbucketPasswordState(null),
      bitbucketUsername: bitbucketUsernameState,
      setBitbucketUsername: setBitbucketUsernameState,
      clearBitbucketUsername: () => setBitbucketUsernameState(null),
    }),
    [gitHubTokenState, bitbucketPasswordState, bitbucketUsernameState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
