import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Feather, Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { triggerInkSplatter } from '../../lib/animeAnimations';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#141210] relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#784743]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md parchment-card p-6 sm:p-8 rounded-2xl relative z-10 border border-[#d3a66d]/30 bg-[#1a1614]/95 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#784743] to-[#401f1c] border border-[#d3a66d]/60 mb-4 shadow-lg">
            <Feather className="w-7 h-7 text-[#e8c18e]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#f0eae1]">
            Recover Secret Scroll
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#a39b8f] mt-1.5">
            Provide the address associated with your quill and we will send a restoration missive.
          </p>
        </div>

        {sent ? (
          <div className="text-center p-6 bg-[#1f281e]/60 border border-[#75816a]/50 rounded-xl space-y-4">
            <CheckCircle className="w-10 h-10 text-[#8e9c82] mx-auto" />
            <h3 className="font-serif text-base font-semibold text-[#f0eae1]">
              Missive Dispatched
            </h3>
            <p className="text-xs text-[#b8afa3] leading-relaxed">
              If a sanctuary account exists for <strong className="text-[#e8c18e]">{email}</strong>, a reset parchment has been sent. Follow its instructions to set a new passphrase.
            </p>
            <NavLink
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-serif text-[#d3a66d] hover:text-[#e8c18e] pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sanctuary Login
            </NavLink>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#d3a66d] mb-1.5"
              >
                Poet Address (Email)
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="poet@sanctuary.org"
                  required
                  className="w-full px-3.5 py-2.5 pl-10 rounded-lg bg-[#241e1a] border border-[#3e342b] text-[#f0eae1] placeholder-[#6e6559] text-sm focus:outline-none focus:border-[#d3a66d] focus:ring-1 focus:ring-[#d3a66d] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#8e8578] absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              onClick={e => triggerInkSplatter(e.clientX, e.clientY)}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#784743] to-[#5a2e2b] hover:from-[#8f5550] hover:to-[#6d3835] border border-[#d3a66d]/40 text-[#f0eae1] font-serif text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching Owl...</span>
              ) : (
                <>
                  <span>Dispatch Restoration Missive</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <NavLink
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#a39b8f] hover:text-[#e8c18e] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </NavLink>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
