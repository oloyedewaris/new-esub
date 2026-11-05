import { formatMonthYear, formatNaira } from '../lib/format';
import type { PlanBreakdown } from '../lib/plan';

interface PlanSummaryProps {
  plan: PlanBreakdown;
  depositRate: number;
}

/** Total, deposit, monthly amount, documentation fee and the payment chart. */
export function PlanSummary({ plan, depositRate }: PlanSummaryProps) {
  const isOutright = plan.months === 0;
  const depositPercent = Math.round(depositRate * 100);

  return (
    <div className="plan-summary">
      <div className="plan-summary__head">
        <span className="caption">TOTAL TO PAY</span>
        <b className="plan-summary__total">{formatNaira(plan.total)}</b>
      </div>

      <i className="dashed-divider" />

      <div className="plan-summary__rows">
        {isOutright ? (
          <Row label="One payment" value={plan.total} />
        ) : (
          <>
            <Row label={`Deposit today (${depositPercent}%)`} value={plan.dueToday} />
            <Row label={`Then monthly × ${plan.months}`} value={plan.monthly} />
          </>
        )}
        {plan.documentationFee > 0 && <Row label="Documentation fee" value={plan.documentationFee} muted />}
      </div>

      {!isOutright && (
        <>
          <i className="dashed-divider" />
          <PaymentChart plan={plan} />
        </>
      )}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={'plan-summary__row' + (muted ? ' is-muted' : '')}>
      <span>{label}</span>
      <b>{formatNaira(value)}</b>
    </div>
  );
}

/**
 * One tall bar for the deposit, then one bar per payment.
 * Plans over 12 months group the bars by quarter so they stay readable.
 */
function PaymentChart({ plan }: { plan: PlanBreakdown }) {
  const monthsPerBar = plan.months > 12 ? 3 : 1;
  const barCount = Math.ceil(plan.months / monthsPerBar);
  const barAmount = plan.monthly * monthsPerBar;
  const tallest = Math.max(plan.dueToday, barAmount);
  const heightOf = (amount: number) => `${(amount / tallest) * 100}%`;

  return (
    <div className="plan-chart">
      <div className="plan-chart__bars" aria-hidden="true">
        <i className="is-deposit" style={{ height: `max(18%, ${heightOf(plan.dueToday)})` }} />
        {Array.from({ length: barCount }, (_, i) => (
          <i key={i} style={{ height: heightOf(barAmount) }} />
        ))}
      </div>
      <div className="plan-chart__axis">
        <span>TODAY</span>
        <span>{formatMonthYear(plan.endDate)}</span>
      </div>
      {monthsPerBar === 3 && (
        <p className="plan-chart__legend">Each bar is one quarter (3 monthly payments)</p>
      )}
    </div>
  );
}
