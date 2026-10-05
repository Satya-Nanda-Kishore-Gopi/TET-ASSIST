-- Create Paper 1A Mock Tests 02-10.
-- Mock Test 01 already exists and is intentionally left unchanged.
-- Each new test gets 30 random questions from each subject, with no duplicate
-- question inside the same test. Questions flagged for OCR review are excluded.

DO $$
DECLARE
  v_test_id UUID;
  v_test_no INTEGER;
BEGIN
  FOR v_test_no IN 2..10 LOOP
    SELECT id INTO v_test_id
    FROM public.tet_tests
    WHERE title = format('Special APTET Paper 1A Mock Test %s', lpad(v_test_no::text, 2, '0'))
    LIMIT 1;

    IF v_test_id IS NULL THEN
      INSERT INTO public.tet_tests (
        title, description, test_type, duration_minutes, total_questions
      )
      VALUES (
        format('Special APTET Paper 1A Mock Test %s', lpad(v_test_no::text, 2, '0')),
        format('Full-length Paper 1A mock test %s with 30 questions each from CDP, Mathematics, Telugu and English.', lpad(v_test_no::text, 2, '0')),
        'PAPER_1A_MOCK',
        150,
        120
      )
      RETURNING id INTO v_test_id;
    END IF;

    INSERT INTO public.tet_test_questions (test_id, question_id, question_order)
    SELECT
      v_test_id,
      q.question_id,
      row_number() OVER (ORDER BY q.subject, q.random_rank)::INTEGER
    FROM (
      SELECT
        qb.question_id,
        qb.subject,
        random() AS random_rank,
        row_number() OVER (PARTITION BY qb.subject ORDER BY random()) AS subject_rank
      FROM public.question_bank qb
      WHERE qb.quality_flag IS DISTINCT FROM 'OCR_REVIEW_REMAINING'
        AND qb.subject IN ('CDP', 'Mathematics', 'Telugu', 'English')
    ) q
    WHERE q.subject_rank <= 30
    ON CONFLICT (test_id, question_id) DO NOTHING;
  END LOOP;

  -- Give the original verified test a stable Mock Test 01 title.
  UPDATE public.tet_tests
  SET title = 'Special APTET Paper 1A Mock Test 01',
      test_type = 'PAPER_1A_MOCK',
      description = 'Full-length Paper 1A mock test 01 with 30 questions each from CDP, Mathematics, Telugu and English.'
  WHERE id = 'c97f31ea-1125-4ff7-84bc-d9e52f2c3803';
END $$;

-- Verification helper:
-- SELECT t.title, count(q.id) AS question_count
-- FROM public.tet_tests t
-- LEFT JOIN public.tet_test_questions q ON q.test_id = t.id
-- WHERE t.test_type = 'PAPER_1A_MOCK'
-- GROUP BY t.id, t.title
-- ORDER BY t.title;
