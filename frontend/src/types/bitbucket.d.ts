export interface BitbucketErrorResponse {
  error: {
    message: string;
  };
}

export interface BitbucketUser {
  uuid: string;
  username: string;
  display_name: string;
  links: {
    avatar: {
      href: string;
    };
  };
  email: string | null;
}

export interface BitbucketRepository {
  uuid: string;
  full_name: string;
  links: {
    html: {
      href: string;
    };
  };
  description: string | null;
  is_private: boolean;
  name: string;
  slug: string;
}

export interface BitbucketAppRepository {
  repositories: BitbucketRepository[];
}

export interface BitbucketCommit {
  hash: string;
  links: {
    html: {
      href: string;
    };
  };
  date: string; // ISO 8601
}

export interface BitbucketAppInstallation {
  installations: { uuid: string }[];
}
