import type { Unit } from '../api';
import { formatNaira } from '../lib/format';
import { CheckIcon } from '../components/CheckIcon';

interface PaymentConfirmedProps {
  unit: Unit;
  amountPaid: number;
  totalAmount: number;
}

/** Shown once the backend confirms the payment. */
export function PaymentConfirmed({ unit, amountPaid, totalAmount }: PaymentConfirmedProps) {
  const outstanding = Math.max(0, totalAmount - amountPaid);

  return (
    <>
      <div className="confirmed">
        <span className="confirmed__tick">
          <CheckIcon size={36} />
        </span>
        <h2>Payment confirmed</h2>
        <p className="hint">
          {formatNaira(amountPaid)} received for your {unit.name}.
        </p>
      </div>

      <div className="balance-card">
        <span className="caption">TOTAL TO PAY</span>
        <b className="balance-card__total">{formatNaira(totalAmount)}</b>
        <div className="balance-card__row">
          <span>Paid so far</span>
          <b>{formatNaira(amountPaid)}</b>
        </div>
        <div className="balance-card__row">
          <span>Outstanding</span>
          <b>{formatNaira(outstanding)}</b>
        </div>
      </div>
    </>
  );
}
