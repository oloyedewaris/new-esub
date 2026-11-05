import type { Listing, PaymentStatus, Subscription, VerifyOtpResult } from './types';

/**
 * ─────────────────────────────────────────────────────────────
 *  MAPPERS: convert your API's responses into the form's types.
 * ─────────────────────────────────────────────────────────────
 *
 * Right now they pass the response straight through, which works
 * if your backend already returns the shapes in ./types.ts.
 *
 * If it doesn't, rename fields here. For example, if your listing
 * endpoint returns { estate_name, units: [{ unit_id, available }] }:
 *
 *   export const toListing = (raw: any): Listing => ({
 *     ...
 *     name: raw.estate_name,
 *     units: raw.units.map((u: any) => ({
 *       id: u.unit_id,
 *       unitsLeft: u.available,
 *       ...
 *     })),
 *   });
 */

export const toListing = (raw: unknown) => raw as Listing;

export const toVerifyOtpResult = (raw: unknown) => raw as VerifyOtpResult;

export const toSubscription = (raw: unknown) => raw as Subscription;

export const toPaymentStatus = (raw: unknown) => raw as PaymentStatus;
