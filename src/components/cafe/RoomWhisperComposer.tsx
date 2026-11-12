import React, { useEffect, useState } from 'react';
import { Flag, MessageSquare, Shield, Sparkles, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import {
  CafeRoomDefinition,
  ROOM_WHISPER_MAX_LENGTH,
  RoomWhisper,
  WhisperExpiryOption,
} from './cafeTypes';
import { PixelSpeechBubble } from './PixelSpeechBubble';
import { useTypewriterSound } from '../../hooks/useTypewriterSound';

interface RoomWhisperComposerProps {
  room: CafeRoomDefinition;
  userHandle: string;
  activeWhisper: RoomWhisper | null;
  roomResidentsWhispers: RoomWhisper[];
  mutedAuthorIds: string[];
  reportedWhisperIds: string[];
  quietMode: boolean;
  onPublishWhisper: (text: string, expiryOption: WhisperExpiryOption) => void;
  onClearWhisper: () => void;
  onToggleMuteAuthor: (authorId: string) => void;
  onReportWhisper: (whisperId: string, authorName: string) => void;
  onClose: () => void;
}

const EXPIRY_OPTIONS: { value: WhisperExpiryOption; label: string }[] = [
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: 'session', label: 'Until leave' },
];

const formatRemaining = (expiresAt: number | null): string => {
  if (!expiresAt) return 'Active while in room';
  const diffMs = Math.max(0, expiresAt - Date.now());
  const mins = Math.ceil(diffMs / 60000);
  if (mins <= 1) return '<1 min left';
  return `${mins} min left`;
};

/**
 * RoomWhisperComposer
 * Single-whisper room status drawer. Publishes one floating pixel bubble above
 * the reader's character strictly within the occupied Cafeteria room.
 */
