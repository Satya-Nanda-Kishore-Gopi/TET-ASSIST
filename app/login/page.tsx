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
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
            <span>Welcome back</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-brand-text-muted leading-relaxed font-telugu">
            మీ TET preparation కొనసాగించడానికి login చేయండి.
          </p>
          <p className="text-xs text-brand-text-subtle font-medium">
            &ldquo;Login to continue your APTET preparation.&rdquo;
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
                placeholder="Enter 10-digit mobile number"
                className="w-full px-3.5 py-3 rounded-r-xl bg-transparent text-base sm:text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-brand-text-subtle">
              Enter your 10-digit Indian mobile number
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
              Password (పాస్‌వర్డ్)
            </label>
            <div className="relative rounded-xl border border-brand-border bg-brand-bg-paper focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl bg-transparent text-base sm:text-sm text-brand-text placeholder:text-brand-text-subtle focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-brand-text-subtle">
              Minimum 6 characters
            </p>
          </div>

          {/* Large Login Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-base shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <span className="font-telugu font-normal text-xs text-white/80">
                  (లాగిన్)
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer: Create Account Link */}
        <div className="pt-4 border-t border-brand-border-light text-center space-y-2">
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Don&apos;t have an account? (ఇంకా ఖాతా లేదా?)
          </p>
          <Link
            href={`/register${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-brand-primary-hover hover:underline transition-colors cursor-pointer"
          >
            <span>Create Account</span>
            <span className="font-telugu font-normal text-xs text-brand-secondary">
              (ఖాతా సృష్టించండి)
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
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
