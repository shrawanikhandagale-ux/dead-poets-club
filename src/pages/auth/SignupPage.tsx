import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { localService } from '../../lib/supabase';
import {
  Feather,
  Mail,
  User,
  Lock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertCircle,
  BookMarked,
} from 'lucide-react';
import { triggerInkSplatter } from '../../lib/animeAnimations';

const AVATAR_PRESETS = [
  { id: 'classic_scholar', name: 'Classic Scholar', desc: 'Tweed blazer, brass spectacles, inkwell' },
  { id: 'romantic_poet', name: 'Romantic Poet', desc: 'Linen collar, pocket notebook, dried petals' },
  { id: 'nocturnal_archivist', name: 'Nocturnal Archivist', desc: 'Dark wool vest, candle lantern, ancient folio' },
];

export const SignupPage: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('classic_scholar');

  // Debounced username check state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameMessage, setUsernameMessage] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced username verification
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setUsernameAvailable(null);
      setUsernameMessage('');
      return;
    }

    if (clean.length < 3) {
      setUsernameAvailable(false);
      setUsernameMessage('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameAvailable(false);
      setUsernameMessage('Use lowercase letters, numbers, and underscores only');
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const available = await localService.checkUsernameAvailable(clean);
        setUsernameAvailable(available);
        setUsernameMessage(
          available ? `@${clean} is free to claim` : `@${clean} is already inscribed by another poet`
        );
      } catch {
        setUsernameAvailable(true);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !displayName.trim()) {
      setError('Please fill in all required scrolls.');
      return;
    }

    if (usernameAvailable === false) {
      setError(usernameMessage || 'Please choose an available username.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await signup(email, username, displayName);
      navigate('/clubhouse');
    } catch (err: any) {
      setError(err?.message || 'Initiation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#141210] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#784743]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#75816a]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg parchment-card p-6 sm:p-8 rounded-2xl relative z-10 border border-[#d3a66d]/30 bg-[#1a1614]/95 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <NavLink
            to="/"
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#784743] to-[#401f1c] border border-[#d3a66d]/60 mb-3 shadow-lg group hover:border-[#d3a66d] transition-all"
          >
            <Feather className="w-7 h-7 text-[#e8c18e] group-hover:rotate-12 transition-transform duration-300" />
          </NavLink>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f0eae1] tracking-tight">
            Claim Your Quill
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#a39b8f] mt-1">
            Initiate your membership into the Dead Poets Club.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#784743]/25 border border-[#784743]/50 flex items-start gap-3 text-xs text-[#f2b8b5]">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#e8a8a4]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block font-mono text-[11px] uppercase tracking-wider text-[#d3a66d] mb-1"
            >
              Pen Name / Display Name
            </label>
            <div className="relative">
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Lord Byron's Raven"
                required
                className="w-full px-3.5 py-2.5 pl-10 rounded-lg bg-[#241e1a] border border-[#3e342b] text-[#f0eae1] placeholder-[#6e6559] text-sm focus:outline-none focus:border-[#d3a66d] focus:ring-1 focus:ring-[#d3a66d] transition-colors"
              />
              <User className="w-4 h-4 text-[#8e8578] absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Unique Username with live verification */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="username"
                className="block font-mono text-[11px] uppercase tracking-wider text-[#d3a66d]"
              >
                Poet Handle (@username)
              </label>
              {isCheckingUsername && (
                <span className="text-[10px] font-mono text-[#a39b8f]">Checking archives...</span>
              )}
            </div>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. keats_apprentice"
                required
                className={`w-full px-3.5 py-2.5 pl-10 pr-10 rounded-lg bg-[#241e1a] border text-[#f0eae1] placeholder-[#6e6559] text-sm focus:outline-none transition-colors ${
                  usernameAvailable === true
                    ? 'border-[#75816a] focus:ring-1 focus:ring-[#75816a]'
                    : usernameAvailable === false
                    ? 'border-[#784743] focus:ring-1 focus:ring-[#784743]'
                    : 'border-[#3e342b] focus:border-[#d3a66d]'
                }`}
              />
              <span className="text-[#8e8578] font-mono absolute left-3.5 top-2.5 text-sm">@</span>
              <div className="absolute right-3.5 top-2.5">
                {usernameAvailable === true && (
                  <CheckCircle className="w-5 h-5 text-[#8e9c82]" />
                )}
                {usernameAvailable === false && (
                  <XCircle className="w-5 h-5 text-[#c47c77]" />
                )}
              </div>
            </div>
            {usernameMessage && (
              <p
                className={`text-[11px] mt-1 font-mono ${
                  usernameAvailable ? 'text-[#8e9c82]' : 'text-[#c47c77]'
                }`}
              >
                {usernameMessage}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block font-mono text-[11px] uppercase tracking-wider text-[#d3a66d] mb-1"
            >
              Sanctuary Missive Address (Email)
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="poet@sanctuary.org"
                required
                className="w-full px-3.5 py-2.5 pl-10 rounded-lg bg-[#241e1a] border border-[#3e342b] text-[#f0eae1] placeholder-[#6e6559] text-sm focus:outline-none focus:border-[#d3a66d] focus:ring-1 focus:ring-[#d3a66d] transition-colors"
              />
              <Mail className="w-4 h-4 text-[#8e8578] absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Passphrase */}
          <div>
            <label
              htmlFor="password"
              className="block font-mono text-[11px] uppercase tracking-wider text-[#d3a66d] mb-1"
            >
              Secret Passphrase
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 pl-10 rounded-lg bg-[#241e1a] border border-[#3e342b] text-[#f0eae1] placeholder-[#6e6559] text-sm focus:outline-none focus:border-[#d3a66d] focus:ring-1 focus:ring-[#d3a66d] transition-colors"
              />
              <Lock className="w-4 h-4 text-[#8e8578] absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Choose Archetype */}
          <div className="pt-2">
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#d3a66d] mb-2">
              Choose Initial Persona Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {AVATAR_PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setSelectedAvatar(preset.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedAvatar === preset.id
                      ? 'border-[#d3a66d] bg-[#784743]/20 shadow-md'
                      : 'border-[#382f28] bg-[#221c19] hover:border-[#d3a66d]/40'
                  }`}
                >
                  <p className="font-serif text-xs font-semibold text-[#f0eae1]">{preset.name}</p>
                  <p className="text-[10px] text-[#8e8578] mt-0.5 leading-tight">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            onClick={e => triggerInkSplatter(e.clientX, e.clientY)}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#784743] to-[#5a2e2b] hover:from-[#8f5550] hover:to-[#6d3835] border border-[#d3a66d]/40 text-[#f0eae1] font-serif text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-4 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Inscribing Registry...</span>
            ) : (
              <>
                <span>Inscribe My Name</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#a39b8f]">
          <span>Already initiated? </span>
          <NavLink
            to="/login"
            className="text-[#e8c18e] font-medium hover:underline decoration-[#d3a66d]"
          >
            Enter Sanctuary
          </NavLink>
        </div>
      </div>
    </div>
  );
};
