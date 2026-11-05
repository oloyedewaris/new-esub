import { useState, type InputHTMLAttributes } from 'react';
import { api, toMessage, SOURCES_OF_FUNDS, type Customer, type SourceOfFunds, type Unit } from '../api';
import { useCountdown } from '../hooks/useCountdown';
import { useShake } from '../hooks/useShake';
import { UnitTicket } from '../components/UnitTicket';
import { ActionBar } from '../components/ActionBar';
import { OtpInput, OTP_LENGTH } from '../components/OtpInput';
import { Spinner } from '../components/Spinner';

/** What this step hands back to App once the buyer is done. */
export interface BuyerDetails {
  email: string;
  verificationToken: string;
  customer: Customer;
  sourceOfFunds: SourceOfFunds;
  /** True when the details came from a previous purchase. */
  isReturning: boolean;
  /** Fields the backend filled in; these are shown read-only. */
  lockedFields: (keyof Customer)[];
}

interface DetailsStepProps {
  unit: Unit;
  /** Filled in when the buyer comes back to this step from payment. */
  saved: BuyerDetails | null;
  onBack: () => void;
  /** Creates the subscription. Throwing shows the error on this step. */
  onSubmit: (details: BuyerDetails) => Promise<void>;
}

/**
 * The step moves through these phases:
 *   email → (sending) → code → (verifying) → details
 */
type Phase = 'email' | 'sending' | 'code' | 'verifying' | 'details';

const EMPTY_CUSTOMER: Customer = { fullName: '', phone: '', address: '', occupation: '' };
const RESEND_WAIT_SECONDS = 30;
const INCOMPLETE_MESSAGE = 'Please fill in every field and choose your source of funds.';

/** Turns missing or null fields from the backend into empty strings. */
const withBlanks = (c: Partial<Record<keyof Customer, string | null>>): Customer => ({
  fullName: c.fullName ?? '',
  phone: c.phone ?? '',
  address: c.address ?? '',
  occupation: c.occupation ?? '',
});

/** The fields a returning buyer already has on file (blank ones stay editable). */
const filledFields = (c: Customer) =>
  (Object.keys(c) as (keyof Customer)[]).filter((key) => c[key].trim() !== '');

/** Removes stray spaces before the details are sent. */
const trimAll = (c: Customer): Customer => ({
  fullName: c.fullName.trim(),
  phone: c.phone.trim(),
  address: c.address.trim(),
  occupation: c.occupation.trim(),
});

const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email.trim());

const isComplete = (c: Customer, sourceOfFunds: SourceOfFunds | null) =>
  c.fullName.trim().length > 1 &&
  c.phone.replace(/\D/g, '').length >= 7 &&
  c.address.trim().length > 3 &&
  c.occupation.trim().length > 1 &&
  sourceOfFunds !== null;

