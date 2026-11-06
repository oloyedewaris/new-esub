import { formatMonthYear, formatNaira } from '../lib/format';
import type { PlanBreakdown } from '../lib/plan';

interface PlanSummaryProps {
  unit: any;
  summary: any;
  selectedPlan: any;
}

/** Total, deposit, monthly amount, documentation fee and the payment chart. */
export function PlanSummary({ unit, summary, selectedPlan }: PlanSummaryProps) {
  // const {periodicPayment,
  //   planType,
  //   payFreq,
  //   total,
  //   dueToday,
  //   fees,
  //   endDate,} = summary

  const remainingAmount =
    Number(selectedPlan?.purchase_price) - Number(selectedPlan?.initial_deposit_in_value);

  return (
    <div className="plan-summary">
      <div className="plan-summary__head">
        <span className="caption">TOTAL TO PAY</span>
        <b className="plan-summary__total">{formatNaira(summary?.total)}</b>
      </div>

      <i className="dashed-divider" />

      <div className="plan-summary__rows">
        {summary?.isOutright ? (
          <Row label="One payment" value={unit?.price} />
        ) : (
          <>
            <Row
              label={`Deposit today (${selectedPlan?.initial_deposit_in_percentage}%)`}
              value={selectedPlan?.initial_deposit_in_value}
            />
            <Row
              label={`Then ${summary?.payFreq || 'Flexible payment'} ${summary?.payFreq ? '× ' + selectedPlan?.payment_period_in_months : ''}`}
              value={
                summary?.payFreq
                  ? summary?.periodicPayment * selectedPlan?.payment_period_in_months
                  : remainingAmount
              }
            />
          </>
        )}
        {summary?.fees?.length > 0 && (
          <>
            {summary?.fees?.map((fee: any) => (
              <Row label={fee.name} value={fee?.amount} muted />
            ))}
          </>
        )}
      </div>

      {/* {!isOutright && (
        <>
          <i className="dashed-divider" />
          <PaymentChart plan={plan} />
        </>
      )} */}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={'plan-summary__row' + (muted ? ' is-muted' : '')}>
      <span>{label}</span>
      {value && <b>{formatNaira(value)}</b>}
    </div>
  );
}

/**
 * One tall bar for the deposit, then one bar per payment.
 * Plans over 12 months group the bars by quarter so they stay readable.
 */
// function PaymentChart({ plan }: { plan: PlanBreakdown }) {
//   const monthsPerBar = summary?.months > 12 ? 3 : 1;
//   const barCount = Math.ceil(summary?.months / monthsPerBar);
//   const barAmount = summary?.monthly * monthsPerBar;
//   const tallest = Math.max(summary?.dueToday, barAmount);
//   const heightOf = (amount: number) => `${(amount / tallest) * 100}%`;

//   return (
//     <div className="plan-chart">
//       <div className="plan-chart__bars" aria-hidden="true">
//         <i className="is-deposit" style={{ height: `max(18%, ${heightOf(summary?.dueToday)})` }} />
//         {Array.from({ length: barCount }, (_, i) => (
//           <i key={i} style={{ height: heightOf(barAmount) }} />
//         ))}
//       </div>
//       <div className="plan-chart__axis">
//         <span>TODAY</span>
//         <span>{formatMonthYear(summary?.endDate)}</span>
//       </div>
//       {monthsPerBar === 3 && (
//         <p className="plan-chart__legend">Each bar is one quarter (3 monthly payments)</p>
//       )}
//     </div>
//   );
// }
