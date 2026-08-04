import { runPipeline, type PipelineOptions } from '../pipeline/index.js';

export async function runJobs(options?: Partial<PipelineOptions>): Promise<void> {
  const pipelineOptions: PipelineOptions = {
    dryRun: options?.dryRun ?? false,
    skipAI: options?.skipAI ?? false,
    ...(options?.sourceFilter !== undefined ? { sourceFilter: options.sourceFilter } : {}),
  };

  const summary = await runPipeline(pipelineOptions);

  if (summary.errorCount > 0) {
    console.error(`Crawl completed with ${summary.errorCount} errors`);
  }
}
