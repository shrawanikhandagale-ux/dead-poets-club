import { AvatarConfig } from '../../types/profile';
import { RoomSoundPreset } from '../../lib/audioEngine';

export type CafeRoomId = 'athenaeum' | 'conservatory' | 'nocturne';

export type DeskTrinketId = 'candle' | 'teacup' | 'fern' | 'inkwell' | 'walkman';

export interface RectBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoomSeat {
  id: string;
  label: string;
  zone: string;
  x: number; // Center X in 1000x600 virtual room space
  y: number; // Center Y in 1000x600 virtual room space
  facing: 'left' | 'right';
  whisper: string;
  seatStyle: 'armchair' | 'desk_chair' | 'bistro' | 'booth';
}

export type InteractiveKind =
  | 'bookshelf'
  | 'fireplace'
  | 'window'
  | 'vinyl'
  | 'plants'
  | 'tea_counter'
  | 'manuscripts'
  | 'noticeboard';

export interface RoomInteractiveObject {
  id: string;
  kind: InteractiveKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  promptText: string;
  inspectionNote: string;
  collides?: boolean;
  actionType?: 'inspect' | 'toggle_audio' | 'open_whispers' | 'open_library';
}

export interface DemoNpcPatron {
  id: string;
  name: string;
  roleLabel: string;
  isDemoNpc: true;
  avatarConfig: Partial<AvatarConfig>;
  x: number;
  y: number;
  facing: 'left' | 'right';
  activity: 'reading' | 'wandering' | 'sipping' | 'writing';
  readingBook: string;
  thoughts: string[];
  waypoints?: { x: number; y: number }[];
}

export interface CafeRoomDefinition {
  id: CafeRoomId;
  name: string;
  subtitle: string;
  tagline: string;
  atmosphereTags: string[];
  soundPreset: RoomSoundPreset;
  palette: {
    wallTop: string;
    wallBottom: string;
    floorBase: string;
    floorAccent: string;
    trim: string;
    windowSkyTop: string;
    windowSkyBottom: string;
    lampGlow: string;
    deskSurface: string;
    deskTrim: string;
    accent: string;
  };
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  spawnPoint: { x: number; y: number };
  seats: RoomSeat[];
  objects: RoomInteractiveObject[];
  demoPatrons: DemoNpcPatron[];
}

export type WhisperExpiryOption = '15m' | '30m' | '1h' | 'session';

export const ROOM_WHISPER_MAX_LENGTH = 100;

export interface RoomWhisper {
  id: string;
  roomId: CafeRoomId;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
  expiresAt: number | null;
  expiryOption: WhisperExpiryOption;
  isSelf?: boolean;
  isDemo?: boolean;
}

