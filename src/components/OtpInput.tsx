import { useEffect, useRef } from 'react';

export const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string; // the digits typed so far, e.g. "12"
  onChange: (value: string) => void;
  /** Called once all digits are in. */
  onComplete: (code: string) => void;
  disabled?: boolean;
}

/**
 * Six one-digit boxes. Typing moves to the next box, backspace moves
 * back, and pasting the whole code fills every box.
 */
export function OtpInput({ value, onChange, onComplete, disabled }: OtpInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first empty box whenever the code is cleared or the boxes re-enable.
  useEffect(() => {
    if (!disabled && value === '') boxes.current[0]?.focus();
  }, [disabled, value]);

  /** Saves the new code, then moves focus (or submits when it's complete). */
  const update = (next: string, focusIndex: number) => {
    const digits = next.slice(0, OTP_LENGTH);
    onChange(digits);
    if (digits.length === OTP_LENGTH) onComplete(digits);
    else boxes.current[Math.min(focusIndex, digits.length)]?.focus();
  };

  const handleInput = (index: number, typed: string) => {
    const clean = typed.replace(/\D/g, '');

    // Pasted or autofilled the whole code into one box.
    if (clean.length >= OTP_LENGTH) {
      update(clean, OTP_LENGTH);
      return;
    }

    // Typing into a filled box gives two characters: keep the one that's new.
    const old = value[index] ?? '';
    const digit = clean.length > 1 ? clean.replace(old, '').slice(-1) || old : clean;

    // Replace this box's digit and keep the ones after it.
    const before = value.slice(0, index);
    const after = value.slice(index + 1);
    update(before + digit + after, digit ? index + 1 : index);
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      update(value.slice(0, index - 1), index - 1);
    }
  };

  return (
    <div className="otp-boxes">
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          value={value[i] ?? ''}
          disabled={disabled}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e.key)}
        />
      ))}
    </div>
  );
}
