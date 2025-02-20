import { useTranslation } from "react-i18next";
import { ModalBody } from "./modal-body";
import {
  BaseModalDescription,
  BaseModalTitle,
} from "./confirmation-modals/base-modal";
import { I18nKey } from "#/i18n/declaration";
import { useAuth } from "#/context/auth-context";
import { ModalButton } from "../buttons/modal-button";
import { CustomInput } from "../custom-input";
import { setAuthTokenHeader } from "#/api/bitbucket-axios-instance";
import { setBitbucketCredentialsHeader } from "#/api/open-hands-axios";

interface ConnectToBitbucketModalProps {
  onClose: () => void;
}

export function ConnectToBitbucketModal({
  onClose,
}: ConnectToBitbucketModalProps) {
  const {
    bitbucketPassword,
    setBitBucketPassword,
    bitbucketUsername,
    setBitBucketUsername,
  } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bbPassword = formData.get("bbPassword")?.toString();
    const bbUsername = formData.get("bbUsername")?.toString();
    if (bbPassword && bbUsername) {
      setBitBucketPassword(bbPassword);
      setBitBucketUsername(bbUsername);
      setAuthTokenHeader(bbUsername, bbPassword);
      setBitbucketCredentialsHeader(bbUsername, bbPassword);
    }
    onClose();
  };

  return (
    <ModalBody>
      <div className="flex flex-col gap-2 self-start">
        <BaseModalTitle title="Connect to Bitbucket" />
        <BaseModalDescription
          description={
            <span>
              {t(I18nKey.CONNECT_TO_BITBUCKET_MODAL$GET_YOUR_PASSWORD)}{" "}
              <a
                href="https://bitbucket.org/account/settings/app-passwords/new"
                target="_blank"
                rel="noreferrer noopener"
                className="text-[#791B80] underline"
              >
                {t(I18nKey.CONNECT_TO_BITBUCKET_MODAL$HERE)}
              </a>
            </span>
          }
        />
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <CustomInput
          label="Bitbucket Username"
          name="bbUsername"
          required
          type="text"
          defaultValue={bitbucketUsername ?? ""}
        />
        <CustomInput
          label="Bitbucket Password"
          name="bbPassword"
          required
          type="password"
          defaultValue={bitbucketPassword ?? ""}
        />

        <div className="flex flex-col gap-2 w-full">
          <ModalButton
            testId="connect-to-bitbucket"
            type="submit"
            text={t(I18nKey.CONNECT_TO_GITHUB_MODAL$CONNECT)}
            className="bg-[#791B80] w-full"
          />
          <ModalButton
            onClick={onClose}
            text={t(I18nKey.CONNECT_TO_GITHUB_MODAL$CLOSE)}
            className="bg-[#737373] w-full"
          />
        </div>
      </form>
    </ModalBody>
  );
}
