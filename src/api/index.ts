import { request } from './client';
import { ENDPOINTS, USE_MOCK } from './endpoints';
import * as map from './mappers';
import { mockApi } from './mock';
import type { CreateSubscriptionInput, Listing, PaymentStatus, Subscription, VerifyOtpResult } from './types';

/**
 * Every call the form makes. Components only ever use `api.*`.
 * Paths live in ./endpoints.ts, response conversion in ./mappers.ts.
 */
export interface EsubApi {
  getListing(listingId: string, agentId: string | null): Promise<Listing>;
  sendOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<VerifyOtpResult>;
  createSubscription(input: CreateSubscriptionInput): Promise<Subscription>;
  markPaymentSent(subscriptionId: string): Promise<void>;
  getPaymentStatus(subscriptionId: string): Promise<PaymentStatus>;
}

const liveApi: EsubApi = {
  async getListing(listingId, agentId) {
    return map.toListing(await request(ENDPOINTS.getListing(listingId, agentId)));
  },

  async sendOtp(email) {
    await request(ENDPOINTS.sendOtp(), { email });
  },

  async verifyOtp(email, code) {
    return map.toVerifyOtpResult(await request(ENDPOINTS.verifyOtp(), { email, code }));
  },

  async createSubscription(input) {
    return map.toSubscription(await request(ENDPOINTS.createSubscription(), input));
  },

  async markPaymentSent(subscriptionId) {
    await request(ENDPOINTS.markPaymentSent(subscriptionId), {});
  },

  async getPaymentStatus(subscriptionId) {
    return map.toPaymentStatus(await request(ENDPOINTS.getPaymentStatus(subscriptionId)));
  },
};

export const api: EsubApi = USE_MOCK ? mockApi : liveApi;

export * from './types';
export { ApiError, toMessage } from './client';
