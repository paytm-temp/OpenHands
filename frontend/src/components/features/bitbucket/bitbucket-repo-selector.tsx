import React from "react";
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from "@nextui-org/react";
import { useDispatch } from "react-redux";
import posthog from "posthog-js";
import { setSelectedRepository } from "#/state/initial-query-slice";
import { useConfig } from "#/hooks/query/use-config";
import { sanitizeQuery } from "#/utils/sanitize-query";
import { BitbucketRepository } from "#/types/bitbucket";

interface BitbucketRepositorySelectorProps {
  onInputChange: (value: string) => void;
  onSelect: () => void;
  userRepositories: BitbucketRepository[];
  publicRepositories: BitbucketRepository[];
}

export function BitbucketRepositorySelector({
  onInputChange,
  onSelect,
  userRepositories,
  publicRepositories,
}: BitbucketRepositorySelectorProps) {
  const { data: config } = useConfig();
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  const allRepositories: BitbucketRepository[] = [
    ...publicRepositories.filter(
      (repo) => !publicRepositories.find((r) => r.name === repo.name),
    ),
    ...userRepositories,
  ];

  const dispatch = useDispatch();

  const handleRepoSelection = (name: string | null) => {
    const repo = allRepositories.find((r) => r.name.toString() === name);
    if (repo) {
      dispatch(setSelectedRepository(repo.full_name));
      posthog.capture("repository_selected");
      onSelect();
      setSelectedKey(name);
    }
  };

  const handleClearSelection = () => {
    dispatch(setSelectedRepository(null));
  };

  const emptyContent = "No results found.";

  return (
    <Autocomplete
      data-testid="bitbucket-repo-selector"
      name="repo"
      aria-label="Bitbucket Repository"
      placeholder="Select a project"
      isVirtualized={false}
      selectedKey={selectedKey}
      inputProps={{
        classNames: {
          inputWrapper:
            "text-sm w-full rounded-[4px] px-3 py-[10px] bg-[#525252] text-[#A3A3A3]",
        },
      }}
      onSelectionChange={(name) =>
        handleRepoSelection(name?.toString() ?? null)
      }
      onInputChange={onInputChange}
      clearButtonProps={{ onClick: handleClearSelection }}
      listboxProps={{
        emptyContent,
      }}
      defaultFilter={(textValue, inputValue) =>
        !inputValue ||
        sanitizeQuery(textValue).includes(sanitizeQuery(inputValue))
      }
    >
      {config?.APP_MODE === "saas" &&
        config?.APP_SLUG &&
        ((
          <AutocompleteItem key="install">
            <a
              href={`https://github.com/apps/${config.APP_SLUG}/installations/new`}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
            >
              Add more repositories...
            </a>
          </AutocompleteItem> // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any)}
      {userRepositories.length > 0 && (
        <AutocompleteSection showDivider title="Your Repos">
          {userRepositories.map((repo) => (
            <AutocompleteItem
              data-testid="bitbucket-repo-item"
              key={repo.name}
              value={repo.name}
              className="data-[selected=true]:bg-default-100"
              textValue={repo.full_name}
            >
              {repo.full_name}
            </AutocompleteItem>
          ))}
        </AutocompleteSection>
      )}
      {publicRepositories.length > 0 && (
        <AutocompleteSection showDivider title="Public Repos">
          {publicRepositories.map((repo) => (
            <AutocompleteItem
              data-testid="bitbucket-repo-item"
              key={repo.name}
              value={repo.name}
              className="data-[selected=true]:bg-default-100"
              textValue={repo.full_name}
            >
              {repo.full_name}
            </AutocompleteItem>
          ))}
        </AutocompleteSection>
      )}
    </Autocomplete>
  );
}
