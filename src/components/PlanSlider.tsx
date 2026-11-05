import type { CSSProperties } from 'react';
import { describePlan } from '../lib/plan';

interface PlanSliderProps {
  monthOptions: number[]; // e.g. [0, 12, 24 … 96]
  months: number;
  onChange: (months: number) => void;
}

/** Drag to pick the plan length. Labels read NOW, 1, 2 … 8 YRS. */
export function PlanSlider({ monthOptions, months, onChange }: PlanSliderProps) {
  const lastIndex = monthOptions.length - 1;
  const index = Math.max(0, monthOptions.indexOf(months));

  // Lines a position up with the centre of the 28px slider handle.
  const position = (i: number) => `calc(14px + ${i} / ${Math.max(lastIndex, 1)} * (100% - 28px))`;

  // Whole years read 1, 2 … 8 YRS; anything else falls back to months (e.g. 18M).
  const tickLabel = (m: number, i: number) => {
    if (m === 0) return 'NOW';
    if (m % 12 !== 0) return `${m}M`;
    const years = m / 12;
    return i === lastIndex ? `${years} YRS` : String(years);
  };

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
        max={lastIndex}
        step={1}
        value={index}
        style={{ '--filled': position(index) } as CSSProperties}
        aria-label="Payment duration"
        aria-valuetext={describePlan(months)}
        onChange={(e) => onChange(monthOptions[Number(e.target.value)])}
      />
      <div className="plan-slider__ticks" aria-hidden="true">
        {monthOptions.map((m, i) => (
          <span key={m} style={tickStyle(i)}>
            {tickLabel(m, i)}
          </span>
        ))}
      </div>
    </div>
  );
}
