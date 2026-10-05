-- ========================================================
-- TET Assist Database Schema & Storage Foundation
-- Target: Special APTET (Andhra Pradesh Teacher Eligibility Test)
-- ========================================================

-- Enable essential extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector"; -- Prepared for future pgvector RAG embeddings

-- ========================================================
-- 1. DOCUMENTS TABLE
-- ========================================================
create table if not exists public.documents (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    file_name text not null,
    storage_path text not null,
    document_type text not null check (document_type in (
        'government_paper',
        'answer_key',
        'study_material',
        'previous_year',
        'model_paper',
        'user_pdf'
    )),
    subject text,
    exam text not null default 'special_aptet' check (exam in (
        'special_aptet',
        'aptet',
        'ctet',
        'other'
    )),
    year integer,
    language text not null default 'telugu',
    status text not null default 'uploaded' check (status in (
        'uploaded',
        'processing',
        'processed',
        'failed'
    )),
    user_id uuid, -- For user uploaded PDFs (null for preloaded official material)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- 2. SUBJECTS TABLE
-- ========================================================
create table if not exists public.subjects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    display_name text not null,
    exam text not null default 'special_aptet',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint uq_subject_exam_name unique (exam, name)
);

-- ========================================================
-- 3. TOPICS TABLE
-- ========================================================
create table if not exists public.topics (
    id uuid primary key default gen_random_uuid(),
    subject_id uuid not null references public.subjects(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- 4. QUESTIONS TABLE
-- ========================================================
create table if not exists public.questions (
    id uuid primary key default gen_random_uuid(),
    document_id uuid references public.documents(id) on delete set null,
    question_number integer not null,
    question_text text not null,
    option_a text not null,
    option_b text not null,
    option_c text not null,
    option_d text not null,
    correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
    subject text not null,
    topic text,
    subtopic text,
    year integer,
    difficulty text check (difficulty in ('easy', 'medium', 'hard')),
    explanation text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- 5. QUESTION_TOPICS TABLE (Many-to-Many)
-- ========================================================
create table if not exists public.question_topics (
    question_id uuid not null references public.questions(id) on delete cascade,
    topic_id uuid not null references public.topics(id) on delete cascade,
    primary key (question_id, topic_id)
);

-- ========================================================
-- 6. TESTS TABLE
-- ========================================================
create table if not exists public.tests (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    test_type text not null check (test_type in (
        'official',
        'previous_year',
        'model',
        'practice',
        'mock'
    )),
    document_id uuid references public.documents(id) on delete set null,
    subject text,
    duration_minutes integer not null default 150,
    total_questions integer not null default 150,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- 7. TEST_QUESTIONS TABLE
-- ========================================================
create table if not exists public.test_questions (
    test_id uuid not null references public.tests(id) on delete cascade,
    question_id uuid not null references public.questions(id) on delete cascade,
    question_order integer not null,
    primary key (test_id, question_id)
);

-- ========================================================
-- 8. USER_TEST_ATTEMPTS TABLE
-- ========================================================
create table if not exists public.user_test_attempts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid, -- Nullable for unauthenticated practice sessions
    test_id uuid not null references public.tests(id) on delete cascade,
    score integer,
    total_marks integer not null default 150,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

-- ========================================================
-- 9. USER_ANSWERS TABLE
-- ========================================================
create table if not exists public.user_answers (
    id uuid primary key default gen_random_uuid(),
    attempt_id uuid not null references public.user_test_attempts(id) on delete cascade,
    question_id uuid not null references public.questions(id) on delete cascade,
    selected_answer text not null,
    is_correct boolean,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================================
-- INDEXES FOR PERFORMANCE
-- ========================================================
create index if not exists idx_documents_exam_type on public.documents(exam, document_type);
create index if not exists idx_documents_status on public.documents(status);
create index if not exists idx_documents_user on public.documents(user_id);
create index if not exists idx_questions_document on public.questions(document_id);
create index if not exists idx_questions_subject on public.questions(subject);
create index if not exists idx_questions_year on public.questions(year);
create index if not exists idx_topics_subject on public.topics(subject_id);
create index if not exists idx_tests_type on public.tests(test_type);
create index if not exists idx_test_questions_order on public.test_questions(test_id, question_order);
create index if not exists idx_user_attempts_user on public.user_test_attempts(user_id);
create index if not exists idx_user_answers_attempt on public.user_answers(attempt_id);

-- ========================================================
-- AUTOMATIC updated_at TRIGGER FOR DOCUMENTS
-- ========================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger tr_documents_updated_at
    before update on public.documents
    for each row
    execute function public.handle_updated_at();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
alter table public.documents enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.question_topics enable row level security;
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.user_test_attempts enable row level security;
alter table public.user_answers enable row level security;

-- 1. Preloaded & Official Material: Publicly readable by all
create policy "Allow public read of official documents"
    on public.documents for select
    using (document_type != 'user_pdf' or user_id is null);

-- 2. User Private Documents: Readable/writable only by owner
create policy "Allow authenticated user to read own documents"
    on public.documents for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Allow authenticated user to insert own documents"
    on public.documents for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Allow authenticated user to update own documents"
    on public.documents for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Allow authenticated user to delete own documents"
    on public.documents for delete
    to authenticated
    using (auth.uid() = user_id);

-- 3. Subjects, Topics, Tests, and Questions: Publicly readable
create policy "Allow public read of subjects"
    on public.subjects for select
    using (true);

create policy "Allow public read of topics"
    on public.topics for select
    using (true);

create policy "Allow public read of questions"
    on public.questions for select
    using (true);

create policy "Allow public read of question_topics"
    on public.question_topics for select
    using (true);

create policy "Allow public read of tests"
    on public.tests for select
    using (true);

create policy "Allow public read of test_questions"
    on public.test_questions for select
    using (true);

-- 4. User Attempts & Answers
create policy "Allow users to view own attempts"
    on public.user_test_attempts for select
    using (user_id is null or (auth.uid() is not null and auth.uid() = user_id));

create policy "Allow users to insert attempts"
    on public.user_test_attempts for insert
    with check (user_id is null or (auth.uid() is not null and auth.uid() = user_id));

create policy "Allow users to view own answers"
    on public.user_answers for select
    using (exists (
        select 1 from public.user_test_attempts a
        where a.id = user_answers.attempt_id
        and (a.user_id is null or a.user_id = auth.uid())
    ));

create policy "Allow users to insert answers"
    on public.user_answers for insert
    with check (exists (
        select 1 from public.user_test_attempts a
        where a.id = user_answers.attempt_id
        and (a.user_id is null or a.user_id = auth.uid())
    ));

-- ========================================================
-- STORAGE BUCKET CONFIGURATION (tet-documents)
-- ========================================================
-- Run in Supabase SQL editor:
insert into storage.buckets (id, name, public)
values ('tet-documents', 'tet-documents', false)
on conflict (id) do nothing;

-- Storage Policy: Allow read access to preloaded materials
create policy "Allow public read for official study material"
    on storage.objects for select
    using (
        bucket_id = 'tet-documents'
        and (storage.foldername(name))[1] = 'special-aptet'
        and (storage.foldername(name))[2] in ('government', 'previous-year', 'model', 'study-material')
    );

-- Storage Policy: Allow authenticated users to manage their own folder in user/
create policy "Allow authenticated user to upload own PDFs"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'tet-documents'
        and (storage.foldername(name))[1] = 'special-aptet'
        and (storage.foldername(name))[2] = 'user'
        and (storage.foldername(name))[3] = auth.uid()::text
    );

create policy "Allow authenticated user to read own PDFs"
    on storage.objects for select
    to authenticated
    using (
        bucket_id = 'tet-documents'
        and (storage.foldername(name))[1] = 'special-aptet'
        and (storage.foldername(name))[2] = 'user'
        and (storage.foldername(name))[3] = auth.uid()::text
    );

-- ========================================================
-- SEED DATA: Special APTET Subjects
-- ========================================================
insert into public.subjects (name, display_name, exam) values
    ('cdp_special', 'Child Development & Pedagogy (Special Education)', 'special_aptet'),
    ('telugu', 'Language I (Telugu)', 'special_aptet'),
    ('english', 'Language II (English)', 'special_aptet'),
    ('mathematics', 'Mathematics', 'special_aptet'),
    ('evs', 'Environmental Studies', 'special_aptet')
on conflict (exam, name) do nothing;
