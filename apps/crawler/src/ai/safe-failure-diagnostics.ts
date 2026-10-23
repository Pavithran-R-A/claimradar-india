/**
 * Capture only a verified HTTP status from our own OpenRouter error formatter.
 * Never persist upstream response bodies, request payloads, credentials or
 * exception messages in a failure diagnostic.
 */
export function safeProviderErrorMetadata(
  provider: string,
  error: string | null,
): { safe_http_status: number } | null {
  if (provider !== 'openrouter' || !error) return null;
  // Require the complete, fixed error format emitted by safeFailure().
  const matched = /^OpenRouter HTTP (4[0-9]{2}|5[0-9]{2})(?: \([a-z][a-z0-9_]{0,63}\))?$/.exec(error);
  if (!matched) return null;
  const status = Number(matched[1]);
  return Number.isInteger(status) && status >= 400 && status <= 599
    ? { safe_http_status: status }
    : null;
}
