import type { PlanRules, Unit } from '../api/types';

export interface PlanBreakdown {
  months: number;
  total: number;
  /** Due today: the deposit, or the full price when paying outright. */
  dueToday: number;
  /** Each monthly instalment after the deposit (0 when paying outright). */
  monthly: number;
  documentationFee: number;
  endDate: Date;
}

/**
 * Works out the figures shown on the plan page.
 * These are a preview: the amounts returned by createSubscription
 * are what the buyer is actually asked to pay.
 */
export function calculatePlan(unit: Unit, rules: PlanRules, months: number): PlanBreakdown {
  const isOutright = months === 0;
  const planCharge = (rules.annualInterestRate * months) / 12;
  const total = unit.price * (1 + planCharge);
  const dueToday = isOutright ? total : total * rules.depositRate;
  const monthly = isOutright ? 0 : (total - dueToday) / months;

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  return {
    months,
    total,
    dueToday,
    monthly,
    documentationFee: unit.price * rules.documentationFeeRate,
    endDate,
  };
}

/** "4 years (48 months)" or "Pay outright" */
export function describePlan(months: number): string {
  if (months === 0) return 'Pay outright';
  const years = months / 12;
  if (!Number.isInteger(years)) return `${months} months`;
  return `${years} ${years === 1 ? 'year' : 'years'} (${months} months)`;
}
