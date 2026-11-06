/**
 * The data shapes the form works with.
 * Amounts are in naira (whole numbers). Dates are ISO 8601 strings.
 *
 * If your API uses different field names, don't change these:
 * convert the response in ./mappers.ts instead.
 */

/** The estate the buyer opened from the share link. */
export interface Listing {
  id: string;
  name: string; //           "Montego Skyline"
  developer: string; //      "Henry Montego Homes"
  location: string; //       "VI Extension, Lagos" (shown on the photo)
  heroImageUrl: string;
  palette?: string[]; //     optional unit card colours
  agent: Agent | null; //    the realtor who shared the link
  plan: PlanRules;
  units: Unit[];
}

export interface Agent {
  id: string;
  name: string; //  "Gbemileke P"
  role: string; //  "Realtor"
  avatarUrl?: string;
}

export interface Unit {
  id: string;
  name: string; //   "3 Bed Apartment"
  label: string; //  "APARTMENT · 3 BR" (small caption above the name)
  price: number;
  /**
   * null → AVAILABLE
   * 1, 2 … → "1 left", "2 left"
   * 0 → SOLD OUT (card can't be tapped)
   */
  unitsLeft: number | null;
  exploreUrl?: string; // "Explore unit" link, opens in a new tab
  color?: string; //      card colour; falls back to listing.palette
}

export interface PlanRules {
  monthOptions: number[]; //      slider stops in months, 0 = pay outright
  depositRate: number; //         0.1 = 10% deposit on instalment plans
}

export interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  occupation: string;
}

export interface VerifyOtpResult {
  /** Proves the email was verified; sent back with createSubscription. */
  verificationToken: string;
  /** Saved details from a previous purchase, or null for a new buyer. */
  customer: Customer | null;
}

export const SOURCES_OF_FUNDS = [
  'Salary',
  'Business income',
  'Savings',
  'Investments',
  'Gift or inheritance',
  'Loan or mortgage',
  'Other',
] as const;

export type SourceOfFunds = (typeof SOURCES_OF_FUNDS)[number];

export interface CreateSubscriptionInput {
  listingId: string;
  unitId: string;
  planMonths: number;
  agentId: string | null;
  email: string;
  verificationToken: string;
  customer: Customer;
  sourceOfFunds: SourceOfFunds;
}

export interface Subscription {
  id: string;
  reference: string; //   "MS-1047", used as the transfer narration
  amountDue: number; //   the deposit, or the full price when paying outright
  totalAmount: number;
  accounts: BankAccount[];
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export type PaymentStatus =
  { status: 'pending' } | { status: 'confirmed'; amountPaid: number; totalAmount: number; paidAt?: string };