/** Step 3. Verify the buyer's email, then collect (or confirm) their details. */
export function DetailsStep({ unit, saved, onBack, onSubmit }: DetailsStepProps) {
  const [phase, setPhase] = useState<Phase>(saved ? 'details' : 'email');
  const [email, setEmail] = useState(saved?.email ?? '');
  const [code, setCode] = useState('');
  const [token, setToken] = useState(saved?.verificationToken ?? '');
  const [isReturning, setIsReturning] = useState(saved?.isReturning ?? false);
  const [customer, setCustomer] = useState<Customer>(saved?.customer ?? EMPTY_CUSTOMER);
  const [lockedFields, setLockedFields] = useState<(keyof Customer)[]>(saved?.lockedFields ?? []);
  const [sourceOfFunds, setSourceOfFunds] = useState<SourceOfFunds | null>(saved?.sourceOfFunds ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const formComplete = isComplete(customer, sourceOfFunds);
  // The "fill in every field" message disappears as soon as the form is complete.
  const visibleError = formComplete && error === INCOMPLETE_MESSAGE ? null : error;

  const resend = useCountdown();
  const { ref: formRef, shake } = useShake<HTMLFormElement>();

  // ── Actions ────────────────────────────────────────────────

  const sendCode = async () => {
    setError(null);
    setPhase('sending');
    try {
      await api.sendOtp(email.trim());
      setCode('');
      setPhase('code');
      resend.start(RESEND_WAIT_SECONDS);
    } catch (e) {
      setError(toMessage(e));
      setPhase('email');
    }
  };

  /** "Resend code": stays on the code boxes, whether it works or not. */
  const resendCode = async () => {
    setError(null);
    setResending(true);
    try {
      await api.sendOtp(email.trim());
      setCode('');
      resend.start(RESEND_WAIT_SECONDS);
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setResending(false);
    }
  };

  const verifyCode = async (fullCode: string) => {
    setError(null);
    setPhase('verifying');
    try {
      const result = await api.verifyOtp(email.trim(), fullCode);
      setToken(result.verificationToken);
      const onFile = result.customer ? withBlanks(result.customer) : null;
      setIsReturning(onFile !== null);
      setCustomer(onFile ?? EMPTY_CUSTOMER);
      setLockedFields(onFile ? filledFields(onFile) : []);
      setPhase('details');
    } catch (e) {
      setError(toMessage(e));
      setCode('');
      setPhase('code');
    }
  };

  const changeEmail = () => {
    setPhase('email');
    setCode('');
    setToken('');
    setIsReturning(false);
    setCustomer(EMPTY_CUSTOMER);
    setLockedFields([]);
    setError(null);
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        email: email.trim(),
        verificationToken: token,
        customer: trimAll(customer),
        sourceOfFunds: sourceOfFunds!,
        isReturning,
        lockedFields,
      });
    } catch (e) {
      setError(toMessage(e));
      setSubmitting(false);
    }
  };

  const typeCode = (next: string) => {
    setCode(next);
    if (error) setError(null);
  };

  /** Continue tapped too early: shake, and on the details form say what's missing. */
  const showBlocked = () => {
    if (phase === 'details') setError(INCOMPLETE_MESSAGE);
    shake();
  };

  // ── What the action bar does in each phase ─────────────────

  const action = {
    email: { label: 'Send code', onNext: sendCode, blocked: !isValidEmail(email), busy: false },
    sending: { label: 'Send code', onNext: sendCode, blocked: false, busy: true },
    code: { label: 'Verify', onNext: () => verifyCode(code), blocked: code.length < OTP_LENGTH, busy: false },
    verifying: { label: 'Verify', onNext: () => {}, blocked: false, busy: true },
    details: {
      label: 'Continue',
      onNext: submit,
      blocked: !formComplete,
      busy: submitting,
    },
  }[phase];

  // ── Layout ─────────────────────────────────────────────────

  return (
    <>
      <UnitTicket unit={unit} />
      <h2>Your details</h2>

      {phase === 'details' && (
        <p className="verified-note reveal">
          <span className="check-dot">✓</span>
          {isReturning
            ? 'Email confirmed. We filled this in from your last purchase.'
            : 'Email confirmed. Tell us a little about yourself.'}
        </p>
      )}

      <form ref={formRef} className="form" onSubmit={(e) => e.preventDefault()} noValidate>
        <EmailField
          phase={phase}
          email={email}
          onChange={setEmail}
          onEnter={() => phase === 'email' && isValidEmail(email) && sendCode()}
          onChangeEmail={changeEmail}
        />

        {(phase === 'email' || phase === 'sending') && (
          <p className="hint">We will send a code to confirm it is you, then fill in your details for you.</p>
        )}

        {(phase === 'code' || phase === 'verifying') && (
          <div className="otp reveal">
            <span className="field-label">Enter the 6 digit code we sent you</span>
            <OtpInput
              value={code}
              onChange={typeCode}
              onComplete={verifyCode}
              disabled={phase === 'verifying'}
            />
            <button
              type="button"
              className="text-link"
              disabled={resending || resend.secondsLeft > 0}
              onClick={resendCode}
            >
              {resendLabel(resending, resend.secondsLeft)}
            </button>
          </div>
        )}

        {phase === 'details' && (
          <div className="form reveal">
            <CustomerFields customer={customer} lockedFields={lockedFields} onChange={setCustomer} />
            <SourceOfFundsPicker value={sourceOfFunds} onChange={setSourceOfFunds} />
          </div>
        )}

        {visibleError && (
          <p className="error-text" role="alert">
            {visibleError}
          </p>
        )}
      </form>

      <ActionBar
        onBack={onBack}
        onNext={action.onNext}
        blocked={action.blocked}
        onBlocked={showBlocked}
        busy={action.busy}
      >
        {action.label}
      </ActionBar>
    </>
  );
}

// ── Pieces of the form ───────────────────────────────────────

function resendLabel(resending: boolean, secondsLeft: number) {
  if (resending) return 'Sending…';
  if (secondsLeft > 0) return `Resend code in ${secondsLeft}s`;
  return 'Resend code';
}

interface EmailFieldProps {
  phase: Phase;
  email: string;
  onChange: (email: string) => void;
  onEnter: () => void;
  onChangeEmail: () => void;
}

/** Email input with a status on the right: spinner, "Change" or a tick. */
function EmailField({ phase, email, onChange, onEnter, onChangeEmail }: EmailFieldProps) {
  const isWaiting = phase === 'sending' || phase === 'verifying';

  return (
    <label className="field">
      Email address
      <span className="email-field">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          readOnly={phase !== 'email'}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        />
        <span className="email-field__status">
          {isWaiting && <Spinner label="Please wait" />}
          {phase === 'code' && (
            <button type="button" className="text-link" onClick={onChangeEmail}>
              Change
            </button>
          )}
          {phase === 'details' && (
            <span className="check-dot" aria-label="Confirmed">
              ✓
            </span>
          )}
        </span>
      </span>
    </label>
  );
}

interface CustomerFieldsProps {
  customer: Customer;
  /** Saved details from a previous purchase are shown read-only. */
  lockedFields: (keyof Customer)[];
  onChange: (customer: Customer) => void;
}

function CustomerFields({ customer, lockedFields, onChange }: CustomerFieldsProps) {
  const field = (key: keyof Customer, label: string, props: InputHTMLAttributes<HTMLInputElement>) => (
    <label className="field">
      {label}
      <input
        value={customer[key]}
        readOnly={lockedFields.includes(key)}
        onChange={(e) => onChange({ ...customer, [key]: e.target.value })}
        {...props}
      />
    </label>
  );

  return (
    <>
      {field('fullName', 'Full name', { autoComplete: 'name' })}
      {field('phone', 'Phone number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel' })}
      {field('address', 'Home address', { autoComplete: 'street-address' })}
      {field('occupation', 'Occupation', { autoComplete: 'organization-title' })}
    </>
  );
}

interface SourceOfFundsPickerProps {
  value: SourceOfFunds | null;
  onChange: (value: SourceOfFunds) => void;
}

function SourceOfFundsPicker({ value, onChange }: SourceOfFundsPickerProps) {
  return (
    <div className="chip-group">
      <span className="field-label" id="source-of-funds">
        Source of funds
      </span>
      <div className="chips" role="group" aria-labelledby="source-of-funds">
        {SOURCES_OF_FUNDS.map((option) => (
          <button
            key={option}
            type="button"
            className="chip"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
