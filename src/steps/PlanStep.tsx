import type { PlanRules, Unit } from '../api';
import { calculatePlan } from '../lib/plan';
import { UnitTicket } from '../components/UnitTicket';
import { PlanSlider } from '../components/PlanSlider';
import { PlanSummary } from '../components/PlanSummary';
import { ActionBar } from '../components/ActionBar';
import { useQuery } from '@tanstack/react-query';
import { fetchBundlePaymentPlans } from '../apis/investment';

interface PlanStepProps {
  unit: any;
  rules: PlanRules;
  months: number;
  selectedPlan: any;
  setSelectedPlan: any;
  onBack: () => void;
  onNext: () => void;
}

/** Step 2. Choose how long to spread the payment. */
export function PlanStep({ unit, months, selectedPlan, setSelectedPlan, onBack, onNext }: PlanStepProps) {
  const fetchBundlePaymentPlansQuery = useQuery({
    queryFn: () => fetchBundlePaymentPlans(unit?.id),
    queryKey: ['fetchBundlePaymentPlans', unit?.id],
  });
  const paymentPlans = fetchBundlePaymentPlansQuery?.data?.data?.results?.filter((plan: any) => !!plan.id);

  console.log('selectedPlan', selectedPlan);
  const summary = calculatePlan(unit, selectedPlan);

  return (
    <>
      {unit && (
        <>
          <UnitTicket unit={unit} />

          {unit?.payment_plan_available && (
            <>
              <span className="eyebrow">PAYMENT PLAN</span>
              <h2 className="heading-tight">How would you like to pay?</h2>
              <p className="hint plan-hint">Drag to choose how long you spread it.</p>
              <PlanSlider
                paymentPlans={paymentPlans}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
              />
            </>
          )}
          <PlanSummary selectedPlan={selectedPlan} unit={unit} summary={summary} />

          <ActionBar onBack={onBack} onNext={onNext}>
            Continue
          </ActionBar>
        </>
      )}
    </>
  );
}
