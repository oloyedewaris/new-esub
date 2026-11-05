import { ApiError } from './client';
import type { EsubApi } from './index';
import type { Listing } from './types';

/**
 * Sample data so the form runs before the backend is ready.
 * Turn on with VITE_USE_MOCK=true.
 *
 *   • The one-time code is 123456.
 *   • An email containing "new" acts like a first-time buyer.
 *   • Payment confirms on the third status check (~9 seconds).
 */

const MOCK_OTP = '123456';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const LISTING: Listing = {
  id: 'montego-skyline',
  name: 'Montego Skyline',
  developer: 'Henry Montego Homes',
  location: 'VI Extension, Lagos',
  heroImageUrl: '/mock/hero.jpg',
  agent: { id: 'gbemileke', name: 'Gbemileke P', role: 'Realtor', avatarUrl: '/mock/agent.jpg' },
  plan: {
    monthOptions: [0, 12, 24, 36, 48, 60, 72, 84, 96],
    depositRate: 0.1,
    annualInterestRate: 0,
    documentationFeeRate: 0.05,
  },
  units: [
    {
      id: '3ba',
      name: '3 Bed Apartment',
      label: 'APARTMENT · 3 BR',
      price: 90_000_000,
      unitsLeft: 1,
      exploreUrl: 'https://apartment-unit-allocation-alpha.vercel.app/units/134',
    },
    {
      id: '3md',
      name: '3 Bed Maisonette Duplex',
      label: 'MAISONETTE DUPLEX · 3 BR',
      price: 106_560_000,
      unitsLeft: 2,
      exploreUrl: 'https://apartment-unit-allocation-alpha.vercel.app/units/112',
    },
    {
      id: '4ba',
      name: '4 Bed Apartment',
      label: 'APARTMENT · 4 BR',
      price: 130_000_000,
      unitsLeft: 0,
    },
  ],
};

const RETURNING_CUSTOMER = {
  fullName: 'Tolu Adeyemi',
  phone: '0803 412 7781',
  address: '14 Admiralty Way, Lekki Phase 1, Lagos',
  occupation: 'Product manager',
};

const ACCOUNTS = [
  {
    bankName: 'Flutterwave MFB (Formerly OK MFB)',
    accountNumber: '9447024234',
    accountName: 'Henry Montego Homes',
  },
  { bankName: 'Wema Bank', accountNumber: '0124559870', accountName: 'Henry Montego Homes' },
  { bankName: 'Zenith Bank', accountNumber: '1310772945', accountName: 'Henry Montego Homes' },
];

/** Remembers each mock subscription so the status check can report its amounts. */
const subscriptions = new Map<string, { amountDue: number; total: number; checks: number }>();

export const mockApi: EsubApi = {
  async getListing() {
    await delay(500);
    return structuredClone(LISTING);
  },

  async sendOtp() {
    await delay(900);
  },

  async verifyOtp(email, code) {
    await delay(700);
    if (code !== MOCK_OTP) {
      throw new ApiError('That code is not right. Check it and try again.', 400, 'INVALID_OTP');
    }
    const isNewBuyer = /new/i.test(email);
    return { verificationToken: 'mock-token', customer: isNewBuyer ? null : RETURNING_CUSTOMER };
  },

  async createSubscription(input) {
    await delay(900);
    const unit = LISTING.units.find((u) => u.id === input.unitId)!;
    const { depositRate, annualInterestRate } = LISTING.plan;

    const total = unit.price * (1 + (annualInterestRate * input.planMonths) / 12);
    const amountDue = input.planMonths ? total * depositRate : total;
    const id = `sub_${Date.now()}`;

    subscriptions.set(id, { amountDue, total, checks: 0 });
    return { id, reference: 'MS-1047', amountDue, totalAmount: total, accounts: ACCOUNTS };
  },

  async markPaymentSent() {
    await delay(400);
  },

  async getPaymentStatus(subscriptionId) {
    await delay(300);
    const sub = subscriptions.get(subscriptionId);
    if (!sub) return { status: 'pending' };

    sub.checks += 1;
    if (sub.checks < 3) return { status: 'pending' };
    return {
      status: 'confirmed',
      amountPaid: sub.amountDue,
      totalAmount: sub.total,
      paidAt: new Date().toISOString(),
    };
  },
};
