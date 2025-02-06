import React from "react";
import { generateBitbucketAuthUrl } from "#/utils/generate-bitbucket-auth-url";
import { GetConfigResponse } from "#/api/open-hands.types";

interface UseBitbucketAuthUrlConfig {
  bitbucketPassword: string | null;
  bitbucketUsername: string | null;
  appMode: GetConfigResponse["APP_MODE"] | null;
  bitbucketClientId: GetConfigResponse["BITBUCKET_CLIENT_ID"] | null;
}

export const useBitbucketAuthUrl = (config: UseBitbucketAuthUrlConfig) =>
  React.useMemo(() => {
    if (
      config.appMode === "saas" &&
      !config.bitbucketPassword &&
      !config.bitbucketUsername
    )
      return generateBitbucketAuthUrl(
        config.bitbucketClientId || "",
        new URL(window.location.href),
      );

    return null;
  }, [
    config.bitbucketPassword,
    config.bitbucketUsername,
    config.appMode,
    config.bitbucketClientId,
  ]);
