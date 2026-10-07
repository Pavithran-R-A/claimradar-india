-- Allow public directory evidence links only when the source document is
-- attached to a claimable that has passed the publication gate.
--
-- This keeps the public web app on a publishable Supabase key + RLS instead of
-- requiring a service-role secret in Vercel.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'source_documents'
      and policyname = 'source_documents_select_published_claims'
  ) then
    create policy source_documents_select_published_claims
      on public.source_documents
      for select
      to anon, authenticated
      using (
        exists (
          select 1
          from public.claim_sources cs
          join public.claimables c on c.id = cs.claimable_id
          where cs.source_document_id = source_documents.id
            and c.publication_status = 'published'::public.publication_status
        )
      );
  end if;
end $$;
