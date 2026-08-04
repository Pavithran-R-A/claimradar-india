/**
 * Structured JSON logger for crawl pipeline observability.
 *
 * IMPORTANT: Never log API keys, service-role keys, auth headers,
 * or personal information.
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  runId: string;
  stage: string;
  message: string;
  sourceId?: string;
  documentId?: string;
  candidateId?: string;
  durationMs?: number;
  status?: string;
  errorCode?: string;
  [key: string]: unknown;
}

/** Keys that must never appear in log output. */
const REDACTED_KEYS = new Set([
  'api_key',
  'apiKey',
  'API_KEY',
  'service_role_key',
  'serviceRoleKey',
  'SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENROUTER_API_KEY',
  'NVIDIA_API_KEY',
  'authorization',
  'Authorization',
  'cookie',
  'Cookie',
  'password',
  'secret',
  'token',
]);

function sanitize(meta: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (REDACTED_KEYS.has(key)) {
      clean[key] = '[REDACTED]';
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function emit(
  level: LogEntry['level'],
  runId: string,
  stage: string,
  message: string,
  meta?: Record<string, unknown>,
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    runId,
    stage,
    message,
    ...(meta ? sanitize(meta) : {}),
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'warn':
      console.warn(line);
      break;
    case 'debug':
      console.debug(line);
      break;
    default:
      console.log(line);
      break;
  }
}

export function createLogger(runId: string) {
  return {
    info(stage: string, message: string, meta?: Record<string, unknown>): void {
      emit('info', runId, stage, message, meta);
    },
    warn(stage: string, message: string, meta?: Record<string, unknown>): void {
      emit('warn', runId, stage, message, meta);
    },
    error(stage: string, message: string, meta?: Record<string, unknown>): void {
      emit('error', runId, stage, message, meta);
    },
    debug(stage: string, message: string, meta?: Record<string, unknown>): void {
      emit('debug', runId, stage, message, meta);
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
