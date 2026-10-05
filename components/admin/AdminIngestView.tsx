'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DocumentService } from '@/lib/services/documents';
import { DatabaseDocument, DocumentType } from '@/lib/supabase/types';
import {
  ShieldCheck,
  Upload,
  BookOpen,
  FileUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Layers,
  Database,
  Trash2,
} from 'lucide-react';

interface BatchFileItem {
  id: string;
  file: File;
  title: string;
  documentType: DocumentType;
  subject: string;
  year: string;
  relatedDocId?: string;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  errorMessage?: string;
  questionsFound?: number;
  questionsImported?: number;
}

export function AdminIngestView() {
  const [documents, setDocuments] = useState<DatabaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [batchQueue, setBatchQueue] = useState<BatchFileItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [activeProcessingId, setActiveProcessingId] = useState<string | null>(null);
  const [testGeneratingId, setTestGeneratingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Global defaults for fast batching
  const [defaultType, setDefaultType] = useState<DocumentType>('government_paper');
  const [defaultSubject, setDefaultSubject] = useState(
    'Child Development & Pedagogy (Special Education)'
  );
  const [defaultYear, setDefaultYear] = useState('2024');

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await DocumentService.getDocuments({ exam: 'special_aptet' });
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    DocumentService.getDocuments({ exam: 'special_aptet' })
      .then((docs) => {
        if (isMounted) setDocuments(docs);
      })
      .catch((err) => {
        console.error('Failed to load documents:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle file input selection (single or multiple)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchFileItem[] = Array.from(files).map((file, i) => {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Auto-detect answer key or syllabus from filename
      let detectedType: DocumentType = defaultType;
      const lowerName = file.name.toLowerCase();
      if (lowerName.includes('key') || lowerName.includes('ans')) {
        detectedType = 'answer_key';
      } else if (lowerName.includes('syllabus') || lowerName.includes('blueprint')) {
        detectedType = 'syllabus';
      } else if (lowerName.includes('model')) {
        detectedType = 'model_paper';
      } else if (lowerName.includes('pyq') || lowerName.includes('previous')) {
        detectedType = 'previous_year';
      }

      return {
        id: `batch-${Date.now()}-${i}`,
        file,
        title: cleanTitle,
        documentType: detectedType,
        subject: defaultSubject,
        year: defaultYear,
        status: 'pending',
      };
    });

    setBatchQueue((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  // Remove item from batch queue
  const removeQueueItem = (id: string) => {
    setBatchQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Process entire batch
  const processBatchQueue = async () => {
    if (batchQueue.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);
    setNotification({
      type: 'info',
      message: `Starting batch ingestion for ${batchQueue.length} document(s)...`,
    });

    for (let i = 0; i < batchQueue.length; i++) {
      const item = batchQueue[i];
      if (item.status === 'success') continue;

      // Update status to uploading
      setBatchQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'uploading' } : it))
      );

      try {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('title', item.title);
        formData.append('documentType', item.documentType);
        formData.append('subject', item.subject);
        formData.append('year', item.year);
        formData.append('autoProcess', 'true');
        if (item.relatedDocId) {
          formData.append('relatedDocumentId', item.relatedDocId);
        }

        const uploadedDoc = await DocumentService.uploadDocumentViaApi(formData);

        // Update status to processing / completed
        setBatchQueue((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'success',
                  questionsImported:
                    (uploadedDoc.metadata as Record<string, unknown>)?.questions_imported !==
                    undefined
                      ? Number((uploadedDoc.metadata as Record<string, unknown>).questions_imported)
                      : undefined,
                }
              : it
          )
        );
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setBatchQueue((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'error', errorMessage: errorMsg } : it
          )
        );
      }
    }

    await refreshDocuments();
    setIsProcessingBatch(false);
    setNotification({
      type: 'success',
      message: 'Batch processing completed! Documents and questions added to database.',
    });
  };

  // Process an existing document on demand
  const handleProcessExisting = async (docId: string, title: string) => {
    setActiveProcessingId(docId);
    setNotification({
      type: 'info',
      message: `Extracting and processing questions for "${title}"...`,
    });

    try {
      const res = await DocumentService.triggerProcessing(docId);
      await refreshDocuments();
      setNotification({
        type: 'success',
        message: `Successfully processed "${title}"! Found ${res.questionsFound} questions (Imported: ${res.questionsInserted}).`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setNotification({
        type: 'error',
        message: `Failed to process "${title}": ${msg}`,
      });
    } finally {
      setActiveProcessingId(null);
    }
  };

  // Generate an official test from a processed document
  const handleGenerateTest = async (doc: DatabaseDocument) => {
    setTestGeneratingId(doc.id);
    try {
      const res = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${doc.title} • Official Test`,
          documentId: doc.id,
          testType: doc.document_type === 'previous_year' ? 'previous_year' : 'official',
          subject: doc.subject || 'All Subjects',
          durationMinutes: 150,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate test');

      setNotification({
        type: 'success',
        message: `Test generated successfully with ${data.result?.questionCount || 0} questions! Accessible under Tests section.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setNotification({
        type: 'error',
        message: `Test generation error: ${msg}`,
      });
    } finally {
      setTestGeneratingId(null);
    }
  };

  // Question papers available for linking answer keys
  const questionPapers = documents.filter((d) =>
    ['government_paper', 'previous_year', 'model_paper', 'question_bank'].includes(d.document_type)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Ingestion Console</span>
            </Badge>
            <Badge variant="neutral">Preloaded Knowledge Base</Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
            మెటీరియల్ నిర్వహణ (Admin Ingestion & Knowledge Base)
          </h2>
          <p className="text-sm text-brand-text-muted max-w-2xl leading-relaxed">
            Batch-upload official Special APTET question papers, previous years, answer keys, syllabi, and study notes. Material is parsed directly into the Question Bank and grounds the AI tutor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/questions">
            <Button variant="outline" size="sm" className="gap-2 font-semibold">
              <HelpCircle className="w-4 h-4 text-brand-primary" />
              <span>Question Bank</span>
            </Button>
          </Link>
          <Link href="/tests">
            <Button variant="outline" size="sm" className="gap-2 font-semibold">
              <BookOpen className="w-4 h-4 text-brand-accent" />
              <span>Tests Catalog</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : notification.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-amber-700 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-brand-text-muted hover:text-brand-text font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-primary shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-brand-text-muted font-medium uppercase tracking-wider">
                Total Materials
              </span>
              <p className="text-xl font-extrabold text-brand-text">{documents.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-brand-text-muted font-medium uppercase tracking-wider">
                Official Papers
              </span>
              <p className="text-xl font-extrabold text-amber-900">
                {documents.filter((d) => d.document_type === 'government_paper').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-brand-text-muted font-medium uppercase tracking-wider">
                Answer Keys
              </span>
              <p className="text-xl font-extrabold text-purple-900">
                {documents.filter((d) => d.document_type === 'answer_key').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-brand-text-muted font-medium uppercase tracking-wider">
                Syllabi & Notes
              </span>
              <p className="text-xl font-extrabold text-emerald-900">
                {
                  documents.filter((d) =>
                    ['syllabus', 'study_material'].includes(d.document_type)
                  ).length
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BATCH UPLOAD DROPZONE & CONFIGURATION */}
      <Card className="border-brand-border bg-brand-card shadow-xs">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border-light pb-4">
            <div>
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <FileUp className="w-5 h-5 text-brand-accent" />
                <span>Upload New PDFs (Single or Multiple)</span>
              </h3>
              <p className="text-xs text-brand-text-muted">
                Select one or multiple government papers, answer keys, or study PDFs to enqueue for automatic processing.
              </p>
            </div>

            {/* Quick Defaults */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={defaultType}
                onChange={(e) => setDefaultType(e.target.value as DocumentType)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text font-medium"
              >
                <option value="government_paper">★ Government Question Paper</option>
                <option value="previous_year">Previous Year Paper</option>
                <option value="model_paper">Model Paper</option>
                <option value="question_bank">Official Question Bank</option>
                <option value="answer_key">Official Answer Key</option>
                <option value="syllabus">Official Syllabus & Blueprint</option>
                <option value="study_material">Pedagogy Study Material</option>
              </select>

              <select
                value={defaultSubject}
                onChange={(e) => setDefaultSubject(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text font-medium"
              >
                <option value="Child Development & Pedagogy (Special Education)">Child Dev & Pedagogy</option>
                <option value="Language I (Telugu)">Language I (Telugu)</option>
                <option value="Language II (English)">Language II (English)</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Environmental Studies">Environmental Studies</option>
              </select>

              <select
                value={defaultYear}
                onChange={(e) => setDefaultYear(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text font-medium"
              >
                <option value="2024">2024 Exam</option>
                <option value="2023">2023 Exam</option>
                <option value="2022">2022 Exam</option>
                <option value="2018">2018 Exam</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop File Picker */}
          <div className="border-2 border-dashed border-brand-primary/30 rounded-2xl p-8 text-center hover:border-brand-primary/60 transition-colors bg-brand-bg-paper/50">
            <input
              type="file"
              id="admin-pdf-input"
              accept="application/pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="admin-pdf-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-primary-light flex items-center justify-center text-brand-primary shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-brand-text">
                  Click to select multiple PDF files, or drag and drop
                </p>
                <p className="text-xs text-brand-text-muted">
                  Supports APTET Question Papers, Key Series, Blueprints, and Textbooks (.pdf)
                </p>
              </div>
            </label>
          </div>

          {/* Batch Ingestion Queue Table */}
          {batchQueue.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-text uppercase tracking-wider">
                  Enqueued for Ingestion ({batchQueue.length} files)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBatchQueue([])}
                    disabled={isProcessingBatch}
                    className="text-xs"
                  >
                    Clear Queue
                  </Button>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    onClick={processBatchQueue}
                    disabled={isProcessingBatch}
                    className="gap-2 text-xs font-semibold"
                  >
                    {isProcessingBatch ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing Batch...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Batch Ingestion</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-brand-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-bg-paper text-brand-text-muted border-b border-brand-border">
                    <tr>
                      <th className="p-3 font-semibold">Document Title</th>
                      <th className="p-3 font-semibold">Type Category</th>
                      <th className="p-3 font-semibold">Subject / Target</th>
                      <th className="p-3 font-semibold">Answer Key Link</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border-light bg-brand-card">
                    {batchQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-brand-bg-paper/40">
                        {/* Title input */}
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.title}
                            disabled={isProcessingBatch}
                            onChange={(e) =>
                              setBatchQueue((prev) =>
                                prev.map((it) =>
                                  it.id === item.id ? { ...it, title: e.target.value } : it
                                )
                              )
                            }
                            className="w-full px-2 py-1 rounded-lg border border-brand-border bg-brand-bg-paper text-xs text-brand-text font-medium"
                          />
                          <span className="text-[10px] text-brand-text-subtle truncate block mt-0.5">
                            {item.file.name} ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </td>

                        {/* Category Selector */}
                        <td className="p-3">
                          <select
                            value={item.documentType}
                            disabled={isProcessingBatch}
                            onChange={(e) =>
                              setBatchQueue((prev) =>
                                prev.map((it) =>
                                  it.id === item.id
                                    ? { ...it, documentType: e.target.value as DocumentType }
                                    : it
                                )
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-brand-border bg-brand-bg-paper text-xs text-brand-text font-medium"
                          >
                            <option value="government_paper">★ Govt Paper</option>
                            <option value="previous_year">Previous Year</option>
                            <option value="model_paper">Model Paper</option>
                            <option value="question_bank">Question Bank</option>
                            <option value="answer_key">Answer Key</option>
                            <option value="syllabus">Syllabus</option>
                            <option value="study_material">Study Material</option>
                          </select>
                        </td>

                        {/* Subject */}
                        <td className="p-3">
                          <select
                            value={item.subject}
                            disabled={isProcessingBatch}
                            onChange={(e) =>
                              setBatchQueue((prev) =>
                                prev.map((it) =>
                                  it.id === item.id ? { ...it, subject: e.target.value } : it
                                )
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-brand-border bg-brand-bg-paper text-xs text-brand-text font-medium max-w-[150px] truncate"
                          >
                            <option value="Child Development & Pedagogy (Special Education)">
                              CDP Special
                            </option>
                            <option value="Language I (Telugu)">Telugu</option>
                            <option value="Language II (English)">English</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Environmental Studies">EVS</option>
                            <option value="All Subjects">All Subjects</option>
                          </select>
                        </td>

                        {/* Link Question Paper (if answer key) */}
                        <td className="p-3">
                          {item.documentType === 'answer_key' ? (
                            <select
                              value={item.relatedDocId || ''}
                              disabled={isProcessingBatch}
                              onChange={(e) =>
                                setBatchQueue((prev) =>
                                  prev.map((it) =>
                                    it.id === item.id
                                      ? { ...it, relatedDocId: e.target.value }
                                      : it
                                  )
                                )
                              }
                              className="px-2 py-1 rounded-lg border border-brand-border bg-brand-bg-paper text-[11px] text-brand-text max-w-[160px] truncate"
                            >
                              <option value="">Auto-match Question Paper</option>
                              {questionPapers.map((qp) => (
                                <option key={qp.id} value={qp.id}>
                                  {qp.title}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[11px] text-brand-text-subtle">N/A</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          {item.status === 'pending' && (
                            <Badge variant="neutral" size="sm">
                              Pending
                            </Badge>
                          )}
                          {item.status === 'uploading' && (
                            <Badge variant="accent" size="sm" className="gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Uploading</span>
                            </Badge>
                          )}
                          {item.status === 'success' && (
                            <Badge variant="success" size="sm" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ingested</span>
                            </Badge>
                          )}
                          {item.status === 'error' && (
                            <Badge variant="warning" size="sm" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Error</span>
                            </Badge>
                          )}
                        </td>

                        {/* Remove */}
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            disabled={isProcessingBatch}
                            onClick={() => removeQueueItem(item.id)}
                            className="text-brand-text-muted hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INGESTED MATERIALS REPOSITORY TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-primary" />
              <span>Ingested Backend Knowledge Base ({documents.length} Materials)</span>
            </h3>
            <p className="text-xs text-brand-secondary font-medium">
              ప్రభుత్వ ప్రశ్నాపత్రాలు, కీలు మరియు సిలబస్ డేటాబేస్
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDocuments}
            className="gap-2 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 bg-brand-card rounded-2xl border border-brand-border text-brand-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            <span>Loading preloaded knowledge repository...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brand-border bg-brand-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg-paper text-brand-text-muted border-b border-brand-border font-semibold">
                <tr>
                  <th className="p-3.5">Material Title & Provenance</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Ingestion Status</th>
                  <th className="p-3.5">Questions Extracted</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border-light">
                {documents.map((doc) => {
                  const isProcessingThis = activeProcessingId === doc.id;
                  const isGeneratingTest = testGeneratingId === doc.id;
                  const metadata = doc.metadata as Record<string, unknown> | null;
                  const isGov = doc.document_type === 'government_paper';

                  return (
                    <tr key={doc.id} className="hover:bg-brand-bg-paper/40">
                      {/* Title */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-brand-text text-sm">{doc.title}</div>
                        <div className="text-[11px] text-brand-text-subtle font-mono truncate">
                          {doc.file_name} • {doc.year || 'Curriculum'}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="p-3.5">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md capitalize ${
                            isGov
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : doc.document_type === 'answer_key'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-brand-primary-light text-brand-primary'
                          }`}
                        >
                          {doc.document_type.replace('_', ' ')}
                          {isGov && ' ★'}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="p-3.5 text-brand-text-muted font-medium">
                        {doc.subject || 'All Subjects'}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {doc.status === 'processed' ? (
                          <Badge variant="success" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Processed</span>
                          </Badge>
                        ) : isProcessingThis ? (
                          <Badge variant="accent" size="sm" className="gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing</span>
                          </Badge>
                        ) : doc.status === 'failed' ? (
                          <Badge variant="warning" size="sm" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            <span>Uploaded</span>
                          </Badge>
                        )}
                      </td>

                      {/* Questions Extracted */}
                      <td className="p-3.5">
                        {metadata?.questions_imported !== undefined ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {Number(metadata.questions_imported)} questions
                          </span>
                        ) : doc.document_type === 'answer_key' && metadata?.keys_parsed ? (
                          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            {Number(metadata.keys_parsed)} keys matched
                          </span>
                        ) : (
                          <span className="text-brand-text-subtle font-medium">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isProcessingThis}
                          onClick={() => handleProcessExisting(doc.id, doc.title)}
                          className="text-xs"
                        >
                          {isProcessingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          <span>{doc.status === 'processed' ? 'Reprocess' : 'Process'}</span>
                        </Button>

                        {/* Test Generator Trigger */}
                        {['government_paper', 'previous_year', 'model_paper'].includes(
                          doc.document_type
                        ) && (
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isGeneratingTest}
                            onClick={() => handleGenerateTest(doc)}
                            className="text-xs font-semibold gap-1.5"
                          >
                            {isGeneratingTest ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            <span>Create Test</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
