/** ₦106,560,000 */
export function formatNaira(amount: number): string {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

/** ₦106.6M */
export function formatNairaMillions(amount: number): string {
  return '₦' + (amount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
}

/** 9447024234 → 9447 024 234 */
export function formatAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
}

/** NOV 2030 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
}
