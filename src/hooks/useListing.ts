import { useEffect, useState } from 'react';
import { api, toMessage, type Listing } from '../api';

const MISSING_LISTING = 'This link is incomplete. Please ask your agent to send it again.';

/** Loads the listing, with a retry for when it fails. */
export function useListing(listingId: string | null, agentId: string | null) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!listingId) {
      setError(MISSING_LISTING);
      return;
    }

    let ignore = false; // drop the response if the page moved on before it arrived
    setError(null);

    api
      .getListing(listingId, agentId)
      .then((data) => {
        if (ignore) return;
        setListing(data);
        document.title = `${data.name} by ${data.developer}`;
      })
      .catch((e) => {
        if (!ignore) setError(toMessage(e));
      });

    return () => {
      ignore = true;
    };
  }, [listingId, agentId, attempt]);

  const retry = () => setAttempt((n) => n + 1);

  return { listing, error, retry };
}
