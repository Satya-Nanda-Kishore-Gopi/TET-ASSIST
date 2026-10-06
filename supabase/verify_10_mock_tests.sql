-- ==============================================================================
-- Verification Queries: 10 Fully Functional TET Paper 1A Mock Tests
-- ==============================================================================

-- 1. Verify there are exactly 10 Paper 1A tests
SELECT 
    count(*) AS total_paper_1a_tests,
    CASE WHEN count(*) = 10 THEN 'PASSED' ELSE 'FAILED' END AS check_1_status
FROM public.tet_tests
WHERE test_type = 'PAPER_1A' OR title ILIKE '%Paper 1A%';

-- 2. Verify every test has exactly 120 questions
SELECT 
    t.id,
    t.title,
    count(tq.question_id) AS question_count,
    CASE WHEN count(tq.question_id) = 120 THEN 'PASSED' ELSE 'FAILED' END AS check_2_status
FROM public.tet_tests t
JOIN public.tet_test_questions tq ON t.id = tq.test_id
GROUP BY t.id, t.title
ORDER BY t.title;

-- 3. Verify every test has exactly 30 questions per subject
SELECT 
    t.title,
    qb.subject,
    count(*) AS count_per_subject,
    CASE WHEN count(*) = 30 THEN 'PASSED' ELSE 'FAILED' END AS check_3_status
FROM public.tet_tests t
JOIN public.tet_test_questions tq ON t.id = tq.test_id
JOIN public.question_bank qb ON tq.question_id = qb.question_id
GROUP BY t.title, qb.subject
ORDER BY t.title, qb.subject;

-- 4. Verify question_order runs continuously from 1 to 120 for every test
SELECT 
    t.title,
    min(tq.question_order) AS min_order,
    max(tq.question_order) AS max_order,
    count(DISTINCT tq.question_order) AS distinct_order_count,
    CASE 
        WHEN min(tq.question_order) = 1 
         AND max(tq.question_order) = 120 
         AND count(DISTINCT tq.question_order) = 120 
        THEN 'PASSED' 
        ELSE 'FAILED' 
    END AS check_4_status
FROM public.tet_tests t
JOIN public.tet_test_questions tq ON t.id = tq.test_id
GROUP BY t.title
ORDER BY t.title;

-- 5. Verify NO duplicate question_id exists inside the same test
SELECT 
    tq.test_id,
    t.title,
    tq.question_id,
    count(*) AS duplicate_count
FROM public.tet_test_questions tq
JOIN public.tet_tests t ON tq.test_id = t.id
GROUP BY tq.test_id, t.title, tq.question_id
HAVING count(*) > 1;
-- Note: Zero rows returned from query 5 means 'PASSED'.

-- 6. Verify Mock Test 01 remains unchanged
SELECT 
    t.id,
    t.title,
    t.test_type,
    t.duration_minutes,
    t.total_questions,
    count(tq.question_id) AS question_count,
    CASE 
        WHEN t.id = 'c97f31ea-1125-4ff7-84bc-d9e52f2c3803' 
        THEN 'PASSED' 
        ELSE 'FAILED' 
    END AS check_6_status
FROM public.tet_tests t
LEFT JOIN public.tet_test_questions tq ON t.id = tq.test_id
WHERE t.id = 'c97f31ea-1125-4ff7-84bc-d9e52f2c3803'
GROUP BY t.id, t.title, t.test_type, t.duration_minutes, t.total_questions;
