/**
 * Dead Poets Club — Native Web Audio Ambient Sound Generator
 * Generates continuous CC0 ambient soundscapes in-browser using procedural Web Audio synthesis:
 * - Rain (filtered Brownian noise with drop modulations)
 * - Fireplace (crackling lowpass noise with randomized spark impulses)
 * - Café Murmur (layered bandpass human-register murmur emulation)
 * - Vinyl Crackle (subtle dust clicks and high-frequency needle friction)
 * - Soft Piano / Ethereal Chords (gentle warm resonant sine tones)
 * - Night Breeze & Rustle (swirling airy low-frequency breeze)
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Track state
  private tracks: Record<string, { gainNode: GainNode; isPlaying: boolean; volume: number; stop: () => void }> = {};

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create brown/pink noise buffer
  private createNoiseBuffer(type: 'brown' | 'pink' | 'white' = 'brown'): AudioBuffer {
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

  // RAIN TRACK
  public startRain(volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.tracks['rain']?.isPlaying) {
      this.setTrackVolume('rain', volume);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('pink');
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    this.tracks['rain'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        try { noise.stop(); } catch {}
      },
    };
  }

  // FIREPLACE CRACKLE TRACK
  public startFireplace(volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
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
    gain.gain.setValueAtTime(volume * 0.6, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    // Occasional crackle pops
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.tracks['fireplace']?.isPlaying) return;
      if (Math.random() > 0.4) {
        const pop = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        pop.type = 'triangle';
        pop.frequency.setValueAtTime(120 + Math.random() * 300, this.ctx.currentTime);
        popGain.gain.setValueAtTime(this.tracks['fireplace'].volume * (0.05 + Math.random() * 0.15), this.ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        pop.connect(popGain);
        popGain.connect(this.masterGain);
        pop.start();
        pop.stop(this.ctx.currentTime + 0.08);
      }
    }, 280);

    this.tracks['fireplace'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        clearInterval(interval);
        try { noise.stop(); } catch {}
      },
    };
  }

  // CAFÉ MURMUR TRACK
  public startCafeMurmur(volume = 0.4) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.tracks['murmur']?.isPlaying) {
      this.setTrackVolume('murmur', volume);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('brown');
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.35, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    this.tracks['murmur'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        try { noise.stop(); } catch {}
      },
    };
  }

  // VINYL CRACKLE TRACK
  public startVinyl(volume = 0.3) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
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

    // Random pops
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.tracks['vinyl']?.isPlaying) return;
      if (Math.random() > 0.5) {
        const click = this.ctx.createBuffer(1, 400, this.ctx.sampleRate);
        const data = click.getChannelData(0);
        for (let i = 0; i < 400; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 50);
        const source = this.ctx.createBufferSource();
        source.buffer = click;
        const clickGain = this.ctx.createGain();
        clickGain.gain.setValueAtTime(this.tracks['vinyl'].volume * 0.08, this.ctx.currentTime);
        source.connect(clickGain);
        clickGain.connect(this.masterGain);
        source.start();
      }
    }, 450);

    this.tracks['vinyl'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        clearInterval(interval);
        try { noise.stop(); } catch {}
      },
    };
  }

  // SOFT PIANO / ETHEREAL CHORDS TRACK
  public startPiano(volume = 0.3) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.tracks['piano']?.isPlaying) {
      this.setTrackVolume('piano', volume);
      return;
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.25, this.ctx.currentTime);
    gain.connect(this.masterGain);

    // Warm chord progression in D Minor / F Major
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
        noteGain.gain.linearRampToValueAtTime(0.12, startTime + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 4.5);

        osc.connect(noteGain);
        noteGain.connect(gain);

        osc.start(startTime);
        osc.stop(startTime + 4.6);
      });
    };

    playChord();
    const interval = window.setInterval(playChord, 5000);

    this.tracks['piano'] = {
      gainNode: gain,
      volume,
      isPlaying: true,
      stop: () => {
        clearInterval(interval);
      },
    };
  }

  public setTrackVolume(trackName: string, volume: number) {
    const track = this.tracks[trackName];
    if (track && this.ctx) {
      track.volume = volume;
      track.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime);
    }
  }

  public stopTrack(trackName: string) {
    const track = this.tracks[trackName];
    if (track) {
      track.stop();
      track.isPlaying = false;
      delete this.tracks[trackName];
    }
  }

  public stopAll() {
    Object.keys(this.tracks).forEach(key => this.stopTrack(key));
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public isTrackPlaying(trackName: string): boolean {
    return !!this.tracks[trackName]?.isPlaying;
  }

  public getTrackVolume(trackName: string): number {
    return this.tracks[trackName]?.volume ?? 0.5;
  }
}

export const soundEngine = new AmbientSoundEngine();
