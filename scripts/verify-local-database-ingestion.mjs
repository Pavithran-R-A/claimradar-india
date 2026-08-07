import { execSync } from 'node:child_process';
import { createAdminClient } from '../packages/database/dist/index.js';

function ensureLocalSupabaseEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const output = execSync('npx supabase status --output json', { encoding: 'utf8' });
      const status = JSON.parse(output);
      if (status && status.SERVICE_ROLE_KEY) {
        process.env.SUPABASE_SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY;
      }
    } catch (_err) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(
          'SUPABASE_SERVICE_ROLE_KEY environment variable is required to run local ingestion verification.',
        );
      }
    }
  }
}

ensureLocalSupabaseEnv();

const supabase = createAdminClient();

async function runLocalDatabaseIngestionTest() {
  console.log('=============================================================================');
  console.log('  CLAIMRADAR INDIA — LOCAL DATABASE INGESTION & IDEMPOTENCY VERIFICATION');
  console.log('=============================================================================');
  console.log(`Target Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  // Fetch initial source ID
  const { data: sources, error: sourceErr } = await supabase
    .from('sources')
    .select('id, name')
    .limit(1);
  if (sourceErr || !sources || sources.length === 0) {
    console.error('Failed to fetch initial source:', sourceErr);
    process.exit(1);
  }
  const sourceId = sources[0].id;
  console.log(`Using active source: ${sources[0].name} (${sourceId})`);

  const testBatch = [
    {
      source_id: sourceId,
      canonical_url: 'https://sebi.gov.in/notices/2026/local-test-doc-101.pdf',
      content_hash: 'sha256-local-fixture-hash-101-sebi-test',
      title: '[LOCAL_TEST] SEBI Investor Disgorgement Order 101',
      raw_text: 'SEBI hereby orders disgorgement of Rs 50,00,000 for market manipulation.',
    },
    {
      source_id: sourceId,
      canonical_url: 'https://rbi.org.in/press/2026/local-test-doc-202.pdf',
      content_hash: 'sha256-local-fixture-hash-202-rbi-test',
      title: '[LOCAL_TEST] RBI Consumer Penalty Notice 202',
      raw_text: 'RBI imposes monetary penalty on payment aggregator for non-compliance.',
    },
  ];

  // Helper function to process ingestion batch
  async function processIngestionRun(runLabel) {
    console.log(`\n--- Executing Ingestion ${runLabel} ---`);
    let newDocsCount = 0;
    let reusedDocsCount = 0;
    let newClustersCount = 0;
    let reusedClustersCount = 0;

    for (const doc of testBatch) {
      // 1. Source Document Deduplication & Insertion
      const { data: existingDoc } = await supabase
        .from('source_documents')
        .select('id, content_hash')
        .eq('source_id', doc.source_id)
        .eq('content_hash', doc.content_hash)
        .maybeSingle();

      let docId;
      if (existingDoc) {
        docId = existingDoc.id;
        reusedDocsCount++;
      } else {
        const { data: insertedDoc, error: insertErr } = await supabase
          .from('source_documents')
          .insert(doc)
          .select('id')
          .single();
        if (insertErr) {
          throw new Error(`Failed to insert source_document: ${insertErr.message}`);
        }
        docId = insertedDoc.id;
        newDocsCount++;
      }

      // 2. Content Cluster Deduplication & Linking
      const { data: existingCluster } = await supabase
        .from('content_clusters')
        .select('id')
        .eq('canonical_hash', doc.content_hash)
        .maybeSingle();

      let clusterId;
      if (existingCluster) {
        clusterId = existingCluster.id;
        reusedClustersCount++;
      } else {
        const { data: insertedCluster, error: clusterErr } = await supabase
          .from('content_clusters')
          .insert({
            canonical_hash: doc.content_hash,
            cluster_title: doc.title,
            canonical_url: doc.canonical_url,
          })
          .select('id')
          .single();
        if (clusterErr) {
          throw new Error(`Failed to insert content_cluster: ${clusterErr.message}`);
        }
        clusterId = insertedCluster.id;
        newClustersCount++;
      }

      // 3. Junction Linking
      await supabase
        .from('content_cluster_members')
        .upsert(
          { cluster_id: clusterId, source_document_id: docId },
          { onConflict: 'cluster_id,source_document_id' },
        );
    }

    return {
      newDocsCount,
      reusedDocsCount,
      newClustersCount,
      reusedClustersCount,
    };
  }

  // --- Run 1 ---
  const run1 = await processIngestionRun('Run 1 (Initial Ingestion)');
  console.log('Run 1 Metrics:', JSON.stringify(run1, null, 2));

  // --- Run 2 (Identical Batch) ---
  const run2 = await processIngestionRun('Run 2 (Duplicate Ingestion)');
  console.log('Run 2 Metrics:', JSON.stringify(run2, null, 2));

  // Assertions
  console.log('\n--- Idempotency Verification ---');
  const passNewDocsRun1 = run1.newDocsCount === 2;
  const passNewClustersRun1 = run1.newClustersCount === 2;
  const passNewDocsRun2 = run2.newDocsCount === 0;
  const passReusedDocsRun2 = run2.reusedDocsCount === 2;
  const passNewClustersRun2 = run2.newClustersCount === 0;
  const passReusedClustersRun2 = run2.reusedClustersCount === 2;

  console.log(`Run 1 Created 2 New Documents: ${passNewDocsRun1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Run 1 Created 2 New Clusters:   ${passNewClustersRun1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Run 2 Created 0 New Documents: ${passNewDocsRun2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Run 2 Reused 2 Existing Docs:  ${passReusedDocsRun2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Run 2 Created 0 New Clusters:  ${passNewClustersRun2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Run 2 Reused 2 Existing Clusters:${passReusedClustersRun2 ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed =
    passNewDocsRun1 &&
    passNewClustersRun1 &&
    passNewDocsRun2 &&
    passReusedDocsRun2 &&
    passNewClustersRun2 &&
    passReusedClustersRun2;

  // Cleanup test rows
  console.log('\nCleaning up test rows from PostgreSQL...');
  await supabase
    .from('source_documents')
    .delete()
    .in(
      'content_hash',
      testBatch.map((d) => d.content_hash),
    );
  await supabase
    .from('content_clusters')
    .delete()
    .in(
      'canonical_hash',
      testBatch.map((d) => d.content_hash),
    );

  if (!allPassed) {
    console.error('\n❌ LOCAL DATABASE IDEMPOTENCY TEST FAILED!');
    process.exit(1);
  }

  console.log('\n🎉 ALL LOCAL DATABASE INGESTION & IDEMPOTENCY VERIFICATIONS PASSED 100%!');
}

runLocalDatabaseIngestionTest().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
