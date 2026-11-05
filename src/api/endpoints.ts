/**
 * ─────────────────────────────────────────────────────────────
 *  ENDPOINTS: the one file to edit when plugging in the backend.
 * ─────────────────────────────────────────────────────────────
 *
 * The base URL comes from VITE_API_BASE_URL in your .env file.
 * Each entry is one call the form makes. Change the method or
 * path to match your backend; nothing else needs to change.
 *
 * If your backend returns differently named fields, convert them
 * in ./mappers.ts.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

/** Set VITE_USE_MOCK=true to run on the sample data in ./mock.ts. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  path: string;
}

const enc = encodeURIComponent;

export const ENDPOINTS = {
  /** Step 1: estate, agent, plan rules and units. */
  getListing: (listingId: string, agentId: string | null): Endpoint => ({
    method: 'GET',
    path: `/listings/${enc(listingId)}` + (agentId ? `?agent=${enc(agentId)}` : ''),
  }),

  /** Step 3: email the buyer a 6-digit code. Body: { email } */
  sendOtp: (): Endpoint => ({
    method: 'POST',
    path: '/auth/otp',
  }),

  /** Step 3: check the code. Body: { email, code } */
  verifyOtp: (): Endpoint => ({
    method: 'POST',
    path: '/auth/otp/verify',
  }),

  /** Step 3 → 4: create the subscription. Body: CreateSubscriptionInput */
  createSubscription: (): Endpoint => ({
    method: 'POST',
    path: '/subscriptions',
  }),

  /** Step 4: buyer tapped "I've made payment". Body: {} */
  markPaymentSent: (subscriptionId: string): Endpoint => ({
    method: 'POST',
    path: `/subscriptions/${enc(subscriptionId)}/payment-sent`,
  }),

  /** Step 4: polled until the payment is confirmed. */
  getPaymentStatus: (subscriptionId: string): Endpoint => ({
    method: 'GET',
    path: `/subscriptions/${enc(subscriptionId)}/payment-status`,
  }),
};
