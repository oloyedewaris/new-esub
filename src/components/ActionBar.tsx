import type { ReactNode } from 'react';
import { Spinner } from './Spinner';

interface ActionBarProps {
  /** Main button text. */
  children: ReactNode;
  onNext: () => void;
  /** Leave out to hide the Back button. */
  onBack?: () => void;
  /**
   * When true, tapping the main button calls `onBlocked` instead of
   * `onNext` (used to shake the form). The button still looks active.
   */
  blocked?: boolean;
  onBlocked?: () => void;
  /** Shows a spinner and ignores taps. */
  busy?: boolean;
}

/** The sticky Back / Continue bar at the bottom of steps 2–4. */
export function ActionBar({ children, onNext, onBack, blocked, onBlocked, busy }: ActionBarProps) {
  const handleNext = () => {
    if (busy) return;
    if (blocked) onBlocked?.();
    else onNext();
  };

  return (
    <>
      <div className="action-bar-spacer" aria-hidden="true" />
      <div className="action-bar">
        {onBack && (
          <button type="button" className="btn-secondary" onClick={onBack} disabled={busy}>
            Back
          </button>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={handleNext}
          aria-busy={busy}
          aria-disabled={blocked || busy}
        >
          {busy ? <Spinner size="small" light label="Please wait" /> : children}
        </button>
      </div>
    </>
  );
}
