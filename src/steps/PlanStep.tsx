import type { PlanRules, Unit } from '../api';
import { calculatePlan } from '../lib/plan';
import { UnitTicket } from '../components/UnitTicket';
import { PlanSlider } from '../components/PlanSlider';
import { PlanSummary } from '../components/PlanSummary';
import { ActionBar } from '../components/ActionBar';

interface PlanStepProps {
  unit: Unit;
  rules: PlanRules;
  months: number;
  onChangeMonths: (months: number) => void;
  onBack: () => void;
  onNext: () => void;
}

/** Step 2. Choose how long to spread the payment. */
export function PlanStep({ unit, rules, months, onChangeMonths, onBack, onNext }: PlanStepProps) {
  const plan = calculatePlan(unit, rules, months);

  return (
    <>
      <UnitTicket unit={unit} />

      <span className="eyebrow">PAYMENT PLAN</span>
      <h2 className="heading-tight">How would you like to pay?</h2>
      <p className="hint plan-hint">Drag to choose how long you spread it.</p>

      <PlanSlider monthOptions={rules.monthOptions} months={months} onChange={onChangeMonths} />
      <PlanSummary plan={plan} depositRate={rules.depositRate} />

      <ActionBar onBack={onBack} onNext={onNext}>
        Continue
      </ActionBar>
    </>
  );
}
