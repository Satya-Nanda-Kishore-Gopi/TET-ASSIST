'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { DocumentService } from '@/lib/services/documents';
import { isSupabaseConfigured } from '@/lib/supabase';
import { DatabaseDocument, DocumentType } from '@/lib/supabase/types';
import {
  Files,
  Upload,
  BookOpen,
  AlertCircle,
  FileCheck2,
  Database,
  Loader2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  FileUp,
} from 'lucide-react';

export function DocumentsView() {
  const [notification, setNotification] = useState<{
    type: 'info' | 'success' | 'error';
    message: string;
  } | null>(null);
  const [documents, setDocuments] = useState<DatabaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const isConnected = isSupabaseConfigured();

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<DocumentType>('government_paper');
  const [uploadSubject, setUploadSubject] = useState(
    'Child Development & Pedagogy (Special Education)'
  );
  const [uploadYear, setUploadYear] = useState('2024');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [autoProcess, setAutoProcess] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [refreshCount, setRefreshCount] = useState(0);

  const refreshDocuments = () => {
    setRefreshCount((c) => c + 1);
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchDocs() {
      try {
        const data = await DocumentService.getDocuments({ exam: 'special_aptet' });
        if (isMounted) setDocuments(data);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchDocs();
    return () => {
      isMounted = false;
    };
  }, [refreshCount]);

  // Separate preloaded/official material from user uploaded PDFs
  const officialMaterials = documents.filter((doc) => doc.document_type !== 'user_pdf');
  const userDocuments = documents.filter((doc) => doc.document_type === 'user_pdf');

  // Trigger processing for a document
  const handleProcessDocument = async (docId: string, docTitle: string) => {
    setProcessingId(docId);
    setNotification({
      type: 'info',
      message: `Processing "${docTitle}"... Extracting text and parsing MCQs.`,
    });

    try {
      const result = await DocumentService.triggerProcessing(docId);
      refreshDocuments();

      setNotification({
        type: 'success',
        message: `Successfully processed "${docTitle}"! Found ${result.questionsFound} questions (Imported: ${result.questionsInserted}, Skipped: ${result.questionsSkipped}).`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      refreshDocuments();
      setNotification({
        type: 'error',
        message: `Processing failed for "${docTitle}": ${errorMsg}`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Form Submission for Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile) {
      setNotification({
        type: 'error',
        message: 'Please select a valid PDF file.',
      });
      return;
    }

    if (!uploadTitle.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide a document title.',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('documentType', uploadType);
      formData.append('subject', uploadSubject);
      formData.append('year', uploadYear);
      formData.append('autoProcess', autoProcess ? 'true' : 'false');

      const createdDoc = await DocumentService.uploadDocumentViaApi(formData);

      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadFile(null);

      refreshDocuments();

      setNotification({
        type: 'success',
        message: `"${createdDoc.title}" uploaded successfully! ${
          autoProcess ? 'Text extraction and question parsing completed.' : 'Ready for processing.'
        }`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setNotification({
        type: 'error',
        message: `Upload error: ${errorMsg}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Study Vault</Badge>
            <Badge variant="neutral">PDF Question Extraction</Badge>
            {isConnected ? (
              <Badge variant="accent" size="sm" className="gap-1">
                <Database className="w-3 h-3" />
                <span>Supabase Live</span>
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" className="gap-1">
                <Database className="w-3 h-3" />
                <span>Supabase Ready</span>
              </Badge>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
            డాక్యుమెంట్లు (My Documents)
          </h2>
          <p className="text-sm text-brand-text-muted max-w-2xl leading-relaxed">
            Manage Special APTET question papers, government blueprints, and study notes. Extract questions directly into the Question Bank.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/questions">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="gap-2 shadow-xs font-semibold"
            >
              <HelpCircle className="w-4 h-4 text-brand-primary" />
              <span>View Question Bank</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="accent"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
            className="gap-2 shadow-xs shrink-0 font-semibold"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </Button>
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
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
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

      {/* SECTION 1: TET Assist Official Material */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-primary" />
              <span>TET Assist Material (Official & Curated)</span>
            </h3>
            <p className="text-xs text-brand-secondary font-medium">
              అధికారిక ప్రశ్నాపత్రాలు మరియు ప్రమాణీకరించిన స్టడీ మెటీరియల్
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-primary-light text-brand-primary">
            {officialMaterials.length} Documents
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 bg-brand-card rounded-2xl border border-brand-border text-brand-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            <span className="text-sm">డాక్యుమెంట్లు లోడ్ అవుతున్నాయి... (Loading documents...)</span>
          </div>
        ) : officialMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialMaterials.map((doc) => {
              const isProcessingThis = processingId === doc.id;
              const isGovernment = doc.document_type === 'government_paper';
              const metadata = doc.metadata as Record<string, unknown> | null;

              return (
                <Card
                  key={doc.id}
                  className={`border transition-all flex flex-col justify-between ${
                    isGovernment
                      ? 'border-brand-primary/40 bg-brand-card hover:border-brand-primary shadow-xs'
                      : 'border-brand-border bg-brand-card hover:border-brand-secondary/40'
                  }`}
                >
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md capitalize ${
                            isGovernment
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : doc.document_type === 'answer_key'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-brand-primary-light text-brand-primary'
                          }`}
                        >
                          {doc.document_type.replace('_', ' ')}
                          {isGovernment && ' ★ Official'}
                        </span>

                        {/* Status Badge */}
                        {doc.status === 'processed' ? (
                          <Badge variant="success" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Processed</span>
                          </Badge>
                        ) : doc.status === 'processing' || isProcessingThis ? (
                          <Badge variant="accent" size="sm" className="gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing...</span>
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
                      </div>

                      <h4 className="font-bold text-base text-brand-text leading-snug">
                        {doc.title}
                      </h4>

                      {doc.description && (
                        <p className="text-xs text-brand-text-muted mt-2 line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                      )}

                      {/* Extracted Questions Metrics (if processed) */}
                      {metadata?.questions_imported !== undefined && (
                        <div className="mt-3 p-2 rounded-xl bg-brand-bg-paper border border-brand-border-light text-[11px] text-brand-text space-y-1">
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-brand-text-muted">Questions Extracted:</span>
                            <span className="font-bold text-brand-primary">
                              {Number(metadata.questions_found || 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-brand-text-muted">Imported to Bank:</span>
                            <span className="font-bold text-emerald-700">
                              {Number(metadata.questions_imported || 0)} questions
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Process Action */}
                    <div className="pt-3 border-t border-brand-border-light space-y-3">
                      <div className="flex items-center justify-between text-xs text-brand-text-muted font-medium">
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <FileCheck2 className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                          <span className="truncate">{doc.subject || 'Special APTET'}</span>
                        </div>
                        <span className="text-[11px] text-brand-text-subtle shrink-0">
                          {doc.year ? `${doc.year} Paper` : 'Curriculum'}
                        </span>
                      </div>

                      {/* Processing Button */}
                      <Button
                        type="button"
                        variant={doc.status === 'processed' ? 'outline' : 'primary'}
                        size="sm"
                        disabled={isProcessingThis}
                        onClick={() => handleProcessDocument(doc.id, doc.title)}
                        className="w-full gap-2 text-xs font-semibold"
                      >
                        {isProcessingThis ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Extracting Questions...</span>
                          </>
                        ) : doc.status === 'processed' ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reprocess PDF</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Process & Extract Questions</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-brand-border bg-brand-card">
            <CardContent className="p-8">
              <EmptyState
                icon={BookOpen}
                title="No official documents cataloged yet."
                titleTelugu="అధికారిక డాక్యుమెంట్లు ఏవీ అందుబాటులో లేవు."
                description="Preloaded official question papers and blueprints will appear here."
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* SECTION 2: My Documents (User Uploads) */}
      <div className="space-y-4 pt-4 border-t border-brand-border">
        <div>
          <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
            <Files className="w-5 h-5 text-brand-accent" />
            <span>My Documents (Uploaded Notes & Books)</span>
          </h3>
          <p className="text-xs text-brand-secondary font-medium">
            మీరు అప్‌లోడ్ చేసిన నోట్స్ మరియు పుస్తకాలు
          </p>
        </div>

        {userDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userDocuments.map((doc) => (
              <Card key={doc.id} className="border-brand-border bg-brand-card">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-accent bg-brand-accent-light px-2.5 py-0.5 rounded-md">
                      User PDF
                    </span>
                    <Badge variant={doc.status === 'processed' ? 'success' : 'neutral'} size="sm">
                      {doc.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-base text-brand-text">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-brand-text-muted truncate">
                    {doc.file_name}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={processingId === doc.id}
                    onClick={() => handleProcessDocument(doc.id, doc.title)}
                    className="w-full gap-2 text-xs font-semibold mt-2"
                  >
                    {processingId === doc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>{doc.status === 'processed' ? 'Reprocess' : 'Process'}</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-brand-border bg-brand-card">
            <CardContent className="p-8 sm:p-12">
              <EmptyState
                icon={Files}
                title="No personal documents uploaded yet."
                titleTelugu="ఇంకా ఏ డాక్యుమెంట్లు అప్‌లోడ్ చేయలేదు."
                description="Upload coaching materials, state board textbook chapters, or question sets in PDF format to extract questions into the Question Bank."
                descriptionTelugu="మీ పిడిఎఫ్ నోట్స్‌ను అప్‌లోడ్ చేసి అందులోని ప్రశ్నలను ప్రశ్నల నిధిలోకి చేర్చండి."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4 text-brand-accent" />
                    <span>Upload Your First PDF</span>
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* UPLOAD PDF MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-brand-card border border-brand-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border-light">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-primary">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-brand-text">Upload PDF Document</h3>
                  <p className="text-xs text-brand-text-muted">పిడిఎఫ్ డాక్యుమెంట్‌ను అప్‌లోడ్ చేయండి</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-brand-text-muted hover:text-brand-text p-1.5 rounded-lg hover:bg-brand-bg-paper"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Document Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-text">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special APTET 2024 Paper I Government Paper"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              {/* Document Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-text">
                  Document Type (రకం) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as DocumentType)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
                >
                  <option value="government_paper">
                    ★ Government Question Paper (అధికారిక ప్రశ్నాపత్రం)
                  </option>
                  <option value="previous_year">Previous Year Paper (గత సంవత్సర పేపర్)</option>
                  <option value="model_paper">Model Paper (మోడల్ పేపర్)</option>
                  <option value="study_material">Study Material (స్టడీ మెటీరియల్)</option>
                  <option value="answer_key">Answer Key (సమాధానాల కీ)</option>
                  <option value="user_pdf">User Notes / Coaching PDF (వ్యక్తిగత పిడిఎఫ్)</option>
                </select>
                {uploadType === 'government_paper' && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg">
                    Official papers will be prioritized in the question bank and marked as verified source material.
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-text">Subject (విషయం)</label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
                >
                  <option value="Child Development & Pedagogy (Special Education)">
                    Child Development & Pedagogy (Special Education)
                  </option>
                  <option value="Language I (Telugu)">Language I (Telugu)</option>
                  <option value="Language II (English)">Language II (English)</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Environmental Studies">Environmental Studies</option>
                  <option value="All Subjects">All Subjects (Full Question Paper)</option>
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-text">Exam Year (సంవత్సరం)</label>
                <input
                  type="number"
                  min="2010"
                  max="2030"
                  value={uploadYear}
                  onChange={(e) => setUploadYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border bg-brand-bg-paper text-brand-text focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>

              {/* File Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-text">
                  Select PDF File <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFile(file);
                      if (!uploadTitle) {
                        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                      }
                    }
                  }}
                  className="w-full text-xs text-brand-text file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-primary-hover cursor-pointer"
                />
              </div>

              {/* Auto Process Checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-brand-text font-medium pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoProcess}
                  onChange={(e) => setAutoProcess(e.target.checked)}
                  className="rounded text-brand-primary focus:ring-brand-primary/30 w-4 h-4"
                />
                <span>Extract questions into Question Bank immediately upon upload</span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border-light">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  disabled={isUploading}
                  className="gap-2 font-semibold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading & Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Document</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
