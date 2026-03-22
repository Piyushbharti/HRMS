/**
 * Centralized error parser for Axios responses.
 * Returns a human-friendly string for any API error.
 */
export function parseApiError(err) {
  // Network / connection error
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  const { status, data } = err.response;

  // Try to extract a message from the response body
  const extractMsg = (d) => {
    if (!d) return null;
    if (typeof d === 'string') return d;
    if (d.detail) return String(d.detail);
    if (d.message) return String(d.message);
    if (d.non_field_errors) {
      const v = d.non_field_errors;
      return Array.isArray(v) ? v[0] : String(v);
    }
    // Field-level errors — pick the first one
    const entries = Object.entries(d);
    if (entries.length > 0) {
      const [field, msg] = entries[0];
      const m = Array.isArray(msg) ? msg[0] : String(msg);
      return `${capitalize(field)}: ${m}`;
    }
    return null;
  };

  const bodyMsg = extractMsg(data);

  switch (status) {
    case 400:
      return bodyMsg || 'Invalid data submitted. Please check your inputs.';
    case 401:
      return 'You are not authorized. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return bodyMsg || 'The requested resource was not found.';
    case 409:
      return bodyMsg || 'A conflict occurred — the record may already exist.';
    case 422:
      return bodyMsg || 'Unprocessable data. Please check your inputs.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'A server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is currently unavailable. Please try again later.';
    default:
      return bodyMsg || `Unexpected error (${status}). Please try again.`;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

export default parseApiError;
