import React from "react";
import { useDispatch } from "react-redux";
import posthog from "posthog-js";
import { setImportedProjectZip } from "#/state/initial-query-slice";
import { convertZipToBase64 } from "#/utils/convert-zip-to-base64";
import { useGitHubUser } from "#/hooks/query/use-github-user";
import { useGitHubAuthUrl } from "#/hooks/use-github-auth-url";
import { useConfig } from "#/hooks/query/use-config";
import { useAuth } from "#/context/auth-context";
import { ImportProjectSuggestionBox } from "../../components/features/suggestions/import-project-suggestion-box";
import { GitHubRepositoriesSuggestionBox } from "#/components/features/github/github-repositories-suggestion-box";
import { BitbucketRepositoriesSuggestionBox } from "#/components/features/bitbucket/bitbucket-repositories-suggestion-box";
import { HeroHeading } from "#/components/shared/hero-heading";
import { TaskForm } from "#/components/shared/task-form";
import { useBitbucketAuthUrl } from "#/hooks/use-bitbucket-auth-url";
import { useBitbucketUser } from "#/hooks/query/use-bitbucket-user";

function Home() {
  const { gitHubToken, bitbucketPassword, bitbucketUsername } = useAuth();
  const dispatch = useDispatch();
  const formRef = React.useRef<HTMLFormElement>(null);

  const { data: config } = useConfig();
  const { data: user } = useGitHubUser();
  const { data: bitbucketUser } = useBitbucketUser();
  const gitHubAuthUrl = useGitHubAuthUrl({
    gitHubToken,
    appMode: config?.APP_MODE || null,
    gitHubClientId: config?.GITHUB_CLIENT_ID || null,
  });

  const bitbucketAuthUrl = useBitbucketAuthUrl({
    bitbucketPassword,
    bitbucketUsername,
    appMode: config?.APP_MODE || null,
    bitbucketClientId: config?.BITBUCKET_CLIENT_ID || null,
  });

  const latestConversation = localStorage.getItem("latest_conversation_id");

  return (
    <div className="bg-root-secondary h-full rounded-xl flex flex-col items-center justify-center relative overflow-y-auto px-2">
      <HeroHeading />
      <div className="flex flex-col gap-8 w-full md:w-[600px] items-center">
        <div className="flex flex-col gap-2 w-full">
          <TaskForm ref={formRef} />
        </div>

        <div className="flex gap-4 w-full flex-col md:flex-row justify-center items-center">
          <BitbucketRepositoriesSuggestionBox
            className="flex-1 min-w-[250px]"
            handleSubmit={() => formRef.current?.requestSubmit()}
            bitbucketAuthUrl={bitbucketAuthUrl}
            user={bitbucketUser || null}
          />
          <GitHubRepositoriesSuggestionBox
            className="flex-1 min-w-[250px]"
            handleSubmit={() => formRef.current?.requestSubmit()}
            gitHubAuthUrl={gitHubAuthUrl}
            user={user || null}
          />
          <ImportProjectSuggestionBox
            className="flex-1 min-w-[250px]"
            onChange={async (event) => {
              if (event.target.files) {
                const zip = event.target.files[0];
                dispatch(setImportedProjectZip(await convertZipToBase64(zip)));
                posthog.capture("zip_file_uploaded");
                formRef.current?.requestSubmit();
              } else {
                // TODO: handle error
              }
            }}
          />
        </div>
      </div>
      {latestConversation && (
        <div className="flex gap-4 w-full text-center mt-8">
          <p className="text-center w-full">
            Or&nbsp;
            <a
              className="underline"
              href={`/conversations/${latestConversation}`}
            >
              jump back to your most recent conversation
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;
