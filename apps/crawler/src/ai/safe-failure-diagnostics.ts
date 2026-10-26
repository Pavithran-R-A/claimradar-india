/**
 * Capture only a verified HTTP status from our own provider error formatters.
 * Never persist upstream response bodies, request payloads, credentials or
 * exception messages in a failure diagnostic.
 */
export function safeProviderErrorMetadata(
  provider: string,
  error: string | null,
): { safe_http_status: number } | null {
  if (!error) return null;
  // Trust only our own exact, bounded formatter output. The provider-specific
  // prefixes prevent accepting arbitrary strings or upstream response bodies.
  const matched =
    provider === 'openrouter'
      ? /^OpenRouter HTTP (4[0-9]{2}|5[0-9]{2})(?: \([a-z][a-z0-9_]{0,63}\))?$/.exec(error)
      : provider === 'groq'
        ? /^Groq HTTP (4[0-9]{2}|5[0-9]{2})$/.exec(error)
        : null;
  if (!matched) return null;
  const status = Number(matched[1]);
  return Number.isInteger(status) && status >= 400 && status <= 599
    ? { safe_http_status: status }
    : null;
}
