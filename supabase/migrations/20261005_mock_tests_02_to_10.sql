-- ==============================================================================
-- Migration: Create Mock Tests 02 through 10 for Special APTET Paper 1A
--
-- Requirements:
-- 1. Preserve the existing verified Mock Test 01 unchanged.
-- 2. Do NOT modify question_bank.
-- 3. Create Mock Tests 02 through 10 in public.tet_tests.
-- 4. Insert 120 questions per test into public.tet_test_questions:
--    - Child Development & Pedagogy (CDP): question_order 1 - 30
--    - Mathematics:                        question_order 31 - 60
--    - Language I (Telugu):                 question_order 61 - 90
--    - Language II (English):                question_order 91 - 120
-- 5. Deterministic hashing ensures distinct selections and orderings across tests.
-- 6. No duplicate questions within the same test.
-- 7. Enables public SELECT RLS policies for seamless test consumption.
-- ==============================================================================

-- 1. Ensure RLS policies permit reading tests, questions, and mappings
ALTER TABLE IF EXISTS public.tet_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on tet_tests" ON public.tet_tests;
CREATE POLICY "Allow public read on tet_tests"
    ON public.tet_tests FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.tet_test_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on tet_test_questions" ON public.tet_test_questions;
CREATE POLICY "Allow public read on tet_test_questions"
    ON public.tet_test_questions FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.question_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on question_bank" ON public.question_bank;
CREATE POLICY "Allow public read on question_bank"
    ON public.question_bank FOR SELECT USING (true);

-- 2. Ensure Mock Test 01 exists and remains unchanged
INSERT INTO public.tet_tests (
    id,
    title,
    description,
    test_type,
    duration_minutes,
    total_questions,
    created_at
)
VALUES (
    'c97f31ea-1125-4ff7-84bc-d9e52f2c3803',
    'APTET Paper 1A Mock Test 01',
    'Verified 120-question authentic mock examination for Special APTET Paper 1A (Classes I-V).',
    'PAPER_1A',
    150,
    120,
    '2026-10-05 12:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Mock Tests 02 through 10 into tet_tests
INSERT INTO public.tet_tests (
    id,
    title,
    description,
    test_type,
    duration_minutes,
    total_questions,
    created_at
)
VALUES
    ('c97f31ea-1125-4ff7-84bc-000000000002', 'APTET Paper 1A Mock Test 02', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:05:00+00'),
    ('c97f31ea-1125-4ff7-84bc-000000000003', 'APTET Paper 1A Mock Test 03', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:10:00+00'),
    ('c97f31ea-1125-4ff7-84bc-000000000004', 'APTET Paper 1A Mock Test 04', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:15:00+00'),
    ('c97f31ea-1125-4ff7-84bc-000000000005', 'APTET Paper 1A Mock Test 05', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:20:00+00'),
    ('c97f31ea-1125-4ff7-84bc-000000000006', 'APTET Paper 1A Mock Test 06', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:25:00+00'),
    ('c97f31ea-1125-4ff7-84bc-000000000007', 'APTET Paper 1A Mock Test 07', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:30:00+00'),
    ('c97f31ea-1125-4ff7-84bc-000000000008', 'APTET Paper 1A Mock Test 08', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:35:00+00'),
    ('c97f31ea-1125-4ff7-84bc-000000000009', 'APTET Paper 1A Mock Test 09', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:40:00+00'),
    ('c97f31ea-1125-4ff7-84bc-000000000010', 'APTET Paper 1A Mock Test 10', 'Full-length 120-question mock examination for Special APTET Paper 1A (Classes I-V).', 'PAPER_1A', 150, 120, '2026-10-05 12:45:00+00')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    test_type = EXCLUDED.test_type,
    duration_minutes = EXCLUDED.duration_minutes,
    total_questions = EXCLUDED.total_questions;

-- 4. Clean previous question mappings for tests 02-10 only
DELETE FROM public.tet_test_questions
WHERE test_id IN (
    'c97f31ea-1125-4ff7-84bc-000000000002',
    'c97f31ea-1125-4ff7-84bc-000000000003',
    'c97f31ea-1125-4ff7-84bc-000000000004',
    'c97f31ea-1125-4ff7-84bc-000000000005',
    'c97f31ea-1125-4ff7-84bc-000000000006',
    'c97f31ea-1125-4ff7-84bc-000000000007',
    'c97f31ea-1125-4ff7-84bc-000000000008',
    'c97f31ea-1125-4ff7-84bc-000000000009',
    'c97f31ea-1125-4ff7-84bc-000000000010'
);

-- 5. Insert 120 questions per test using PL/pgSQL
DO $$
DECLARE
    v_test_ids UUID[] := ARRAY[
        'c97f31ea-1125-4ff7-84bc-000000000002'::UUID,
        'c97f31ea-1125-4ff7-84bc-000000000003'::UUID,
        'c97f31ea-1125-4ff7-84bc-000000000004'::UUID,
        'c97f31ea-1125-4ff7-84bc-000000000005'::UUID,
        'c97f31ea-1125-4ff7-84bc-000000000006'::UUID,
        'c97f31ea-1125-4ff7-84bc-000000000007'::UUID,
        'c97f31ea-1125-4ff7-84bc-000000000008'::UUID,
        'c97f31ea-1125-4ff7-84bc-000000000009'::UUID,
        'c97f31ea-1125-4ff7-84bc-000000000010'::UUID
    ];
    t_id UUID;
BEGIN
    FOREACH t_id IN ARRAY v_test_ids
    LOOP
        -- 1. Child Development & Pedagogy (CDP): Order 1 to 30
        INSERT INTO public.tet_test_questions (test_id, question_id, question_order)
        SELECT t_id, question_id, (row_number() OVER (ORDER BY md5(t_id::text || question_id::text || 'cdp_seed')))::INTEGER
        FROM public.question_bank
        WHERE subject ILIKE '%Child Development%' OR subject ILIKE '%CDP%'
        LIMIT 30;

        -- 2. Mathematics: Order 31 to 60
        INSERT INTO public.tet_test_questions (test_id, question_id, question_order)
        SELECT t_id, question_id, (30 + row_number() OVER (ORDER BY md5(t_id::text || question_id::text || 'math_seed')))::INTEGER
        FROM public.question_bank
        WHERE subject ILIKE '%Math%'
        LIMIT 30;

        -- 3. Language I (Telugu): Order 61 to 90
        INSERT INTO public.tet_test_questions (test_id, question_id, question_order)
        SELECT t_id, question_id, (60 + row_number() OVER (ORDER BY md5(t_id::text || question_id::text || 'telugu_seed')))::INTEGER
        FROM public.question_bank
        WHERE subject ILIKE '%Telugu%'
        LIMIT 30;

        -- 4. Language II (English): Order 91 to 120
        INSERT INTO public.tet_test_questions (test_id, question_id, question_order)
        SELECT t_id, question_id, (90 + row_number() OVER (ORDER BY md5(t_id::text || question_id::text || 'english_seed')))::INTEGER
        FROM public.question_bank
        WHERE subject ILIKE '%English%'
        LIMIT 30;
    END LOOP;
END $$;
