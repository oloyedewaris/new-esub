import { useEffect, useState } from 'react';
import { api, toMessage, type Subscription, type Unit } from '../api';
import { usePaymentStatus } from '../hooks/usePaymentStatus';
import { formatNaira } from '../lib/format';
import { UnitTicket } from '../components/UnitTicket';
import { ActionBar } from '../components/ActionBar';
import { BankAccountCard } from '../components/BankAccountCard';
import { Spinner } from '../components/Spinner';
import { PaymentConfirmed } from './PaymentConfirmed';

interface PaymentStepProps {
  unit: Unit;
  isInstalment: boolean;
  email: string;
  subscription: Subscription;
  onConfirmed: () => void;
  onBack: () => void;
}

/** Step 4. Show the accounts, then wait for the backend to confirm the transfer. */
export function PaymentStep({
  unit,
  isInstalment,
  email,
  subscription,
  onConfirmed,
  onBack,
}: PaymentStepProps) {
  const { check, startChecking } = usePaymentStatus(subscription.id);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const isConfirmed = check.state === 'confirmed';
  useEffect(() => {
    if (isConfirmed) onConfirmed();
  }, [isConfirmed, onConfirmed]);

  const markPaymentSent = async () => {
    setError(null);
    setSending(true);
    try {
      await api.markPaymentSent(subscription.id);
      startChecking();
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setSending(false);
    }
  };

  if (check.state === 'confirmed') {
    return <PaymentConfirmed unit={unit} amountPaid={check.amountPaid} totalAmount={check.totalAmount} />;
  }

  const isWaiting = check.state === 'checking' || check.state === 'timed-out';

  return (
    <>
      <UnitTicket unit={unit} />
      <h2>{isInstalment ? 'Pay your deposit' : 'Make your payment'}</h2>

      <div className="amount-due">
        <span className="caption">{isInstalment ? 'DEPOSIT' : 'AMOUNT TO PAY'}</span>
        <b className="amount-due__value">{formatNaira(subscription.amountDue)}</b>
        <span className="caption">Pay into any one of these accounts</span>
      </div>

      <div className="bank-list">
        {subscription.accounts.map((account, i) => (
          <BankAccountCard
            key={account.accountNumber}
            account={account}
            copied={copiedIndex === i}
            onCopied={() => setCopiedIndex(i)}
          />
        ))}
      </div>

      <p className="hint narration">
        Use <b>{subscription.reference}</b> as your transfer narration.
      </p>

      {check.state === 'idle' && (
        <p className="hint">
          Your payment is confirmed automatically, even on weekends. Your receipt comes straight to {email}.
        </p>
      )}
      {check.state === 'checking' && (
        <p className="status-note" role="status">
          <Spinner /> Checking for your payment. This usually takes a minute.
        </p>
      )}
      {check.state === 'timed-out' && (
        <p className="status-note is-warning" role="status">
          We haven't seen your payment yet. Transfers can take a few minutes. We'll email your receipt to{' '}
          {email} as soon as it lands.
        </p>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <ActionBar
        onBack={isWaiting ? undefined : onBack}
        onNext={check.state === 'timed-out' ? startChecking : markPaymentSent}
        busy={sending || check.state === 'checking'}
      >
        {check.state === 'timed-out' ? 'Check again' : "I've made payment"}
      </ActionBar>
    </>
  );
}
