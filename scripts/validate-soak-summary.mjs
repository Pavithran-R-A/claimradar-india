import fs from 'node:fs';

const summaryFile =
  process.argv[2] ||
  process.env.CRAWLER_SUMMARY_FILE ||
  process.env.SUMMARY_FILE ||
  'soak-crawl-summary.json';

if (!fs.existsSync(summaryFile) || fs.statSync(summaryFile).size === 0) {
  console.error(`SOAK_ACCEPTANCE_FAILED: summary file is missing or empty: ${summaryFile}`);
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
const errors = [];

if (!(summary.sourcesAttempted > 0)) {
  errors.push(`sourcesAttempted must be > 0 (was ${summary.sourcesAttempted})`);
}
if (summary.sourcesSucceeded !== summary.sourcesAttempted) {
  errors.push(
    `sourcesSucceeded (${summary.sourcesSucceeded}) must equal sourcesAttempted (${summary.sourcesAttempted})`,
  );
}
if (summary.sourcesFailed !== 0)
  errors.push(`sourcesFailed must be 0 (was ${summary.sourcesFailed})`);
if (!(summary.documentsDiscovered > 0)) {
  errors.push(`documentsDiscovered must be > 0 (was ${summary.documentsDiscovered})`);
}
if (!(summary.documentsFetched > 0)) {
  errors.push(`documentsFetched must be > 0 (was ${summary.documentsFetched})`);
}
// errorCount is an audit total, including known expected source limitations.
// Do not fail an otherwise successful crawl just for a safely skipped oversized
// PDF or an explicitly classified access restriction. Still fail closed when
// unexpected errors exist or the counts cannot be reconciled.
for (const field of ['errorCount', 'expectedLimitationCount', 'unexpectedErrorCount']) {
  if (!Number.isSafeInteger(summary[field]) || summary[field] < 0) {
    errors.push(`${field} must be a non-negative integer (was ${summary[field]})`);
  }
}
if (
  ['errorCount', 'expectedLimitationCount', 'unexpectedErrorCount'].every(
    (field) => Number.isSafeInteger(summary[field]) && summary[field] >= 0,
  ) &&
  summary.errorCount !== summary.expectedLimitationCount + summary.unexpectedErrorCount
) {
  errors.push(
    `errorCount (${summary.errorCount}) must equal classified expected (${summary.expectedLimitationCount}) + unexpected (${summary.unexpectedErrorCount}) errors`,
  );
}
if (summary.unexpectedErrorCount !== 0) {
  errors.push(`unexpectedErrorCount must be 0 (was ${summary.unexpectedErrorCount})`);
}
if (summary.recordsPublished !== 0) {
  errors.push(`recordsPublished must be 0 in staging (was ${summary.recordsPublished})`);
}

const guards = summary.effectivePolicyGuards;
if (!guards) {
  errors.push('effectivePolicyGuards snapshot missing');
} else {
  if (guards.APP_ENV !== 'staging') {
    errors.push(`APP_ENV must be staging (was ${guards.APP_ENV})`);
  }
  if (guards.AUTO_VERIFY_CLAIMABLES !== false) {
    errors.push('AUTO_VERIFY_CLAIMABLES must be false');
  }
  if (guards.ENABLE_BILLING !== false) errors.push('ENABLE_BILLING must be false');
  if (guards.NOTIFY_CUSTOMERS_ENABLED !== false) {
    errors.push('NOTIFY_CUSTOMERS_ENABLED must be false');
  }
  if (guards.LIVE_ADAPTERS_ENABLED !== true) {
    errors.push('LIVE_ADAPTERS_ENABLED must be true');
  }
}

if (errors.length > 0) {
  console.error('SOAK_ACCEPTANCE_FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  JSON.stringify({
    event: 'SOAK_ACCEPTANCE_PASSED',
    runId: summary.runId,
    sources: `${summary.sourcesSucceeded}/${summary.sourcesAttempted}`,
    documentsDiscovered: summary.documentsDiscovered,
    documentsFetched: summary.documentsFetched,
    recordsPublished: summary.recordsPublished,
    errorCount: summary.errorCount,
    expectedLimitationCount: summary.expectedLimitationCount,
    unexpectedErrorCount: summary.unexpectedErrorCount,
  }),
);
