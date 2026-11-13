import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { localService } from '../../lib/supabase';
import { Feather, Lock, Mail, ArrowRight, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { triggerInkSplatter } from '../../lib/animeAnimations';

export const LoginPage: React.FC = () => {
  const { login, resendConfirmationEmail, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnconfirmedEmail, setIsUnconfirmedEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or poet username.');
      return;
    }

    setError(null);
    setIsUnconfirmedEmail(false);
    setResendStatus(null);
    setIsSubmitting(true);
    try {
      const res = await login(identifier, password);
      const targetId = res?.user?.id || identifier;
      const p = await localService.getProfile(targetId);
      if (p && p.avatar_config && p.avatar_config.configured === false) {
        navigate('/character-creator?onboarding=true');
      } else {
        navigate(returnTo);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to authenticate. Please verify your credentials.';
      const unconfirmed = /email not confirmed|email_not_confirmed/i.test(msg);
      if (unconfirmed) {
        setIsUnconfirmedEmail(true);
        setError('Your missive address has not yet been verified. Please inspect your inbox or resend the verification scroll.');
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!identifier.trim()) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      await resendConfirmationEmail(identifier.trim());
      setResendStatus('A fresh verification seal has been dispatched to your email.');
    } catch (err: any) {
      setResendStatus(err?.message || 'Failed to dispatch verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login('keats_apprentice');
      navigate(returnTo);
    } catch (err: any) {
      setError(err?.message || 'Failed to log in as demo scholar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isResetSuccess = searchParams.get('reset') === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#141210] relative overflow-hidden">
      {/* Subtle atmospheric background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#784743]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#d3a66d]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md parchment-card p-6 sm:p-8 rounded-2xl relative z-10 border border-[#d3a66d]/30 bg-[#1a1614]/95 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <NavLink
            to="/"
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#784743] to-[#401f1c] border border-[#d3a66d]/60 mb-4 shadow-lg group hover:border-[#d3a66d] transition-all"
          >
            <Feather className="w-7 h-7 text-[#e8c18e] group-hover:rotate-12 transition-transform duration-300" />
          </NavLink>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#f0eae1] tracking-tight">
            Welcome Back, Poet
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#a39b8f] mt-1.5">
            Step back into your quiet literary sanctuary.
          </p>
        </div>

        {/* Password reset notice */}
        {isResetSuccess && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#75816a]/25 border border-[#75816a]/50 flex items-start gap-3 text-xs text-[#d1e0d4]">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#8e9c82]" />
            <span>Passphrase restoration link processed. Please authenticate with your credentials.</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#784743]/25 border border-[#784743]/50 text-xs text-[#f2b8b5] space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#e8a8a4]" />
              <span>{error}</span>
            </div>
            {isUnconfirmedEmail && (
              <div className="pt-2 border-t border-[#784743]/40 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  className="text-left font-sans text-xs text-[#e8c18e] hover:underline cursor-pointer disabled:opacity-50"
                >
                  {isResending ? 'Dispatching scroll...' : 'Resend verification email to this address →'}
                </button>
                {resendStatus && (
                  <p className="text-[11px] font-mono text-[#d1e0d4]">{resendStatus}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="identifier"
              className="block font-sans text-xs font-medium text-[#d3a66d] mb-1.5"
            >
              Sanctuary Missive Address (Email)
            </label>
            <div className="relative">
              <input
                id="identifier"
                type="email"
                autoComplete="email"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="poet@sanctuary.org"
                required
                className="w-full px-3.5 py-2.5 pl-10 rounded-lg bg-[#241e1a] border border-[#3e342b] text-[#f0eae1] placeholder-[#6e6559] font-sans text-sm focus:outline-none focus:border-[#d3a66d] focus:ring-1 focus:ring-[#d3a66d] transition-colors"
              />
              <Mail className="w-4 h-4 text-[#8e8578] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block font-sans text-xs font-medium text-[#d3a66d]"
              >
                Passphrase
              </label>
              <NavLink
                to="/forgot-password"
                className="text-xs font-sans text-[#a39b8f] hover:text-[#e8c18e] transition-colors"
              >
                Forgot secret?
              </NavLink>
            </div>
            <div className="relative">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pl-10 rounded-lg bg-[#241e1a] border border-[#3e342b] text-[#f0eae1] placeholder-[#6e6559] font-sans text-sm focus:outline-none focus:border-[#d3a66d] focus:ring-1 focus:ring-[#d3a66d] transition-colors"
              />
              <Lock className="w-4 h-4 text-[#8e8578] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            onClick={e => triggerInkSplatter(e.clientX, e.clientY)}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#784743] to-[#5a2e2b] hover:from-[#8f5550] hover:to-[#6d3835] border border-[#d3a66d]/40 text-[#f0eae1] font-sans text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-[#784743]/30 transition-all cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Consulting the Registers...</span>
            ) : (
              <>
                <span>Enter The Atrium</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Button */}
        <div className="mt-6 pt-5 border-t border-[#d3a66d]/15">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting || isLoading}
            className="w-full py-2.5 px-3 rounded-lg bg-[#241e1b] hover:bg-[#2e2622] border border-[#d3a66d]/30 text-xs font-mono text-[#e8c18e] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d3a66d]" />
            <span>Instant Demo: Enter as @keats_apprentice</span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-[#a39b8f]">
          <span>Not yet initiated into the club? </span>
          <NavLink
            to="/signup"
            className="text-[#e8c18e] font-medium hover:underline decoration-[#d3a66d]"
          >
            Join the Sanctuary
          </NavLink>
        </div>
      </div>
    </div>
  );
};
