import type { Listing } from '../api';

/** Agent photo, estate name, "Shared by …" and the LIVE badge. */
export function ListingHeader({ listing }: { listing: Listing }) {
  const { agent, name, developer } = listing;
  const subtitle = agent ? `Shared by ${agent.name}, ${agent.role}` : `By ${developer}`;

  return (
    <div className="listing-header">
      {agent?.avatarUrl ? (
        <img className="avatar" src={agent.avatarUrl} alt={agent.name} />
      ) : (
        <span className="avatar" aria-hidden="true">
          {initials(agent?.name ?? developer)}
        </span>
      )}
      <div>
        <h1 className="listing-header__name">{name}</h1>
        <p className="listing-header__subtitle">{subtitle}</p>
      </div>
      <span className="live-badge">LIVE</span>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
