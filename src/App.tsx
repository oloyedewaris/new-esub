import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type Subscription, type Unit } from './api';
import { useListing } from './hooks/useListing';
import { accentVars, unitColor } from './lib/colors';
import { Hero } from './components/Hero';
import { ListingHeader } from './components/ListingHeader';
import { Stepper } from './components/Stepper';
import { Spinner } from './components/Spinner';
import { UnitStep } from './steps/UnitStep';
import { PlanStep } from './steps/PlanStep';
import { DetailsStep, type BuyerDetails } from './steps/DetailsStep';
import { PaymentStep } from './steps/PaymentStep';

/**
 * The share link says which listing to show and which agent shared it:
 *   https://your-domain/?listing=montego-skyline&agent=gbemileke
 */
const params = new URLSearchParams(window.location.search);
const LISTING_ID = params.get('listing');
const AGENT_ID = params.get('agent');

/** Small pause after tapping a unit so the buyer sees it highlight. */
const PICK_DELAY_MS = 220;

type Step = 1 | 2 | 3 | 4;

export default function App() {
  const { listing, error, retry } = useListing(LISTING_ID, AGENT_ID);

  const [step, setStep] = useState<Step>(1);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [months, setMonths] = useState(0);
  const [buyer, setBuyer] = useState<BuyerDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paid, setPaid] = useState(false);
  const pickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => () => clearTimeout(pickTimer.current), []);

  const markPaid = useCallback(() => setPaid(true), []);

  if (error) {
    return (
      <div className="page page--centered">
        <p className="hint">{error}</p>
        {LISTING_ID && (
          <button type="button" className="btn-primary btn-primary--inline" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page page--centered">
        <Spinner size="large" label="Loading" />
      </div>
    );
  }

  // ── Step handlers ──────────────────────────────────────────

  const selectUnit = (picked: Unit) => {
    if (picked.id !== unit?.id) setMonths(0);
    setUnit(picked);
    clearTimeout(pickTimer.current); // a double tap shouldn't queue two moves
    pickTimer.current = setTimeout(() => setStep(2), PICK_DELAY_MS);
  };

  /** Called by the details step; creates the subscription on the backend. */
  const createSubscription = async (details: BuyerDetails) => {
    const created = await api.createSubscription({
      listingId: listing.id,
      unitId: unit!.id,
      planMonths: months,
      agentId: listing.agent?.id ?? AGENT_ID,
      email: details.email,
      verificationToken: details.verificationToken,
      customer: details.customer,
      sourceOfFunds: details.sourceOfFunds,
    });
    setBuyer(details);
    setSubscription(created);
    setStep(4);
  };

  // ── Layout ─────────────────────────────────────────────────

  const hasActionBar = step > 1 && !paid;
  const firstUnit = unit ?? listing.units[0];
  const pageStyle = firstUnit ? accentVars(unitColor(listing, firstUnit)) : undefined;

  return (
    <div className="page" style={pageStyle}>
      <Hero
        imageUrl={listing.heroImageUrl}
        location={listing.location}
        alt={`${listing.name} by ${listing.developer}`}
      />

      <div className="sheet">
        <div className="gutter">
          <ListingHeader listing={listing} />
          <Stepper current={step} allDone={paid} />
        </div>

        <main className={'gutter step-body' + (hasActionBar ? '' : ' step-body--padded')}>
          {step === 1 && <UnitStep listing={listing} selectedUnit={unit} onSelect={selectUnit} />}

          {step === 2 && unit && (
            <PlanStep
              unit={unit}
              rules={listing.plan}
              months={months}
              onChangeMonths={setMonths}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && unit && (
            <DetailsStep unit={unit} saved={buyer} onBack={() => setStep(2)} onSubmit={createSubscription} />
          )}

          {step === 4 && unit && buyer && subscription && (
            <PaymentStep
              unit={unit}
              isInstalment={months > 0}
              email={buyer.email}
              subscription={subscription}
              onConfirmed={markPaid}
              onBack={() => setStep(3)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
