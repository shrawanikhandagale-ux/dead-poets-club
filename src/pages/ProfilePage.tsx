import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Bookmark,
  Award,
  Sparkles,
  Shield,
  Edit3,
  Check,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user, profile, updateProfile, shelves } = useAuth();

  const isOwner = user?.username === username;
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [readingGoal, setReadingGoal] = useState(profile?.reading_goal || 12);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        bio,
        reading_goal: Number(readingGoal),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const readCount = shelves.filter(s => s.status === 'read').length;
  const currentlyReadingCount = shelves.filter(s => s.status === 'currently_reading').length;
  const wantToReadCount = shelves.filter(s => s.status === 'want_to_read').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Banner & Header */}
      <div className="parchment-card p-6 sm:p-8 rounded-2xl bg-[#1a1614] border border-[#d3a66d]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#d3a66d]/20">
          <div className="flex items-center gap-4">
            {/* Avatar Badge */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#784743] to-[#3a1b18] border-2 border-[#d3a66d]/60 flex items-center justify-center font-serif text-2xl font-bold text-[#e8c18e] shadow-xl">
              {(profile?.display_name || username || 'P').substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f0eae1]">
                  {profile?.display_name || username}
                </h1>
                <span className="text-xs font-mono text-[#8e9c82] bg-[#75816a]/20 border border-[#75816a]/40 px-2 py-0.5 rounded-full">
                  Poet Member
                </span>
              </div>
              <p className="font-mono text-xs text-[#d3a66d] mt-0.5">@{username}</p>
            </div>
          </div>

          {isOwner && !isEditing && (
            <button
              onClick={() => {
                setDisplayName(profile?.display_name || '');
                setBio(profile?.bio || '');
                setReadingGoal(profile?.reading_goal || 12);
                setIsEditing(true);
              }}
              className="btn-secondary text-xs py-2 px-3.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Quill & Bio
            </button>
          )}
        </div>

        {/* Bio or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#d3a66d] mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#241e1a] border border-[#3e342b] text-sm text-[#f0eae1] focus:outline-none focus:border-[#d3a66d]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#d3a66d] mb-1">
                Bio & Marginalia
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-lg bg-[#241e1a] border border-[#3e342b] text-sm text-[#f0eae1] focus:outline-none focus:border-[#d3a66d]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#d3a66d] mb-1">
                Annual Reading Goal (Books)
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={readingGoal}
                onChange={e => setReadingGoal(Number(e.target.value))}
                className="w-32 px-3.5 py-2 rounded-lg bg-[#241e1a] border border-[#3e342b] text-sm text-[#f0eae1] focus:outline-none focus:border-[#d3a66d]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary text-xs py-2 px-4"
              >
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#d3a66d] mb-1">
              Member Bio
            </h4>
            <p className="font-serif text-sm sm:text-base text-[#d8cfc4] leading-relaxed max-w-2xl">
              {profile?.bio || 'This poet prefers to let their reading speak for itself.'}
            </p>
          </div>
        )}
      </div>

      {/* Reading Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="parchment-card p-5 rounded-xl bg-[#1a1614] border border-[#d3a66d]/30">
          <span className="text-xs font-mono text-[#a39b8f] uppercase">Currently Reading</span>
          <p className="font-serif text-3xl font-bold text-[#e8c18e] mt-1">
            {currentlyReadingCount}
          </p>
          <span className="text-[11px] text-[#8e8578]">Active on desk</span>
        </div>

        <div className="parchment-card p-5 rounded-xl bg-[#1a1614] border border-[#d3a66d]/30">
          <span className="text-xs font-mono text-[#a39b8f] uppercase">Books Finished</span>
          <p className="font-serif text-3xl font-bold text-[#8e9c82] mt-1">{readCount}</p>
          <span className="text-[11px] text-[#8e8578]">Conquered tomes</span>
        </div>

        <div className="parchment-card p-5 rounded-xl bg-[#1a1614] border border-[#d3a66d]/30">
          <span className="text-xs font-mono text-[#a39b8f] uppercase">Want to Read</span>
          <p className="font-serif text-3xl font-bold text-[#f2b8b5] mt-1">{wantToReadCount}</p>
          <span className="text-[11px] text-[#8e8578]">Waiting in queue</span>
        </div>
      </div>
    </div>
  );
};
