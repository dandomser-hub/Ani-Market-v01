export const CONVENIENCE_FEE_STORAGE_KEY = 'ani-market-convenience-fee-rate';
export const CONVENIENCE_FEE_UPDATED_EVENT = 'ani-market-convenience-fee-updated';

export const DEFAULT_CONVENIENCE_FEE_RATE = 3;

export function getConvenienceFeeRate(): number {
  if (typeof window === 'undefined') return DEFAULT_CONVENIENCE_FEE_RATE;

  const stored = window.localStorage.getItem(CONVENIENCE_FEE_STORAGE_KEY);
  const parsed = Number.parseFloat(stored ?? '');

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : DEFAULT_CONVENIENCE_FEE_RATE;
}

export function saveConvenienceFeeRate(rate: number): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(CONVENIENCE_FEE_STORAGE_KEY, String(rate));
  window.dispatchEvent(
    new CustomEvent(CONVENIENCE_FEE_UPDATED_EVENT, { detail: { rate } }),
  );
}

export function formatConvenienceFeeRate(rate: number): string {
  return `${Number.isInteger(rate) ? rate.toFixed(0) : rate.toFixed(1)}%`;
}
