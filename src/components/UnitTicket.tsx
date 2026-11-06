import type { Unit } from '../api';
import { formatNairaMillions } from '../lib/format';

/** The tinted summary of the chosen unit at the top of steps 2–4. */
export function UnitTicket({ unit }: { unit: any }) {
  return (
    <div className="unit-ticket">
      <div className="unit-ticket__info">
        <span className="caption">{unit?.project?.building_type}</span>
        <b className="unit-ticket__name">{unit?.unit_title}</b>
        {unit?.exploreUrl && (
          <a className="unit-ticket__link" href={unit?.exploreUrl} target="_blank" rel="noopener noreferrer">
            Explore unit
          </a>
        )}
      </div>
      <i className="unit-ticket__divider" />
      <div className="unit-ticket__price">
        <span className="caption">PRICE</span>
        <b>{formatNairaMillions(unit?.price)}</b>
      </div>
    </div>
  );
}
