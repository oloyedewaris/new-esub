import { useState, type CSSProperties } from 'react';
import { describePlan } from '../lib/plan';

interface PlanSliderProps {
  paymentPlans: any;
  selectedPlan: any;
  setSelectedPlan: any;
}

/** Drag to pick the plan length. Labels read NOW, 1, 2 … 8 YRS. */
export function PlanSlider({ paymentPlans, selectedPlan, setSelectedPlan }: PlanSliderProps) {
  const lastIndex = paymentPlans?.length;
  const [step, setStep] = useState(0);

  const position = (i: number) => `calc(14px + ${i} / ${Math.max(lastIndex, 1)} * (100% - 28px))`;

  const tickStyle = (i: number): CSSProperties => {
    if (i === 0) return { left: 0 };
    if (i === lastIndex) return { right: 0 };
    return { left: position(i), transform: 'translateX(-50%)' };
  };

  return (
    <div className="plan-slider">
      <input
        type="range"
        className="plan-slider__input"
        min={0}
        max={paymentPlans?.length}
        step={1}
        value={step}
        style={{ '--filled': position(step) } as CSSProperties}
        aria-label="Payment duration"
        onChange={(e) => {
          const val = Number(e.target.value);
          setStep(val);
          if (val !== 0) {
            const planFound = paymentPlans?.[val - 1];
            setSelectedPlan(planFound);
          } else {
            setSelectedPlan(null);
          }
        }}
      />
      <div className="plan-slider__ticks" aria-hidden="true">
        <span style={tickStyle(0)}>NOW</span>
        {paymentPlans?.map((plan: any, i: number) => (
          <span key={plan.id} style={tickStyle(i + 1)}>
            {plan?.payment_period_in_months}M
          </span>
        ))}
      </div>
    </div>
  );
}
