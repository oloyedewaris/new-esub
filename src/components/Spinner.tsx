interface SpinnerProps {
  size?: 'small' | 'large';
  light?: boolean; // white, for use on the green button
  /** Read out by screen readers. Leave out when nearby text already says what's happening. */
  label?: string;
}

export function Spinner({ size = 'small', light, label }: SpinnerProps) {
  const classes = ['spinner', `spinner--${size}`, light && 'spinner--light'].filter(Boolean).join(' ');
  if (!label) return <span className={classes} aria-hidden="true" />;
  return <span className={classes} role="status" aria-label={label} />;
}
