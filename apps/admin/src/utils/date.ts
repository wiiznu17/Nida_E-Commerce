/**
 * Date Formatting Utilities
 *
 * Centralized formatting for dates and timestamps across the admin portal.
 */

/**
 * Format order date and time according to locale.
 * Example:
 *   th: '14 ต.ค. 2026, 15:30'
 *   en: 'Oct 14, 2026, 15:30'
 */
export function formatOrderDateTime(dateStr: string, language: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
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
    return dateStr;
  }
}

/**
 * Format remaining SLA time for order cancellation requests (48-hour window).
 */
export function formatSlaRemaining(
  createdAt: string,
  language: string,
): string {
  if (!createdAt) return '-';
  const diff = new Date(createdAt).getTime() + 48 * 60 * 60 * 1000 - Date.now();
  const isTh = language === 'th';
  if (diff <= 0) return isTh ? 'ครบกำหนดแล้ว' : 'Due now';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return isTh ? `${hours} ชม. ${minutes} นาที` : `${hours}h ${minutes}m`;
}

/**
 * Format return shipment deadline (7 days from approval).
 */
export function formatReturnDeadlineRemaining(
  approvedAt: string,
  language: string,
): string {
  if (!approvedAt) return '-';
  const diff =
    new Date(approvedAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now();
  const isTh = language === 'th';
  if (diff <= 0) return isTh ? 'เลยกำหนดส่งคืน' : 'Overdue';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return isTh ? `${days} วัน ${hours} ชม.` : `${days}d ${hours}h`;
}
