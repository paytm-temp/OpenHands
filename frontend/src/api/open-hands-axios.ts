import axios from "axios";

export const openHands = axios.create();

export const setAuthTokenHeader = (token: string) => {
  openHands.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const setGitHubTokenHeader = (token: string) => {
  openHands.defaults.headers.common["X-GitHub-Token"] = token;
};

export const setBitbucketCredentialsHeader = (
  username: string | null,
  password: string | null,
) => {
  if (username) {
    openHands.defaults.headers.common["X-Bitbucket-Username"] = username;
  }
  if (password) {
    openHands.defaults.headers.common["X-Bitbucket-Password"] = password;
  }
};

export const removeAuthTokenHeader = () => {
  if (openHands.defaults.headers.common.Authorization) {
    delete openHands.defaults.headers.common.Authorization;
  }
};

export const removeGitHubTokenHeader = () => {
  if (openHands.defaults.headers.common["X-GitHub-Token"]) {
    delete openHands.defaults.headers.common["X-GitHub-Token"];
  }
};

export const removeBitbucketCredentialsHeader = () => {
  if (openHands.defaults.headers.common["X-Bitbucket-Username"]) {
    delete openHands.defaults.headers.common["X-Bitbucket-Username"];
  }
  if (openHands.defaults.headers.common["X-Bitbucket-Password"]) {
    delete openHands.defaults.headers.common["X-Bitbucket-Password"];
  }
};
