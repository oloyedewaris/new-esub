const STEPS = ['UNIT', 'PLAN', 'DETAILS', 'PAY'];

interface StepperProps {
  current: number; // 1–4
  allDone: boolean;
}

/** "1 UNIT ✓  2 PLAN  3 DETAILS  4 PAY" with a progress bar under it. */
export function Stepper({ current, allDone }: StepperProps) {
  return (
    <>
      <ol className="stepper" aria-label="Progress">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const isDone = step < current;
          const isCurrent = step === current;
          return (
            <li
              key={label}
              className={isCurrent ? 'is-current' : isDone ? 'is-done' : ''}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {step} {label}
              {isDone && ' ✓'}
            </li>
          );
        })}
      </ol>
      <div className="stepper-bar" aria-hidden="true">
        {STEPS.map((label, i) => (
          <i key={label} className={allDone || i < current ? 'is-filled' : ''} />
        ))}
      </div>
    </>
  );
}
