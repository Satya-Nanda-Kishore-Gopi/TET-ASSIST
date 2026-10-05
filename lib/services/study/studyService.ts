import { createClient, isSupabaseConfigured } from '@/lib/supabase';
import { DatabaseDocument } from '@/lib/supabase/types';

export interface StudyTopicModule {
  id: string;
  subject: string;
  title: string;
  teluguTitle: string;
  summary: string;
  sourceDocTitle?: string;
  weightageQuestions: number;
  importance: 'high' | 'very_high' | 'medium';
  keyPoints: string[];
}

export class StudyService {
  private static fallbackModules: StudyTopicModule[] = [
    {
      id: 'topic-cdp-01',
      subject: 'Child Development & Pedagogy (Special Education)',
      title: 'RPwD Act 2016 & Recognized Disabilities',
      teluguTitle: 'దివ్యాంగుల హక్కుల చట్టం 2016 (21 వైకల్యాలు)',
      summary:
        'The Rights of Persons with Disabilities Act, 2016 replaces the 1995 PWD Act, increasing recognized disability categories from 7 to 21 with 4% reservation in government jobs.',
      sourceDocTitle: 'Child Development & Inclusive Pedagogy Compendium',
      weightageQuestions: 6,
      importance: 'very_high',
      keyPoints: [
        'Recognized 21 categories: Autism Spectrum Disorder, Specific Learning Disabilities, Cerebral Palsy, Multiple Disabilities, etc.',
        'Definition of Benchmark Disability: not less than 40% certified disability.',
        'Right to Free Education up to age 18 in appropriate environment.',
        'Mandate for Inclusive Classroom adaptation, Barrier-free accessibility, and reasonable accommodation.',
      ],
    },
    {
      id: 'topic-cdp-02',
      subject: 'Child Development & Pedagogy (Special Education)',
      title: "Piaget's Stages of Cognitive Development",
      teluguTitle: 'జీన్ పియాజే సంజ్ఞానాత్మక వికాస సిద్ధాంతం',
      summary:
        'Foundational developmental framework describing how children construct mental models of the world through Sensorimotor, Preoperational, Concrete Operational, and Formal Operational stages.',
      sourceDocTitle: 'Child Development & Inclusive Pedagogy Compendium',
      weightageQuestions: 5,
      importance: 'very_high',
      keyPoints: [
        'Sensorimotor (0-2 years): Object permanence (వస్తు స్థిరత్వ భావన), motor reflexes.',
        'Preoperational (2-7 years): Egocentrism (అహం కేంద్రికత), animism, lack of conservation.',
        'Concrete Operational (7-11 years): Conservation (పరిరక్షణ), reversibility, classification.',
        'Formal Operational (11+ years): Abstract reasoning (అమూర్త ఆలోచన), hypothetical-deductive logic.',
      ],
    },
    {
      id: 'topic-cdp-03',
      subject: 'Child Development & Pedagogy (Special Education)',
      title: 'Specific Learning Disabilities (SLD) & Assistive Tech',
      teluguTitle: 'అభ్యసన వైకల్యాలు & సహాయక సాంకేతికత',
      summary:
        'Neurodevelopmental conditions affecting reading, writing, and calculations: Dyslexia, Dyscalculia, and Dysgraphia, along with remedial pedagogical strategies.',
      sourceDocTitle: 'Special APTET Official Syllabus & Blueprint',
      weightageQuestions: 5,
      importance: 'very_high',
      keyPoints: [
        'Dyslexia: Difficulty with phonological processing and reading accuracy.',
        'Dyscalculia: Severe difficulty understanding arithmetic facts and numbers.',
        'Dysgraphia: Impairment in handwriting, fine-motor coordination, and spelling.',
        'Assistive Tech: Screen readers, Braille displays, multi-sensory teaching tools (VAKT method).',
      ],
    },
    {
      id: 'topic-telugu-01',
      subject: 'Language I (Telugu)',
      title: 'భాషా బోధనా పద్ధతులు & మూల్యాంకనం (Telugu Pedagogy)',
      teluguTitle: 'తెలుగు భాషా బోధన మరియు సమ్మిళిత తరగతి వ్యూహాలు',
      summary:
        'తెలుగు భాషా నైపుణ్యాలు (LSRW - శ్రవణం, భాషణం, పఠనం, లేఖనం) మరియు ప్రత్యేక అవసరాలున్న పిల్లలకు భాషను బోధించే సమగ్ర విధానాలు.',
      sourceDocTitle: 'Special APTET Telugu Curriculum Guide',
      weightageQuestions: 6,
      importance: 'high',
      keyPoints: [
        'చతుర్విధ భాషా నైపుణ్యాల క్రమం: శ్రవణం, భాషణం, పఠనం, లేఖనం.',
        'శ్రవణ లోపం ఉన్న పిల్లలకు పెదవుల కదలిక (Lip reading) మరియు సైగ భాష (Sign Language) ఉపయోగం.',
        'నిరంతర సమగ్ర మూల్యాంకనం (CCE) పద్ధతులు.',
      ],
    },
    {
      id: 'topic-math-01',
      subject: 'Mathematics',
      title: 'గణిత బోధనా శాస్త్రం (Mathematics Pedagogy for Special Needs)',
      teluguTitle: 'గణిత భావనలు & సహాయక పరికరాలు (Taylor Frame, Abacus)',
      summary:
        'అమూర్త గణిత భావనలను మూర్త అనుభవాలుగా మార్చే బోధనా పద్ధతులు, టేలర్ ఫ్రేమ్ మరియు అబాకస్ వినియోగం.',
      sourceDocTitle: 'Special APTET Math Foundation Notes',
      weightageQuestions: 6,
      importance: 'high',
      keyPoints: [
        'దృష్టి లోపం ఉన్న విద్యార్థుల కోసం టేలర్ ఫ్రేమ్ (Taylor Frame) మరియు అబాకస్ (Abacus) వినియోగం.',
        'డిస్కాల్క్యులియా ఉన్న విద్యార్థులకు కాంక్రీట్-రిప్రజెంటేషనల్-అబ్‌స్ట్రాక్ట్ (CRA) విధానం.',
      ],
    },
  ];

  /**
   * Retrieve official study material documents from Supabase
   */
  static async getStudyDocuments(subject?: string): Promise<DatabaseDocument[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const supabase = createClient();
      if (!supabase) return [];

      let query = supabase
        .from('documents')
        .select('*')
        .in('document_type', ['study_material', 'syllabus'])
        .order('created_at', { ascending: false });

      if (subject && subject !== 'all') {
        query = query.ilike('subject', `%${subject}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data as DatabaseDocument[];
    } catch {
      return [];
    }
  }

  /**
   * Retrieve structured study topics and concept modules
   */
  static async getTopicModules(subject?: string): Promise<StudyTopicModule[]> {
    if (!subject || subject === 'all') {
      return this.fallbackModules;
    }
    const subLower = subject.toLowerCase();
    return this.fallbackModules.filter((m) => m.subject.toLowerCase().includes(subLower));
  }
}
