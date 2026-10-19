/**
 * Date Formatting Utilities
 *
 * Centralized formatting for dates and timestamps across the storefront.
 */

/**
 * Format order date and time according to locale.
 * Example:
 *   th: '14 ต.ค. 2026, 15:30'
 *   en: 'Oct 14, 2026, 15:30'
 */
export function formatOrderDateTime(
  dateStr?: string | Date | null,
  language: string = 'th',
): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return typeof dateStr === 'string' ? dateStr : '-';
    const dateFormatted = d.toLocaleDateString(
      language === 'th' ? 'th-TH' : 'en-US',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    );
    const timeFormatted = d.toLocaleTimeString(
      language === 'th' ? 'th-TH' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
    );
    return `${dateFormatted}, ${timeFormatted}`;
  } catch {
    return typeof dateStr === 'string' ? dateStr : '-';
  }
}
