/**
 * Generates a URL to redirect to for Bitbucket OAuth
 * @param clientId The Bitbucket OAuth client ID
 * @param requestUrl The URL of the request
 * @returns The URL to redirect to for Bitbucket OAuth
 */
export const generateBitbucketAuthUrl = (clientId: string, requestUrl: URL) => {
  const redirectUri = `${requestUrl.origin}/oauth/bitbucket/callback`;
  const scope = "repository:write account";
  return `https://bitbucket.org/site/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
};
