import type { CSSProperties } from 'react';
// import type { Unit } from '../api';
import { softTint } from '../lib/colors';
import { formatNaira } from '../lib/format';

interface UnitCardProps {
  unit: any;
  color: string;
  selected: boolean;
  onSelect: () => void;
}

/** A tappable unit on step 1. Sold-out units are greyed out and can't be tapped. */
export function UnitCard({ unit, color, selected, onSelect }: UnitCardProps) {
  const soldOut = unit?.quantity === 0;

  return (
    <button
      type="button"
      className="unit-card"
      style={{ '--card-color': softTint(color) } as CSSProperties}
      aria-pressed={selected}
      disabled={soldOut}
      aria-label={soldOut ? `${unit?.unit_title}, sold out` : undefined}
      onClick={onSelect}
    >
      <span className="unit-card__info">
        <span className="caption">{unit?.project?.building_type}</span>
        <span className="unit-card__name">{unit?.unit_title}</span>
        <span className="unit-card__price">{formatNaira(unit?.price)}</span>
      </span>
      <span className="unit-card__stock">
        <StockBadge unitsLeft={unit?.quantity} />
      </span>
    </button>
  );
}

function StockBadge({ unitsLeft }: { unitsLeft: number | null }) {
  if (unitsLeft === 0) return <span className="stamp-sold-out">SOLD OUT</span>;
  if (unitsLeft == null) return <span className="badge-available">AVAILABLE</span>;
  return (
    <>
      <b className="units-left__count">{unitsLeft}</b>
      <span className="units-left__text">left</span>
    </>
  );
}