export const RoomWhisperComposer: React.FC<RoomWhisperComposerProps> = ({
  room,
  userHandle,
  activeWhisper,
  roomResidentsWhispers,
  mutedAuthorIds,
  reportedWhisperIds,
  quietMode,
  onPublishWhisper,
  onClearWhisper,
  onToggleMuteAuthor,
  onReportWhisper,
  onClose,
}) => {
  const [draft, setDraft] = useState(activeWhisper?.text ?? '');
  const [expiryOption, setExpiryOption] = useState<WhisperExpiryOption>(
    activeWhisper?.expiryOption ?? '30m'
  );
  const [reportBanner, setReportBanner] = useState<string | null>(null);
  const typewriter = useTypewriterSound();

  // Sync draft when user switches rooms or clears their active whisper externally
  useEffect(() => {
    setDraft(activeWhisper?.text ?? '');
    if (activeWhisper?.expiryOption) {
      setExpiryOption(activeWhisper.expiryOption);
    }
  }, [activeWhisper, room.id]);

  const trimmed = draft.trim();
  const canPublish = trimmed.length > 0 && trimmed.length <= ROOM_WHISPER_MAX_LENGTH;
  const previewText = trimmed || activeWhisper?.text || 'Quietly ruining another page corner.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;
    onPublishWhisper(trimmed, expiryOption);
  };

  return (
    <aside className="catalog-card p-4 bg-[#FCF7EE] text-[#2E2118] flex flex-col gap-3.5 max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#B59C84] pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#6E3E44]" />
            <h2 className="font-editorial text-2xl text-[#2E2118]">
              Room Whisper
            </h2>
          </div>
          <p className="font-mono text-[10px] text-[#684F38] mt-0.5">
            {room.name} · Public Room Status
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-[#EFE2CF] text-[#684F38] cursor-pointer"
          aria-label="Close Room Whisper drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Live Speech Bubble Preview */}
      <div className="rounded-md bg-[#2A1F18] border border-[#1B1410] px-3 py-4 flex flex-col items-center justify-center relative overflow-hidden">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#DFC9AA]/75 mb-2">
          {activeWhisper ? `Live · ${formatRemaining(activeWhisper.expiresAt)}` : 'Bubble Preview'}
        </span>
        <PixelSpeechBubble
          text={previewText}
          authorLabel={userHandle}
          isSelf={true}
          maxWidthClass="max-w-[220px]"
        />
        {quietMode && (
          <span className="mt-2 font-sans text-xs text-[#E4A853]">
            Quiet Mode is hiding other residents&apos; bubbles.
          </span>
        )}
      </div>

      {/* Single-Status Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="room-whisper-input"
              className="font-sans text-xs font-semibold text-[#684F38]"
            >
              Your active whisper
            </label>
            <span
              className={`font-mono text-[11px] ${
                draft.length >= ROOM_WHISPER_MAX_LENGTH ? 'text-[#6E3E44] font-semibold' : 'text-[#8C7158]'
              }`}
            >
              {draft.length}/{ROOM_WHISPER_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="room-whisper-input"
            rows={2}
            maxLength={ROOM_WHISPER_MAX_LENGTH}
            value={draft}
            onChange={e => setDraft(e.target.value.slice(0, ROOM_WHISPER_MAX_LENGTH))}
            onKeyDown={typewriter.handleKeyDown}
            placeholder="What book, mug, or existential detour are you on?"
            className="w-full px-3 py-2 text-xs font-sans bg-[#FFFDF9] border-2 border-[#B59C84] rounded text-[#2E2118] placeholder:text-[#9A816A] focus:outline-none focus:border-[#6E3E44] resize-none"
          />
        </div>

        {/* Expiry Selector */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="font-sans text-xs font-medium text-[#684F38]">
            Expires
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {EXPIRY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExpiryOption(opt.value)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] border cursor-pointer transition-colors ${
                  expiryOption === opt.value
                    ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#2E2118]'
                    : 'bg-[#F7EFE3] text-[#5A422E] border-[#C5AF98] hover:border-[#2E2118]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="submit"
            disabled={!canPublish}
            className="btn-primary text-xs py-2 px-3 flex-1 justify-center disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeWhisper ? 'Update Whisper' : 'Pin Above Head'}</span>
          </button>

          {activeWhisper && (
            <button
              type="button"
              onClick={() => {
                onClearWhisper();
                setDraft('');
              }}
              className="btn-secondary text-xs py-2 px-2.5 text-[#6E3E44]"
              title="Clear active whisper"
              aria-label="Clear active whisper"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Room Scope & Privacy Note */}
      <div className="p-2.5 rounded bg-[#F5ECDE] border border-[#D4C0A9] text-[11px] text-[#5A422E] leading-snug">
        Public only inside <strong className="text-[#2E2118]">{room.name}</strong>. Switching rooms
        or leaving the Cafeteria clears your bubble. Private letters belong in{' '}
        <span className="font-semibold text-[#6E3E44]">The Margins</span>.
      </div>

      {/* Occupants in Room + Local Moderation Hooks */}
      <div className="pt-2 border-t border-dashed border-[#B59C84] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#684F38] flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#6E3E44]" />
            <span>In This Room ({roomResidentsWhispers.length})</span>
          </span>
        </div>

        {reportBanner && (
          <div className="p-2 rounded bg-[#EFE2CF] border border-[#6E3E44]/50 text-xs text-[#2E2118] flex items-center justify-between gap-2">
            <span>{reportBanner}</span>
            <button
              type="button"
              onClick={() => setReportBanner(null)}
              className="text-xs font-sans font-semibold text-[#6E3E44] cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        <div className="space-y-2">
          {roomResidentsWhispers.map(w => {
            const isMuted = mutedAuthorIds.includes(w.authorId);
            const isReported = reportedWhisperIds.includes(w.id);

            return (
              <div
                key={w.id}
                className="p-2.5 rounded bg-[#FFFDF9] border border-[#CDB8A1] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans font-semibold text-[#6E3E44] truncate">
                    {w.authorName}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleMuteAuthor(w.authorId)}
                      title={isMuted ? 'Unmute bubbles from resident' : 'Mute bubbles from resident'}
                      aria-label={isMuted ? `Unmute ${w.authorName}` : `Mute ${w.authorName}`}
                      className={`px-2 py-0.5 rounded border text-[11px] font-sans font-medium flex items-center gap-1 cursor-pointer ${
                        isMuted
                          ? 'bg-[#6E3E44] text-[#FAF3E8] border-[#2E2118]'
                          : 'bg-[#F7EFE3] text-[#5A422E] border-[#C5AF98] hover:border-[#2E2118]'
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isMuted ? 'Muted' : 'Mute'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isReported}
                      onClick={() => {
                        onReportWhisper(w.id, w.authorName);
                        setReportBanner(
                          `Flagged ${w.authorName}'s whisper locally (moderation queue hook).`
                        );
                      }}
                      title="Flag whisper"
                      aria-label={`Report ${w.authorName}`}
                      className="p-1 rounded border border-[#C5AF98] bg-[#F7EFE3] text-[#684F38] hover:border-[#6E3E44] hover:text-[#6E3E44] disabled:opacity-45 cursor-pointer"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className={`text-[11px] leading-snug ${isMuted ? 'line-through text-[#9A816A]' : 'text-[#2E2118]'}`}>
                  {w.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

