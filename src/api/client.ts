import { API_BASE_URL, type Endpoint } from './endpoints';

/** Error with a message that is safe to show the buyer. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

/**
 * Extra headers sent with every request.
 * Add an API key or auth token here if your backend needs one, e.g.
 *   return { Authorization: `Bearer ${token}` };
 */
function extraHeaders(): Record<string, string> {
  return {};
}

/**
 * Reads the buyer-facing message from an error response.
 * Expects `{ "message": "..." }`; change this if your errors look different.
 */
function errorMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'message' in body) return String(body.message);
  return undefined;
}

const NETWORK_ERROR = 'Could not reach the server. Check your connection and try again.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

/** Calls an endpoint and returns the parsed JSON (or null for an empty body). */
export async function request(endpoint: Endpoint, body?: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(API_BASE_URL + endpoint.path, {
      method: endpoint.method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...extraHeaders(),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // credentials: 'include',  // uncomment if your backend uses cookies
    });
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }

  // Empty bodies (e.g. 204 No Content) come back as null.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const code = data && typeof data === 'object' && 'code' in data ? String(data.code) : undefined;
    throw new ApiError(errorMessage(data) ?? GENERIC_ERROR, response.status, code);
  }
  return data;
}

/** Turns any thrown value into a message for the buyer. */
export function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}
