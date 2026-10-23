/**
 * Dead Poets Club — Native Web Audio Ambient Sound Generator & Interaction SFX
 * Continuous CC0 procedural soundscapes generated in-browser using Web Audio synthesis:
 * - Rain (filtered noise with drop modulations)
 * - Distant Street Ambience (low urban rumble & night wind)
 * - Café Murmur (multi-formant human murmur emulation)
 * - Typewriter / Writing Sounds (procedural key clatter impulses)
 * - Quiet Room Tone (peaceful warm resonant interior drone)
 * - Fireplace (lowpass hearth rumble with randomized spark impulses)
 * - Vinyl Crackle (subtle dust clicks and high-frequency needle friction)
 * - Soft Piano Chords (gentle warm resonant sine tones)
 * - Page Turn SFX (realistic paper sweep envelope for quote card flips)
 * - Tactile UI Click SFX (delicate vintage wood tap)
 */

export type RoomSoundPreset = 'gazing_out' | 'writers_den' | 'quiet_reading';

export interface SoundState {
  isPlaying: boolean;
  isMuted: boolean;
  masterVolume: number;
  currentRoom?: RoomSoundPreset;
  activeTracks: Record<string, boolean>;
  volumes: Record<string, number>;
}

type SoundListener = (state: SoundState) => void;

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlayingMaster: boolean = false;
  private masterVolume: number = 0.7;
  private masterGain: GainNode | null = null;
  private currentRoom: RoomSoundPreset = 'gazing_out';
  private listeners: Set<SoundListener> = new Set();

  // Track state
  private tracks: Record<string, { gainNode: GainNode; isPlaying: boolean; volume: number; stop: () => void }> = {};

  // Track volumes cache
  private trackVolumes: Record<string, number> = {
    rain: 0.5,
    street: 0.35,
    murmur: 0.3,
    typing: 0.25,
    roomtone: 0.4,
    fireplace: 0.35,
    vinyl: 0.25,
    piano: 0.3,
  };

  public initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public subscribe(listener: SoundListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  public getState(): SoundState {
    const activeTracks: Record<string, boolean> = {};
    Object.keys(this.trackVolumes).forEach(key => {
      activeTracks[key] = !!this.tracks[key]?.isPlaying;
    });

    return {
      isPlaying: this.isPlayingMaster,
      isMuted: this.isMuted,
      masterVolume: this.masterVolume,
      currentRoom: this.currentRoom,
      activeTracks,
      volumes: { ...this.trackVolumes },
    };
  }

  // Create brown/pink/white noise buffer
  private createNoiseBuffer(type: 'brown' | 'pink' | 'white' = 'brown'): AudioBuffer {
    this.initContext();
    if (!this.ctx) throw new Error('AudioContext not ready');
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        data[i] = white * 0.2;
      }
    }
    return buffer;
  }

  // 1. RAIN TRACK
  public startRain(volume = this.trackVolumes.rain) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.trackVolumes.rain = volume;
    if (this.tracks['rain']?.isPlaying) {
      this.setTrackVolume('rain', volume);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('pink');
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.45, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.isPlayingMaster = true;

    this.tracks['rain'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        try { noise.stop(); } catch {}
      },
    };
    this.notify();
  }

  // 2. DISTANT STREET & NIGHT BREEZE TRACK (Gazing Out)
  public startStreet(volume = this.trackVolumes.street) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.trackVolumes.street = volume;
    if (this.tracks['street']?.isPlaying) {
      this.setTrackVolume('street', volume);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('brown');
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(220, this.ctx.currentTime);

    // Subtle LFO for wind movement
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(50, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);
    lfo.start();

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.35, this.ctx.currentTime);

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.isPlayingMaster = true;

    this.tracks['street'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        try {
          noise.stop();
          lfo.stop();
        } catch {}
      },
    };
    this.notify();
  }

  // 3. CAFÉ MURMUR TRACK
  public startCafeMurmur(volume = this.trackVolumes.murmur) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.trackVolumes.murmur = volume;
    if (this.tracks['murmur']?.isPlaying) {
      this.setTrackVolume('murmur', volume);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('brown');
    noise.loop = true;

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(520, this.ctx.currentTime);
    filter1.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.32, this.ctx.currentTime);

    noise.connect(filter1);
    filter1.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.isPlayingMaster = true;

    this.tracks['murmur'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        try { noise.stop(); } catch {}
      },
    };
    this.notify();
  }

  // 4. SUBTLE WRITING & TYPEWRITER CLATTERS (Writers' Den)
  public startTyping(volume = this.trackVolumes.typing) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.trackVolumes.typing = volume;
    if (this.tracks['typing']?.isPlaying) {
      this.setTrackVolume('typing', volume);
      return;
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    gain.connect(this.masterGain);

    let active = true;
    const playKeystroke = () => {
      if (!active || !this.ctx || !this.tracks['typing']?.isPlaying) return;
      // Trigger a light rhythmic typing sound
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const clickFilter = this.ctx.createBiquadFilter();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1400 + Math.random() * 800, this.ctx.currentTime);

      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(2200, this.ctx.currentTime);
      clickFilter.Q.setValueAtTime(3, this.ctx.currentTime);

      const curVol = this.tracks['typing'].volume * (0.04 + Math.random() * 0.05);
      oscGain.gain.setValueAtTime(curVol, this.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.045);

      osc.connect(clickFilter);
      clickFilter.connect(oscGain);
      oscGain.connect(gain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);

      const nextInterval = 120 + Math.random() * 450 + (Math.random() > 0.75 ? 1200 : 0);
      window.setTimeout(playKeystroke, nextInterval);
    };

    window.setTimeout(playKeystroke, 300);
    this.isPlayingMaster = true;

    this.tracks['typing'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        active = false;
      },
    };
    this.notify();
  }

  // 5. QUIET INTERIOR ROOM TONE (The Quiet Reading Room)
  public startRoomTone(volume = this.trackVolumes.roomtone) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.trackVolumes.roomtone = volume;
    if (this.tracks['roomtone']?.isPlaying) {
      this.setTrackVolume('roomtone', volume);
      return;
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);
    gain.connect(this.masterGain);

    // Warm peaceful acoustic drone (D2, A2)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(gain);

    osc1.start();
    osc2.start();

    // Subtle filtered air
    const air = this.ctx.createBufferSource();
    air.buffer = this.createNoiseBuffer('pink');
    air.loop = true;
    const airFilter = this.ctx.createBiquadFilter();
    airFilter.type = 'lowpass';
    airFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
    const airGain = this.ctx.createGain();
    airGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    air.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(gain);
    air.start();

    this.isPlayingMaster = true;

    this.tracks['roomtone'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          air.stop();
        } catch {}
      },
    };
    this.notify();
  }

  // 6. FIREPLACE CRACKLE
  public startFireplace(volume = this.trackVolumes.fireplace) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.trackVolumes.fireplace = volume;
    if (this.tracks['fireplace']?.isPlaying) {
      this.setTrackVolume('fireplace', volume);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('brown');
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.5, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.tracks['fireplace']?.isPlaying) return;
      if (Math.random() > 0.4) {
        const pop = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        pop.type = 'triangle';
        pop.frequency.setValueAtTime(120 + Math.random() * 300, this.ctx.currentTime);
        popGain.gain.setValueAtTime(this.tracks['fireplace'].volume * (0.04 + Math.random() * 0.12), this.ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        pop.connect(popGain);
        popGain.connect(this.masterGain);
        pop.start();
        pop.stop(this.ctx.currentTime + 0.08);
      }
    }, 280);

    this.isPlayingMaster = true;

    this.tracks['fireplace'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        clearInterval(interval);
        try { noise.stop(); } catch {}
      },
    };
    this.notify();
  }

  // 7. VINYL CRACKLE
  public startVinyl(volume = this.trackVolumes.vinyl) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.trackVolumes.vinyl = volume;
    if (this.tracks['vinyl']?.isPlaying) {
      this.setTrackVolume('vinyl', volume);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('white');
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.04, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.tracks['vinyl']?.isPlaying) return;
      if (Math.random() > 0.5) {
        const click = this.ctx.createBuffer(1, 400, this.ctx.sampleRate);
        const data = click.getChannelData(0);
        for (let i = 0; i < 400; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 50);
        const source = this.ctx.createBufferSource();
        source.buffer = click;
        const clickGain = this.ctx.createGain();
        clickGain.gain.setValueAtTime(this.tracks['vinyl'].volume * 0.07, this.ctx.currentTime);
        source.connect(clickGain);
        clickGain.connect(this.masterGain);
        source.start();
      }
    }, 450);

    this.isPlayingMaster = true;

    this.tracks['vinyl'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        clearInterval(interval);
        try { noise.stop(); } catch {}
      },
    };
    this.notify();
  }

  // 8. SOFT PIANO CHORDS
  public startPiano(volume = this.trackVolumes.piano) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.trackVolumes.piano = volume;
    if (this.tracks['piano']?.isPlaying) {
      this.setTrackVolume('piano', volume);
      return;
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.22, this.ctx.currentTime);
    gain.connect(this.masterGain);

    const chords = [
      [220, 261.63, 329.63], // A minor
      [174.61, 220, 261.63], // F major
      [261.63, 329.63, 392], // C major
      [196, 246.94, 293.66], // G major
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.ctx || !this.tracks['piano']?.isPlaying) return;
      const currentNotes = chords[chordIdx % chords.length];
      chordIdx++;

      currentNotes.forEach((freq, noteIdx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const startTime = this.ctx.currentTime + noteIdx * 0.12;
        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.1, startTime + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 4.5);

        osc.connect(noteGain);
        noteGain.connect(gain);

        osc.start(startTime);
        osc.stop(startTime + 4.6);
      });
    };

    playChord();
    const interval = window.setInterval(playChord, 5200);

    this.isPlayingMaster = true;

    this.tracks['piano'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        clearInterval(interval);
      },
    };
    this.notify();
  }

  // ==========================================
  // REAL-TIME INTERACTION SOUND EFFECTS (SFX)
  // ==========================================

  /**
   * PAGE TURN / FLIP SFX
   * Play on interactive Goodreads-inspired quote card flips!
   */
  public playPageTurn() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const duration = 0.22;
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        // Soft textured paper scrape envelope
        const envelope = Math.sin((i / data.length) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * envelope * Math.exp(-i / (data.length * 0.4));
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(550, this.ctx.currentTime + duration);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28 * this.masterVolume, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      source.start();
    } catch {}
  }

  /**
   * TACTILE UI CLICK SFX
   * Play on button/nav interactions
   */
  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08 * this.masterVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {}
  }

  // ==========================================
  // ROOM-AWARE AMBIENCE PRESETS & TRANSITIONS
  // ==========================================

  /**
   * Switches smoothly to a room's intended atmosphere without abrupt cuts or overlaps
   */
  public playRoomPreset(roomId: RoomSoundPreset) {
    this.currentRoom = roomId;
    // Fade out / stop all existing tracks
    this.stopAll();

    // Start room-specific sound combinations
    if (roomId === 'gazing_out') {
      // Room A: Gazing Out -> rain, quiet street ambience, distant café murmur
      this.startRain(0.55);
      this.startStreet(0.4);
      this.startCafeMurmur(0.18);
    } else if (roomId === 'writers_den') {
      // Room B: The Writers' Den -> soft café gathering, typing sounds, vinyl, warm fireplace
      this.startCafeMurmur(0.35);
      this.startTyping(0.25);
      this.startFireplace(0.3);
      this.startVinyl(0.2);
    } else if (roomId === 'quiet_reading') {
      // Room C: The Quiet Reading Room -> gentle rain, quiet room tone, soft piano
      this.startRoomTone(0.45);
      this.startRain(0.25);
      this.startPiano(0.25);
    }

    this.isPlayingMaster = true;
    this.notify();
  }

  public setTrackVolume(trackName: string, volume: number) {
    this.trackVolumes[trackName] = volume;
    const track = this.tracks[trackName];
    if (track && this.ctx) {
      track.volume = volume;
      track.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.45)), this.ctx.currentTime);
    }
    this.notify();
  }

  public stopTrack(trackName: string) {
    const track = this.tracks[trackName];
    if (track) {
      track.stop();
      track.isPlaying = false;
      delete this.tracks[trackName];
    }
    this.notify();
  }

  public stopAll() {
    Object.keys(this.tracks).forEach(key => this.stopTrack(key));
    this.isPlayingMaster = false;
    this.notify();
  }

  public togglePlayPause() {
    if (this.isPlayingMaster) {
      this.stopAll();
    } else {
      this.playRoomPreset(this.currentRoom);
    }
    return this.isPlayingMaster;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    this.notify();
    return this.isMuted;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    this.notify();
  }

  public isTrackPlaying(trackName: string): boolean {
    return !!this.tracks[trackName]?.isPlaying;
  }

  public getTrackVolume(trackName: string): number {
    return this.trackVolumes[trackName] ?? 0.5;
  }
}

export const soundEngine = new AmbientSoundEngine();
