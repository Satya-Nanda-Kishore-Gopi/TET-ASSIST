import { createClient, isSupabaseConfigured } from '@/lib/supabase';
import { DatabaseQuestion, DatabaseDocument } from '@/lib/supabase/types';

export interface QuestionFilter {
  subject?: string;
  topic?: string;
  year?: number;
  documentId?: string;
  search?: string;
  limit?: number;
}

export interface QuestionWithDocument extends DatabaseQuestion {
  document?: Pick<DatabaseDocument, 'id' | 'title' | 'document_type' | 'year' | 'file_name'> | null;
}

export class QuestionBankService {
  /**
   * Sample Special APTET questions for fallback/demo when no documents have been processed yet
   */
  private static fallbackQuestions: QuestionWithDocument[] = [
    {
      id: 'demo-q1',
      document_id: '00000000-0000-0000-0000-000000000001',
      question_number: 1,
      question_text: 'వికాసం (Development) గురించి క్రింది వానిలో సరైన ప్రవచనం ఏది?',
      option_a: 'వికాసం అనేది పరిమాణాత్మకమైనది మాత్రమే',
      option_b: 'వికాసం శిశువులోని శారీరక, మానసిక, సాంఘిక మార్పుల సముదాయం',
      option_c: 'వికాసం పెరుగుదల ఆగగానే ఆగిపోతుంది',
      option_d: 'వికాసంను కొలవలేము మరియు అంచనా వేయలేము',
      correct_answer: 'B',
      subject: 'Child Development & Pedagogy (Special Education)',
      topic: 'Growth & Development',
      subtopic: 'Principles of Development',
      year: 2024,
      difficulty: 'medium',
      explanation: 'వికాసం గుణాత్మకమైన మరియు పరిమాణాత్మకమైన మార్పుల సమాహారం. ఇది జీవితాంతం కొనసాగుతుంది.',
      confidence: 'high',
      created_at: '2024-01-15T00:00:00Z',
      document: {
        id: 'doc-official-01',
        title: 'Special APTET Official Model Paper 2024',
        document_type: 'government_paper',
        year: 2024,
        file_name: 'special_aptet_paper1_2024.pdf',
      },
    },
    {
      id: 'demo-q2',
      document_id: 'doc-official-01',
      question_number: 2,
      question_text: 'RPwD చట్టం 2016 (Rights of Persons with Disabilities Act, 2016) ప్రకారం గుర్తించబడిన వైకల్యాల సంఖ్య ఎంత?',
      option_a: '7 రకాలు',
      option_b: '14 రకాలు',
      option_c: '21 రకాలు',
      option_d: '28 రకాలు',
      correct_answer: 'C',
      subject: 'Child Development & Pedagogy (Special Education)',
      topic: 'Inclusive Education',
      subtopic: 'RPwD Act 2016',
      year: 2024,
      difficulty: 'easy',
      explanation: '1995 PWD చట్టంలోని 7 వైకల్యాలను 2016 RPwD చట్టం 21 వైకల్యాలుగా విస్తరించింది.',
      confidence: 'high',
      created_at: '2024-01-15T00:00:00Z',
      document: {
        id: 'doc-official-01',
        title: 'Special APTET Official Model Paper 2024',
        document_type: 'government_paper',
        year: 2024,
        file_name: 'special_aptet_paper1_2024.pdf',
      },
    },
    {
      id: 'demo-q3',
      document_id: 'doc-official-01',
      question_number: 3,
      question_text: 'సమ్మిళిత విద్యా విధానం (Inclusive Education) లో ఉపాధ్యాయుని ప్రధాన బాధ్యత ఏమిటి?',
      option_a: 'ప్రత్యేక అవసరాలున్న విద్యార్థులను ప్రత్యేక పాఠశాలలకు పంపించడం',
      option_b: 'సాధారణ మరియు ప్రత్యేక పిల్లలను వేర్వేరు గదులలో కూర్చోబెట్టడం',
      option_c: 'తరగతి గదిలోని వైవిధ్యతను గుర్తించి ప్రతి శిశువు అభ్యసన శైలికి అనుగుణంగా బోధించడం',
      option_d: 'కేవలం సాధారణ విద్యార్థుల ప్రతిభపై మాత్రమే దృష్టి పెట్టడం',
      correct_answer: 'C',
      subject: 'Child Development & Pedagogy (Special Education)',
      topic: 'Inclusive Education',
      subtopic: 'Teacher Roles',
      year: 2024,
      difficulty: 'medium',
      explanation: 'సమ్మిళిత విద్యలో ప్రతి విద్యార్థి యొక్క ప్రత్యేక అవసరాలను గుర్తించి అనువైన బోధనా పద్ధతులను (differentiated instruction) ఉపయోగించాలి.',
      confidence: 'high',
      created_at: '2024-01-15T00:00:00Z',
      document: {
        id: 'doc-official-01',
        title: 'Special APTET Official Model Paper 2024',
        document_type: 'government_paper',
        year: 2024,
        file_name: 'special_aptet_paper1_2024.pdf',
      },
    },
    {
      id: 'demo-q4',
      document_id: 'doc-official-02',
      question_number: 4,
      question_text: 'Which of the following conditions is specifically characterized by persistent difficulties in social communication and interaction, alongside repetitive behaviors?',
      option_a: 'Dyscalculia',
      option_b: 'Autism Spectrum Disorder (ASD)',
      option_c: 'Locomotor Disability',
      option_d: 'Visual Impairment',
      correct_answer: 'B',
      subject: 'Child Development & Pedagogy (Special Education)',
      topic: 'Neurodevelopmental Disorders',
      subtopic: 'Autism Spectrum Disorder',
      year: 2024,
      difficulty: 'easy',
      explanation: 'Autism Spectrum Disorder (ASD) is characterized by impairments in social reciprocity and communication along with repetitive patterns of behavior.',
      confidence: 'high',
      created_at: '2024-01-15T00:00:00Z',
      document: {
        id: 'doc-official-02',
        title: 'Special APTET Previous Year Paper 2023',
        document_type: 'previous_year',
        year: 2023,
        file_name: 'special_aptet_pyq_2023.pdf',
      },
    },
    {
      id: 'demo-q5',
      document_id: 'doc-official-02',
      question_number: 5,
      question_text: 'క్రింది వానిలో బ్రెయిలీ లిపి (Braille Script) లో ఒక ఘటంలో (Cell) ఉండే బిందువుల (Dots) సంఖ్య ఎంత?',
      option_a: '4 బిందువులు',
      option_b: '6 బిందువులు',
      option_c: '8 బిందువులు',
      option_d: '10 బిందువులు',
      correct_answer: 'B',
      subject: 'Child Development & Pedagogy (Special Education)',
      topic: 'Sensory Impairments',
      subtopic: 'Assistive Devices & Braille',
      year: 2023,
      difficulty: 'easy',
      explanation: 'సాంప్రదాయ లూయిస్ బ్రెయిలీ లిపిలో ప్రతి అక్షర ఘటం 2 నిలువు వరుసలలో 3 బిందువులు చొప్పున మొత్తం 6 బిందువులను కలిగి ఉంటుంది.',
      confidence: 'high',
      created_at: '2024-01-15T00:00:00Z',
      document: {
        id: 'doc-official-02',
        title: 'Special APTET Previous Year Paper 2023',
        document_type: 'previous_year',
        year: 2023,
        file_name: 'special_aptet_pyq_2023.pdf',
      },
    },
  ];

