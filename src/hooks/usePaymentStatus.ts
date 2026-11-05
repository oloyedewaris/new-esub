import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const CHECK_EVERY_MS = 3_000;
const GIVE_UP_AFTER_MS = 3 * 60_000;

export type PaymentCheck =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'timed-out' }
  | { state: 'confirmed'; amountPaid: number; totalAmount: number };

/**
 * Asks the backend for the payment status every few seconds
 * after the buyer says they've paid. Stops when confirmed, or
 * after a few minutes (the buyer can then check again).
 */
export function usePaymentStatus(subscriptionId: string) {
  const [check, setCheck] = useState<PaymentCheck>({ state: 'idle' });
  const startedAt = useRef(0);

  useEffect(() => {
    if (check.state !== 'checking') return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await api.getPaymentStatus(subscriptionId);
        if (cancelled) return;
        if (result.status === 'confirmed') {
          setCheck({ state: 'confirmed', amountPaid: result.amountPaid, totalAmount: result.totalAmount });
          return;
        }
      } catch {
        // A failed check is retried on the next tick.
      }
      if (cancelled) return;
      if (Date.now() - startedAt.current > GIVE_UP_AFTER_MS) setCheck({ state: 'timed-out' });
      else timer = setTimeout(poll, CHECK_EVERY_MS);
    };

    timer = setTimeout(poll, CHECK_EVERY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [check.state, subscriptionId]);

  const startChecking = () => {
    startedAt.current = Date.now();
    setCheck({ state: 'checking' });
  };

  return { check, startChecking };
}
