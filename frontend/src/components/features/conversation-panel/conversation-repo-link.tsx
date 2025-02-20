interface ConversationRepoLinkProps {
  selectedRepository: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  provider: string | null;
}

export function ConversationRepoLink({
  selectedRepository,
  provider,
  onClick,
}: ConversationRepoLinkProps) {
  return (
    <a
      data-testid="conversation-card-selected-repository"
      href={
        provider === "github"
          ? `https://github.com/${selectedRepository}`
          : `https://bitbucket.org/${selectedRepository}`
      }
      target="_blank noopener noreferrer"
      onClick={onClick}
      className="text-xs text-neutral-400 hover:text-neutral-200"
    >
      {selectedRepository}
    </a>
  );
}