  /**
   * Retrieve questions from Supabase matching filter criteria, joining document metadata
   */
  static async getQuestions(filter?: QuestionFilter): Promise<QuestionWithDocument[]> {
    if (!isSupabaseConfigured()) {
      return this.filterFallbackQuestions(filter);
    }

    try {
      const supabase = createClient();
      if (!supabase) return this.filterFallbackQuestions(filter);

      // Query questions joined with documents
      let query = supabase
        .from('questions')
        .select(`
          *,
          document:documents (
            id,
            title,
            document_type,
            year,
            file_name
          )
        `)
        .order('question_number', { ascending: true });

      if (filter?.subject && filter.subject !== 'all') {
        query = query.ilike('subject', `%${filter.subject}%`);
      }
      if (filter?.topic) {
        query = query.eq('topic', filter.topic);
      }
      if (filter?.year) {
        query = query.eq('year', filter.year);
      }
      if (filter?.documentId) {
        query = query.eq('document_id', filter.documentId);
      }
      if (filter?.limit) {
        query = query.limit(filter.limit);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return this.filterFallbackQuestions(filter);
      }

      let results = data as unknown as QuestionWithDocument[];

      if (filter?.search && filter.search.trim() !== '') {
        const searchLower = filter.search.toLowerCase().trim();
        results = results.filter(
          (q) =>
            q.question_text.toLowerCase().includes(searchLower) ||
            q.option_a.toLowerCase().includes(searchLower) ||
            q.option_b.toLowerCase().includes(searchLower) ||
            q.option_c.toLowerCase().includes(searchLower) ||
            q.option_d.toLowerCase().includes(searchLower)
        );
      }

      return results;
    } catch {
      return this.filterFallbackQuestions(filter);
    }
  }

  /**
   * Retrieve a single question by ID
   */
  static async getQuestionById(id: string): Promise<QuestionWithDocument | null> {
    if (!isSupabaseConfigured()) {
      return this.fallbackQuestions.find((q) => q.id === id) || null;
    }

    try {
      const supabase = createClient();
      if (!supabase) {
        return this.fallbackQuestions.find((q) => q.id === id) || null;
      }

      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          document:documents (
            id,
            title,
            document_type,
            year,
            file_name
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return this.fallbackQuestions.find((q) => q.id === id) || null;
      }

      return data as unknown as QuestionWithDocument;
    } catch {
      return this.fallbackQuestions.find((q) => q.id === id) || null;
    }
  }

  /**
   * Retrieve questions by subject identifier
   */
  static async getQuestionsBySubject(subject: string): Promise<QuestionWithDocument[]> {
    return this.getQuestions({ subject });
  }

  /**
   * Retrieve questions mapped to a specific topic ID
   */
  static async getQuestionsByTopic(topicId: string): Promise<QuestionWithDocument[]> {
    return this.getQuestions({ topic: topicId });
  }

  /**
   * Filters in-memory fallback questions
   */
  private static filterFallbackQuestions(filter?: QuestionFilter): QuestionWithDocument[] {
    let items = [...this.fallbackQuestions];

    if (filter?.subject && filter.subject !== 'all') {
      const subLower = filter.subject.toLowerCase();
      items = items.filter((q) => q.subject?.toLowerCase().includes(subLower));
    }
    if (filter?.year) {
      items = items.filter((q) => q.year === filter.year);
    }
    if (filter?.documentId) {
      items = items.filter((q) => q.document_id === filter.documentId);
    }
    if (filter?.search && filter.search.trim() !== '') {
      const searchLower = filter.search.toLowerCase().trim();
      items = items.filter(
        (q) =>
          q.question_text.toLowerCase().includes(searchLower) ||
          q.option_a.toLowerCase().includes(searchLower) ||
          q.option_b.toLowerCase().includes(searchLower) ||
          q.option_c.toLowerCase().includes(searchLower) ||
          q.option_d.toLowerCase().includes(searchLower)
      );
    }
    if (filter?.limit) {
      items = items.slice(0, filter.limit);
    }

    return items;
  }
}
