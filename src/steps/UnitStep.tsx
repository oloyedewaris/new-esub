import type { Listing, Unit } from '../api';
import { unitColor } from '../lib/colors';
import { UnitCard } from '../components/UnitCard';

interface UnitStepProps {
  listing: Listing;
  selectedUnit: Unit | null;
  onSelect: (unit: Unit) => void;
}

/** Step 1. Tapping a unit moves straight on to the plan, so there is no action bar. */
export function UnitStep({ listing, selectedUnit, onSelect }: UnitStepProps) {
  if (listing.units.length === 0) {
    return (
      <>
        <h2>Pick your unit</h2>
        <p className="hint">There are no units on sale here right now. Please check back soon.</p>
      </>
    );
  }

  return (
    <>
      <h2>Pick your unit</h2>
      <div className="unit-list">
        {listing.units.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            color={unitColor(listing, unit)}
            selected={selectedUnit?.id === unit.id}
            onSelect={() => onSelect(unit)}
          />
        ))}
      </div>
    </>
  );
}
