/**
 * Input sanitization utilities.
 * All user input passes through these before being stored or broadcast.
 */

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
  let result = input.trim();
  result = stripHtml(result);
  result = escapeHtml(result);
  result = truncate(result, 500);
  return result;
}

/** Sanitize a nickname (shorter limit, same pipeline) */
export function sanitizeNickname(input: string): string {
  let result = input.trim();
  result = stripHtml(result);
  result = escapeHtml(result);
  result = truncate(result, 20);
  return result;
}
