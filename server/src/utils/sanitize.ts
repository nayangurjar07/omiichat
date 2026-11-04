/**
 * Input sanitization utilities.
 * Strips all HTML tags, script payloads, and ASCII control characters.
 * All user input passes through these before being stored or broadcast.
 */

export function sanitizeInput(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/** Strip HTML tags from a string */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Escape HTML special characters to prevent XSS */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char] || char);
}

/** Truncate a string to a maximum length */
export function truncate(input: string, maxLength: number): string {
  return input.length > maxLength ? input.slice(0, maxLength) : input;
}

/** Full sanitization pipeline for user messages */
export function sanitizeMessage(input: string): string {
  return sanitizeInput(input, 500);
}

/** Sanitize a nickname (shorter limit, same pipeline) */
export function sanitizeNickname(input: string): string {
  return sanitizeInput(input, 20);
}
