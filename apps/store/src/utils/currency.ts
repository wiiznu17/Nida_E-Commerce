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
