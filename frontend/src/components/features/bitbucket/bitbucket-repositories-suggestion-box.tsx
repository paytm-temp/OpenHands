import React from "react";
import { SuggestionBox } from "#/components/features/suggestions/suggestion-box";
import BitbucketLogo from "#/assets/branding/github-logo.svg?react";
import { BitbucketRepositorySelector } from "./bitbucket-repo-selector";
import { ModalButton } from "#/components/shared/buttons/modal-button";
import { ConnectToBitbucketModal } from "#/components/shared/modals/connect-to-bitbucket-modal";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { isBitbucketErrorResponse } from "#/api/bitbucket-axios-instance";
import { useAppRepositories } from "#/hooks/query/use-app-repositories-bitbucket";
import { useSearchRepositories } from "#/hooks/query/use-search-repositories-bitbucket";
import { useUserRepositories } from "#/hooks/query/use-user-repositories-bitbucket";
import { sanitizeQuery } from "#/utils/sanitize-query";
import { useDebounce } from "#/hooks/use-debounce";
import {
  BitbucketErrorResponse,
  BitbucketRepository,
  BitbucketUser,
} from "#/types/bitbucket";

interface BitbucketRepositoriesSuggestionBoxProps {
  handleSubmit: () => void;
  bitbucketAuthUrl: string | null;
  user: BitbucketErrorResponse | BitbucketUser | null;
  className?: string;
}

export function BitbucketRepositoriesSuggestionBox({
  handleSubmit,
  bitbucketAuthUrl,
  user,
  className,
}: BitbucketRepositoriesSuggestionBoxProps) {
  const [connectToBitbucketModalOpen, setConnectToBitbucketModalOpen] =
    React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: appRepositories } = useAppRepositories();
  const { data: userRepositories } = useUserRepositories();
  const { data: searchedRepos } = useSearchRepositories(
    sanitizeQuery(debouncedSearchQuery),
  );

  const repositories: BitbucketRepository[] =
    userRepositories?.pages?.flatMap((page) => page.data) ||
    appRepositories?.pages?.flatMap((page) => page.data) ||
    [];

  const handleConnectToBitbucket = () => {
    if (bitbucketAuthUrl) {
      window.location.href = bitbucketAuthUrl;
    } else {
      setConnectToBitbucketModalOpen(true);
    }
  };

  const isLoggedIn = !!user && !isBitbucketErrorResponse(user);

  return (
    <div className={className}>
      <SuggestionBox
        title="Open a Repo"
        content={
          isLoggedIn ? (
            <BitbucketRepositorySelector
              onInputChange={setSearchQuery}
              onSelect={handleSubmit}
              publicRepositories={searchedRepos}
              userRepositories={repositories}
            />
          ) : (
            <ModalButton
              text="Connect to Bitbucket"
              icon={<BitbucketLogo width={20} height={20} />}
              className="bg-[#791B80] w-full"
              onClick={handleConnectToBitbucket}
            />
          )
        }
      />
      {connectToBitbucketModalOpen && (
        <ModalBackdrop onClose={() => setConnectToBitbucketModalOpen(false)}>
          <ConnectToBitbucketModal
            onClose={() => setConnectToBitbucketModalOpen(false)}
          />
        </ModalBackdrop>
      )}
    </div>
  );
}
