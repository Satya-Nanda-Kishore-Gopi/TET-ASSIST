-- TET Assist: attempt and answer storage for the TET-specific question bank.
-- question_bank.question_id is INTEGER, so these tables intentionally do not
-- reuse the legacy user_test_attempts/user_answers tables.

create table if not exists public.tet_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    test_id UUID NOT NULL REFERENCES public.tet_tests(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score INTEGER,
    total_marks INTEGER NOT NULL DEFAULT 120,
    status TEXT NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'completed', 'expired'))
);

create table if not exists public.tet_attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES public.tet_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES public.question_bank(question_id),
    selected_option INTEGER NOT NULL CHECK (selected_option BETWEEN 1 AND 4),
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (attempt_id, question_id)
);

create index if not exists idx_tet_attempts_user
    ON public.tet_attempts(user_id);

create index if not exists idx_tet_attempts_test
    ON public.tet_attempts(test_id);

create index if not exists idx_tet_attempt_answers_attempt
    ON public.tet_attempt_answers(attempt_id);

create index if not exists idx_tet_attempt_answers_question
    ON public.tet_attempt_answers(question_id);
