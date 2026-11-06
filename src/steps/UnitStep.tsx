import type { Unit } from '../api';
import { unitColor } from '../lib/colors';
import { UnitCard } from '../components/UnitCard';
import { useQuery } from '@tanstack/react-query';
import { fetchProjectBundles } from '../apis/investment';
import { Spinner } from '../components/Spinner';

interface UnitStepProps {
  project: any;
  selectedUnit: Unit | null;
  onSelect: (unit: Unit) => void;
}

/** Step 1. Tapping a unit moves straight on to the plan, so there is no action bar. */
export function UnitStep({ project, selectedUnit, onSelect }: UnitStepProps) {
  const fetchProjectBundlesQuery = useQuery({
    queryFn: () => fetchProjectBundles(project?.id),
    queryKey: ['fetchProjectBundles', project?.id],
  });
  const units = fetchProjectBundlesQuery?.data?.data?.results;

  if (fetchProjectBundlesQuery?.isLoading) {
    return (
      <div
        className="page page--centered"
        style={{ maxHeight: '50dvh !important', minHeight: '50dvh !important' }}
      >
        <Spinner size="large" label="Loading" />
      </div>
    );
  }

  if (!fetchProjectBundlesQuery?.isLoading && !units?.length) {
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
        {units.map((unit: any) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            color={unitColor()}
            selected={selectedUnit?.id === unit.id}
            onSelect={() => onSelect(unit)}
          />
        ))}
      </div>
    </>
  );
}
