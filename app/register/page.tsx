'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { validateIndianMobile } from '@/lib/auth/authUtils';
import { APP_CONFIG } from '@/lib/constants/theme';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const { register } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(validation.cleanMobile, password);
      if (res.success) {
        // Successful registration, navigate to return URL or home
        router.push(returnUrl);
      } else {
        setError(res.error || 'Unable to create your account. Please try again.');
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

      {/* Registration Card */}
      <div className="bg-white rounded-3xl p-7 sm:p-9 border border-brand-border shadow-xs space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">
            Create your TET Assist account
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed font-telugu">
            మీ TET Assist ఖాతాను సృష్టించండి • Start practicing mock tests
          </p>
        </div>

        {/* Error Notice Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mobile Number Field with +91 Prefix */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
              Mobile Number (మొబైల్ నంబర్)
            </label>
            <div className="relative flex rounded-xl border border-brand-border bg-brand-bg-paper focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
              <span className="inline-flex items-center px-3.5 py-3 rounded-l-xl bg-stone-100/80 text-brand-text font-bold text-sm border-r border-brand-border-light select-none">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  setMobile(cleaned);
                  if (error) setError(null);
                }}
                placeholder="Enter mobile number"
                className="w-full px-3.5 py-3 rounded-r-xl bg-transparent text-base sm:text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-brand-text-subtle">
              Valid 10-digit Indian mobile number
            </p>
          </div>

          {/* Create Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
              Password (పాస్‌వర్డ్)
            </label>
            <div className="relative rounded-xl border border-brand-border bg-brand-bg-paper focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Create Password"
                className="w-full px-4 py-3 rounded-xl bg-transparent text-base sm:text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-brand-text-subtle">
              Must contain at least 6 characters
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
              Confirm Password (పాస్‌వర్డ్ నిర్ధారించండి)
            </label>
            <div className="relative rounded-xl border border-brand-border bg-brand-bg-paper focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-xl bg-transparent text-base sm:text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none"
              />
            </div>
          </div>

          {/* Large Create Account Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-base shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="font-telugu font-normal text-xs text-white/80">
                  (ఖాతా సృష్టించండి)
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer: Login Link */}
        <div className="pt-4 border-t border-brand-border-light text-center space-y-2">
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Already have an account? (ఇప్పటికే ఖాతా ఉందా?)
          </p>
          <Link
            href={`/login${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-brand-primary-hover hover:underline transition-colors cursor-pointer"
          >
            <span>Login to your account</span>
            <span className="font-telugu font-normal text-xs text-brand-secondary">
              (లాగిన్ అవ్వండి)
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
