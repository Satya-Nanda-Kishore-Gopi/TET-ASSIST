-- ========================================================
-- TET Assist Database Schema Update: Admin Ingestion & Knowledge Base
-- ========================================================

-- 1. Allow correct_answer to be nullable when answer key is not yet available
alter table public.questions drop constraint if exists questions_correct_answer_check;
alter table public.questions alter column correct_answer drop not null;
alter table public.questions add constraint questions_correct_answer_check
    check (correct_answer is null or correct_answer in ('A', 'B', 'C', 'D'));

-- 2. Allow subject to be nullable initially (classified later)
alter table public.questions alter column subject drop not null;

-- 3. Add fingerprint column for deterministic deduplication
alter table public.questions add column if not exists fingerprint text;
create index if not exists idx_questions_doc_fingerprint on public.questions(document_id, fingerprint);
create index if not exists idx_questions_fingerprint on public.questions(fingerprint);

-- 4. Add confidence column for parsing quality ('high', 'medium', 'low')
alter table public.questions add column if not exists confidence text default 'high'
    check (confidence in ('high', 'medium', 'low'));

-- 5. Expand document_type to support Question Banks and Official Syllabus
alter table public.documents drop constraint if exists documents_document_type_check;
alter table public.documents add constraint documents_document_type_check
    check (document_type in (
        'government_paper',
        'previous_year',
        'model_paper',
        'question_bank',
        'answer_key',
        'syllabus',
        'study_material',
        'user_pdf'
    ));

-- 6. Add related_document_id and raw_text columns to documents
alter table public.documents add column if not exists related_document_id uuid references public.documents(id) on delete set null;
alter table public.documents add column if not exists raw_text text;
alter table public.documents add column if not exists metadata jsonb default '{}'::jsonb;
create index if not exists idx_documents_type on public.documents(document_type);

-- 7. Add policies to permit server-side document & question processing
drop policy if exists "Allow insert questions for documents" on public.questions;
create policy "Allow insert questions for documents"
    on public.questions for insert
    with check (true);

drop policy if exists "Allow update questions for documents" on public.questions;
create policy "Allow update questions for documents"
    on public.questions for update
    using (true);

drop policy if exists "Allow delete questions for documents" on public.questions;
create policy "Allow delete questions for documents"
    on public.questions for delete
    using (true);

drop policy if exists "Allow public insert documents" on public.documents;
create policy "Allow public insert documents"
    on public.documents for insert
    with check (true);

drop policy if exists "Allow public update documents" on public.documents;
create policy "Allow public update documents"
    on public.documents for update
    using (true);

-- 8. Ensure Storage Bucket policies allow uploads into tet-documents
drop policy if exists "Allow public upload to tet-documents" on storage.objects;
create policy "Allow public upload to tet-documents"
    on storage.objects for insert
    with check (bucket_id = 'tet-documents');

drop policy if exists "Allow public read from tet-documents" on storage.objects;
create policy "Allow public read from tet-documents"
    on storage.objects for select
    using (bucket_id = 'tet-documents');

-- 9. Seed Official Special APTET Documents
insert into public.documents (
    id,
    title,
    description,
    file_name,
    storage_path,
    document_type,
    subject,
    exam,
    year,
    language,
    status,
    metadata
) values
(
    '00000000-0000-0000-0000-000000000001',
    'Special APTET Official Question Paper 2024 (Paper I)',
    'Department of School Education official paper covering Child Development & Special Pedagogy, Language I & II, Math, and EVS.',
    'special_aptet_paper1_2024.pdf',
    'special-aptet/government/special_aptet_paper1_2024.pdf',
    'government_paper',
    'Child Development & Pedagogy (Special Education)',
    'special_aptet',
    2024,
    'Telugu & English',
    'uploaded',
    '{"page_count": 16, "file_size_bytes": 2450000}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000002',
    'Special APTET Official Answer Key 2024 (Initial Key)',
    'Government-released final validated answer keys for Special APTET Paper I series.',
    'special_aptet_key_2024.pdf',
    'special-aptet/government/special_aptet_key_2024.pdf',
    'answer_key',
    'All Subjects',
    'special_aptet',
    2024,
    'Telugu & English',
    'uploaded',
    '{"page_count": 4, "file_size_bytes": 320000}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000003',
    'Special APTET Previous Year Paper 2023',
    'Authentic previous examination paper with detailed questions across inclusive classroom pedagogy and special education.',
    'special_aptet_pyq_2023.pdf',
    'special-aptet/previous-year/special_aptet_pyq_2023.pdf',
    'previous_year',
    'Child Development & Pedagogy (Special Education)',
    'special_aptet',
    2023,
    'Telugu & English',
    'uploaded',
    '{"page_count": 14, "file_size_bytes": 1850000}'::jsonb
)
on conflict (id) do nothing;
