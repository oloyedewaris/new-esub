import { useId } from 'react';
import type { BankAccount } from '../api';
import { formatAccountNumber } from '../lib/format';

interface BankAccountCardProps {
  account: BankAccount;
  copied: boolean;
  onCopied: () => void;
}

/** One bank account the buyer can pay into, with a Copy button. */
export function BankAccountCard({ account, copied, onCopied }: BankAccountCardProps) {
  const numberId = useId();
  const bankInitials = account.bankName.split(' ')[0].slice(0, 2).toUpperCase();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      onCopied();
    } catch {
      // Clipboard blocked (e.g. inside an iframe): select the number so they can copy it.
      const el = document.getElementById(numberId);
      if (!el) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(range);
    }
  };

  return (
    <div className="bank-card">
      <span className="bank-card__logo" aria-hidden="true">
        {bankInitials}
      </span>
      <div className="bank-card__info">
        <span>{account.bankName}</span>
        <b className="bank-card__number" id={numberId}>
          {formatAccountNumber(account.accountNumber)}
        </b>
        <span>{account.accountName}</span>
      </div>
      <button type="button" className="btn-copy" onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
