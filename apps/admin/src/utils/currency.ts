/**
 * Formats a numeric amount to Thai Baht currency display.
 * Example:
 *   formatPrice(1290) -> "฿1,290"
 *   formatPrice(1290.5, { showDecimals: true }) -> "฿1,290.50"
 */
export function formatPrice(
  amount: number | null | undefined,
  options?: { showDecimals?: boolean },
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '฿0';
  }

  const numeric = Number(amount);
  const showDecimals = options?.showDecimals ?? numeric % 1 !== 0;

  if (showDecimals) {
    return `฿${numeric.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `฿${numeric.toLocaleString('en-US')}`;
}

export const formatCurrency = formatPrice;

/**
 * Formats a numeric amount to compact currency display for chart axes.
 * Example:
 *   formatCompactPrice(0) -> "฿0"
 *   formatCompactPrice(1500) -> "฿1.5k"
 *   formatCompactPrice(50000) -> "฿50k"
 *   formatCompactPrice(1200000) -> "฿1.2M"
 */
export function formatCompactPrice(
  amount: number | null | undefined,
): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return '฿0';
  }

  const numeric = Math.abs(Number(amount));
  const sign = amount < 0 ? '-' : '';

  if (numeric >= 1_000_000) {
    const formatted = (numeric / 1_000_000).toFixed(
      numeric % 1_000_000 === 0 ? 0 : 1,
    );
    return `${sign}฿${formatted}M`;
  }

  if (numeric >= 1_000) {
    const formatted = (numeric / 1_000).toFixed(
      numeric % 1_000 === 0 ? 0 : 1,
    );
    return `${sign}฿${formatted}k`;
  }

  return `${sign}฿${numeric.toLocaleString('en-US')}`;
}
