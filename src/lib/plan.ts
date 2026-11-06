import type { PlanRules, Unit } from '../api/types';

export interface PlanBreakdown {
  months: number;
  total: number;
  /** Due today: the deposit, or the full price when paying outright. */
  dueToday: number;
  /** Each monthly instalment after the deposit (0 when paying outright). */
  monthly: number;
  fees: any[];
  endDate: Date;
}

/**
 * Works out the figures shown on the plan page.
 * These are a preview: the amounts returned by createSubscription
 * are what the buyer is actually asked to pay.
 */
export function calculatePlan(unit: any, selectedPlan: any): any {
  const isOutright = !selectedPlan;
  const fees = selectedPlan ? selectedPlan?.bundle?.fees : unit?.fees;
  const totalFees = fees?.reduce((sum: any, item: any) => sum + Number(item.amount), 0);
  const total = selectedPlan
    ? Number(selectedPlan?.purchase_price) + totalFees
    : Number(unit.price) + totalFees;
  const dueToday = isOutright ? total : Number(selectedPlan?.initial_deposit_in_value);
  const periodicPayment = Number(selectedPlan?.periodic_payment);
  const planType = selectedPlan?.plan_type;
  const payFreq = selectedPlan?.payment_frequency;

  const endDate = new Date();
  if (selectedPlan?.payment_period_in_months) {
    endDate.setMonth(endDate.getMonth() + Number(selectedPlan?.payment_period_in_months));
  }
  return {
    isOutright,
    periodicPayment,
    planType,
    payFreq,
    total,
    dueToday,
    fees,
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
