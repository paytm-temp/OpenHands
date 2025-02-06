import { useQuery } from "@tanstack/react-query";
import React from "react";
import posthog from "posthog-js";
import { retrieveBitbucketUser } from "#/api/bitbucket";
import { useAuth } from "#/context/auth-context";
import { useConfig } from "./use-config";

export const useBitbucketUser = () => {
  const { bitbucketPassword, bitbucketUsername, setUserId } = useAuth();
  const { data: config } = useConfig();

  const user = useQuery({
    queryKey: ["bitbucketUser", bitbucketPassword, bitbucketUsername],
    queryFn: () =>
      retrieveBitbucketUser(
        bitbucketUsername as string,
        bitbucketPassword as string,
      ),
    enabled: !!bitbucketPassword && !!bitbucketUsername && !!config?.APP_MODE,
    retry: false,
  });

  React.useEffect(() => {
    if (user.data) {
      setUserId(user.data.uuid);
      posthog.identify(user.data.username, {
        name: user.data.display_name,
        email: user.data.email,
        user: user.data.username,
        mode: config?.APP_MODE || "oss",
      });
    }
  }, [user.data]);

  return user;
};
