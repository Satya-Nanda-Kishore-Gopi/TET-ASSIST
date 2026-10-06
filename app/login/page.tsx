'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Lock, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { validateIndianMobile } from '@/lib/auth/authUtils';
import { APP_CONFIG } from '@/lib/constants/theme';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const { login } = useAuth();
  const [mobile, setMobile] = useState('1234567890');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateIndianMobile(mobile);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(validation.cleanMobile, password);
      if (res.success) {
        // Successful login, navigate to return URL or home
        router.push(returnUrl);
      } else {
        setError(res.error || 'Mobile number or password is incorrect.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <GraduationCap className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-2xl font-extrabold text-brand-text tracking-tight">
            {APP_CONFIG.name}
          </span>
        </Link>
        <p className="text-xs text-brand-secondary font-medium font-telugu">
          మీ Special APTET preparation companion
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-brand-border shadow-xs space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span>✨ Open Access Mode • అందరికీ ఉచిత ప్రవేశం</span>
          </div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
            <span>Welcome to TET Assist</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-brand-text-muted leading-relaxed font-telugu">
            TET Assist లో అన్ని మాక్ టెస్టులు, ప్రశ్నలు మరియు AI సహాయం ఉచితంగా అందరికీ అందుబాటులో ఉన్నాయి. Login అవసరం లేదు.
          </p>
          <p className="text-xs text-brand-text-subtle font-medium">
            Authentication is temporarily disabled. All mock tests and study materials are freely accessible without login.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/tests"
            className="w-full min-h-[48px] rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-base shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
          >
            <span>Start Practice Tests</span>
            <span className="font-telugu font-normal text-xs text-white/80">
              (మాక్ టెస్టులు ప్రారంభించండి)
            </span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="pt-4 border-t border-brand-border-light flex flex-col gap-2 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-brand-secondary hover:text-brand-primary hover:underline transition-colors"
          >
            ← Back to Home (హోమ్‌కి వెళ్లండి)
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
