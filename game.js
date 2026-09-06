/**
 * THE MIDNIGHT DETENTION (3D)
 * Built with Three.js (WebGL) & Procedural Web Audio API
 * 
 * Lead Developer: Ibrahim Anwar (ابراهيم أنور) - 2019
 * 
 * Features:
 * - Robust multi-layout keyboard support (WASD, ZQSD, Arrow keys, Arabic layout)
 * - Failsafe collision physics with sliding response
 * - Narrative Intro: Yassine (18 yo) car crash awakening at 3:00 AM
 * - 4 Thematic Rooms:
 *   1. Teacher's Room (Carved secret signature: "Ibrahim Anwar - 2019")
 *   2. Science Lab (Preserved specimen jars & creepy science benches)
 *   3. Library (Dusty bookshelves & ancient notebooks)
 *   4. Principal's Office (Executive desk & the final golden key)
 * - The Specter AI (sight & hearing chase, heartbeat acceleration, flashlight reaction)
 * - The Legendary Dacia Duster 2019 Escape & Moroccan Darija Ending:
 *   "فهد البلاد السعيدة كاينين شي ناس فيهم غير الحضية تتبدا سميتهم بحرف جيم"
 *   With the Specter waving in the rearview mirror!
 */

'use strict';

/* ==========================================================================
   1. PROCEDURAL WEB AUDIO ENGINE (Zero External Assets)
   ========================================================================== */
class HorrorAudioEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.heartbeatBpm = 68;
    this.whisperGain = null;
    this.whisperNode = null;
    this.isMuted = false;
    this.volume = 0.85;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startAmbientDrone();
      this.startWhisperLayer();

      this.initialized = true;
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  startAmbientDrone() {
    if (!this.ctx) return;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc1.type = 'sawtooth';
    this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.Q.setValueAtTime(4, this.ctx.currentTime);

    this.ambientOsc2 = this.ctx.createOscillator();
    this.ambientOsc2.type = 'sine';
    this.ambientOsc2.frequency.setValueAtTime(56.2, this.ctx.currentTime);

    this.ambientOsc1.connect(filter);
    this.ambientOsc2.connect(filter);
    filter.connect(this.ambientGain);

    this.ambientOsc1.start();
    this.ambientOsc2.start();
  }

  startWhisperLayer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(6.0, this.ctx.currentTime);

    this.whisperGain = this.ctx.createGain();
    this.whisperGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

    whiteNoise.connect(bandpass);
    bandpass.connect(this.whisperGain);
    this.whisperGain.connect(this.masterGain);

    whiteNoise.start();
  }

  updateMonsterProximity(intensity) {
    if (!this.ctx || !this.initialized) return;
    const t = this.ctx.currentTime;
    if (this.whisperGain) {
      const targetGain = 0.015 + intensity * 0.16;
      this.whisperGain.gain.setTargetAtTime(targetGain, t, 0.1);
    }
    this.heartbeatBpm = Math.round(68 + intensity * 105);
  }

  playHeartbeat() {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(80, t);
    osc1.frequency.exponentialRampToValueAtTime(32, t + 0.12);

    gain1.gain.setValueAtTime(0.7, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.16);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(70, t + 0.14);
    osc2.frequency.exponentialRampToValueAtTime(28, t + 0.28);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.setValueAtTime(0.55, t + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t + 0.14);
    osc2.stop(t + 0.33);
  }

  playFootstep() {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(85 + Math.random() * 25, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playFlashlightToggle() {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playKeyPickup() {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    [880, 1174.66, 1760, 2349.32].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.25 - idx * 0.04, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 1.3);
    });
  }

  playDoorRattle() {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  playDoorUnlock() {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const oscBolt = this.ctx.createOscillator();
    const gainBolt = this.ctx.createGain();
    oscBolt.type = 'sawtooth';
    oscBolt.frequency.setValueAtTime(160, t);
    oscBolt.frequency.exponentialRampToValueAtTime(70, t + 0.4);
    gainBolt.gain.setValueAtTime(0.5, t);
    gainBolt.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    oscBolt.connect(gainBolt);
    gainBolt.connect(this.masterGain);
    oscBolt.start(t);
    oscBolt.stop(t + 0.46);
  }

  playCarEngineStart() {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Starter cranking
    for (let i = 0; i < 3; i++) {
      const crankOsc = this.ctx.createOscillator();
      const crankGain = this.ctx.createGain();
      crankOsc.type = 'sawtooth';
      crankOsc.frequency.setValueAtTime(50, t + i * 0.15);
      crankOsc.frequency.exponentialRampToValueAtTime(95, t + i * 0.15 + 0.11);

      crankGain.gain.setValueAtTime(0.35, t + i * 0.15);
      crankGain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.13);

      crankOsc.connect(crankGain);
      crankGain.connect(this.masterGain);
      crankOsc.start(t + i * 0.15);
      crankOsc.stop(t + i * 0.15 + 0.14);
    }

    // Engine ignition roar into smooth idle
    const engOsc = this.ctx.createOscillator();
    const engGain = this.ctx.createGain();
    const engFilter = this.ctx.createBiquadFilter();

    engOsc.type = 'sawtooth';
    engOsc.frequency.setValueAtTime(80, t + 0.55);
    engOsc.frequency.linearRampToValueAtTime(170, t + 0.85);
    engOsc.frequency.linearRampToValueAtTime(70, t + 1.8);

    engFilter.type = 'lowpass';
    engFilter.frequency.setValueAtTime(260, t + 0.55);

    engGain.gain.setValueAtTime(0.01, t + 0.55);
    engGain.gain.linearRampToValueAtTime(0.5, t + 0.85);
    engGain.gain.exponentialRampToValueAtTime(0.15, t + 3.8);

    engOsc.connect(engFilter);
    engFilter.connect(engGain);
    engGain.connect(this.masterGain);

    engOsc.start(t + 0.55);
    engOsc.stop(t + 4.0);
  }

  playJumpscare() {
    if (!this.ctx || !this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;

    [180, 245, 370, 780, 1140, 1920].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 0.4, t + 0.6);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.75);
    });

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(25, t + 0.8);
    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.95);
  }
}

/* ==========================================================================
   2. PROCEDURAL 3D TEXTURE GENERATORS
   ========================================================================== */
class TextureFactory {
  static createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Peeling institutional green wall
    ctx.fillStyle = '#3c433e';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#5c6560';
    ctx.fillRect(0, 0, 512, 340);

    // Stains, water damage, and cracks
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 6, 2 + Math.random() * 6);
    }

    // Cracks
    ctx.strokeStyle = 'rgba(10, 15, 10, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 300);
      ctx.lineTo(Math.random() * 512, Math.random() * 300);
      ctx.stroke();
    }

    // Dark wooden baseboard
    ctx.fillStyle = '#1a120e';
    ctx.fillRect(0, 480, 512, 32);

    // Mold divider line
    ctx.fillStyle = '#1e221f';
    ctx.fillRect(0, 335, 512, 10);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#181a20';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    for (let y = 0; y < 512; y += tileSize) {
      for (let x = 0; x < 512; x += tileSize) {
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          ctx.fillStyle = '#262932';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
        ctx.strokeStyle = '#0f1115';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 512);
      ctx.lineTo(Math.random() * 512, Math.random() * 512);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }

  static createCeilingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22242a';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#101114';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 256, 256);

    ctx.fillStyle = '#16171c';
    for (let i = 0; i < 150; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }

  static createChalkboardTexture(roomTitle = "ROOM 101 - DETENTION") {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#16221a';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#382516';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, 512, 256);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '22px "Special Elite", monospace';
    ctx.fillText(roomTitle, 40, 60);
    ctx.fillText("TIME: 3:00 AM", 40, 105);
    ctx.fillText("WHERE DID EVERYONE GO?", 40, 150);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(310, 45);
    ctx.lineTo(460, 205);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  static createLockerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#222e35';
    ctx.fillRect(0, 0, 256, 512);

    const lw = 256 / 3;
    for (let i = 0; i < 3; i++) {
      const x = i * lw;
      ctx.strokeStyle = '#10161a';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 2, 4, lw - 4, 504);

      ctx.fillStyle = '#0d1215';
      for (let v = 0; v < 5; v++) {
        ctx.fillRect(x + 12, 40 + v * 12, lw - 24, 4);
      }

      ctx.fillStyle = '#9ca4b0';
      ctx.fillRect(x + lw - 18, 240, 8, 30);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /* Secret Signature Desk: "Ibrahim Anwar - 2019" */
  static createCarvedSignatureDeskTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#24160f';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 512; i += 4) {
      const shade = 30 + Math.floor(Math.sin(i * 0.08) * 8) + Math.floor(Math.random() * 6);
      ctx.fillStyle = `rgb(${shade + 10}, ${shade}, ${Math.max(10, shade - 8)})`;
      ctx.fillRect(0, i, 512, 3);
    }

    ctx.strokeStyle = '#120905';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 512);
      ctx.lineTo(Math.random() * 512, Math.random() * 512);
      ctx.stroke();
    }

    // Engraved Signature Box
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#3e2415';
    ctx.lineWidth = 3;
    ctx.strokeRect(70, 160, 372, 190);

    ctx.strokeStyle = '#0a0402';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(76, 166, 360, 178);

    // Carved Name: Ibrahim Anwar - 2019
    ctx.font = 'bold 28px "Cinzel", serif';
    ctx.fillStyle = '#080302';
    ctx.fillText('Ibrahim Anwar - 2019', 256 + 2, 230 + 2);
    ctx.fillStyle = '#e5b035';
    ctx.fillText('Ibrahim Anwar - 2019', 256, 230);

    // Subtitle Arabic
    ctx.font = 'bold 24px "Cairo", serif';
    ctx.fillStyle = '#080302';
    ctx.fillText('ابراهيم أنور', 256 + 1.5, 275 + 1.5);
    ctx.fillStyle = '#ffd700';
    ctx.fillText('ابراهيم أنور', 256, 275);

    ctx.font = 'bold 12px "Inter", monospace';
    ctx.fillStyle = '#a68242';
    ctx.fillText('• LEAD DEVELOPER •', 256, 315);

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}

/* ==========================================================================
   3. 3D SCHOOL MAP LAYOUT & 4 ROOMS
   ========================================================================== */
const CELL_SIZE = 4.0;
const WALL_HEIGHT = 3.6;

// 1 = Wall, 0 = Hallway, 2 = Classroom/Library, 3 = Library, 4 = Science Lab, 5 = Teacher's Room (Detention), 6 = Principal's Office, 8 = Main Exit Gate
const SCHOOL_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 0 (Exit Gate at 11, 12)
  [1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1], // Row 1 (Library West, Science Lab East)
  [1, 3, 3, 3, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 4, 4, 4, 1],
  [1, 3, 3, 3, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 4, 4, 4, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 5, 5, 5, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 6, 6, 6, 1], // Row 12 (Detention West, Principal East)
  [1, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 1], // Row 13 (Spawn at x=10, z=54)
  [1, 5, 5, 5, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 6, 6, 6, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const GRID_ROWS = SCHOOL_GRID.length;
const GRID_COLS = SCHOOL_GRID[0].length;

/* ==========================================================================
   4. MAIN 3D HORROR GAME ENGINE
   ========================================================================== */
class MidnightDetention3D {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.audio = new HorrorAudioEngine();

    // Game state
    this.state = 'START';
    this.startTime = 0;
    this.entityEncounters = 0;
    this.isSettingsOpen = false;

    // Ghost AI active by default (with toggle in settings)
    this.ghostAIEnabled = true;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Flashlight & Lighting
    this.flashlight = null;
    this.flashlightTarget = null;
    this.ambientLight = null;
    this.playerLight = null;
    this.dawnSunlight = null;
    this.isFlashlightOn = true;
    this.flickerIntensity = 0;

    // Guaranteed Open Spawn: Room 5 (Detention) at x = 10.0, z = 53.5
    this.player = {
      position: new THREE.Vector3(10.0, 1.7, 53.5),
      rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
      speed: 4.8,
      radius: 0.45,
      isMoving: false,
      stepTimer: 0,
      headBob: 0
    };

    // Robust Input System (Supports WASD, ZQSD, Arrows, Arabic)
    this.moveInput = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    this.isPointerLocked = false;
    this.touchLookZone = document.getElementById('touch-look-zone');
    this.touchStart = { x: 0, y: 0 };

    // Solid Colliders
    this.colliders = [];

    // The 4 Specific Horror Rooms & Their Keys
    this.keyObjects = [];
    this.keyData = [
      { id: 0, name: "Teacher's Room Key", roomName: "Teacher's Detention Room", cellX: 2, cellZ: 12, collected: false },
      { id: 1, name: "Science Lab Key", roomName: "Science Laboratory", cellX: 19, cellZ: 2, collected: false },
      { id: 2, name: "Library Key", roomName: "The Abandoned Library", cellX: 2, cellZ: 2, collected: false },
      { id: 3, name: "Principal's Golden Key", roomName: "Principal's Office", cellX: 19, cellZ: 13, collected: false }
    ];

    // Secret Signature Desk
    this.signatureDeskPos = null;

    // Main Exit Doors & Dacia Duster 2019
    this.exitGateMesh = null;
    this.exitCollider = null;
    this.gateRuneMeshes = [];
    this.doorsOpened = false;
    this.daciaDusterMesh = null;
    this.daciaDusterPos = null;

    // 3D Specter / Entity
    this.specter = {
      mesh: null,
      eyes: null,
      light: null,
      position: new THREE.Vector3(11 * CELL_SIZE, 1.7, 4 * CELL_SIZE),
      targetPos: new THREE.Vector3(11 * CELL_SIZE, 1.7, 4 * CELL_SIZE),
      speed: 3.2,
      chaseSpeed: 5.5,
      isChasing: false,
      patrolTimer: 0,
      bobTimer: 0,
      radius: 0.75
    };

    // UI Elements
    this.ui = {
      startOverlay: document.getElementById('start-overlay'),
      settingsOverlay: document.getElementById('settings-overlay'),
      cinematicOverlay: document.getElementById('cinematic-overlay'),
      typewriterText: document.getElementById('typewriter-text'),
      typewriterPrompt: document.getElementById('typewriter-prompt'),
      crosshair: document.getElementById('crosshair'),
      hud: document.getElementById('hud'),
      objectiveText: document.getElementById('objective-text'),
      keyCount: document.getElementById('key-count'),
      keySlots: [
        document.getElementById('slot-0'),
        document.getElementById('slot-1'),
        document.getElementById('slot-2'),
        document.getElementById('slot-3')
      ],
      bpmDisplay: document.getElementById('bpm-display'),
      pulseDot: document.getElementById('pulse-dot'),
      heartBarFill: document.getElementById('heart-bar-fill'),
      heartbeatVignette: document.getElementById('heartbeat-vignette'),
      interactionPrompt: document.getElementById('interaction-prompt'),
      promptLabel: document.getElementById('prompt-label'),
      alertBanner: document.getElementById('alert-banner'),
      pointerLockHint: document.getElementById('pointer-lock-hint'),
      jumpscareOverlay: document.getElementById('jumpscare-overlay'),
      gameoverOverlay: document.getElementById('gameover-overlay'),
      finalKeys: document.getElementById('final-keys'),
      finalSurvivalTime: document.getElementById('final-survival-time'),
      winOverlay: document.getElementById('win-overlay'),
      winSurvivalTime: document.getElementById('win-survival-time'),
      mobileControls: document.getElementById('mobile-controls'),
      toggleSound: document.getElementById('toggle-sound'),
      toggleGhost: document.getElementById('toggle-ghost'),
      volumeSlider: document.getElementById('volume-slider'),
      volumeValue: document.getElementById('volume-value')
    };

    this.lastHeartbeatTime = 0;
    this.shakeTimer = 0;
    this.shakeStrength = 0;

    this.initThree();
    this.buildSchoolEnvironment();
    this.buildDaciaDuster2019();
    this.createKeys();
    this.createSpecter();
    this.setupEvents();
    this.setupSettingsEvents();

    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.renderLoop.bind(this));
  }

  /* ==========================================================================
     5. THREE.JS INITIALIZATION
     ========================================================================== */
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020205, 0.052);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );
    this.camera.position.copy(this.player.position);
    this.camera.rotation.copy(this.player.rotation);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.ambientLight = new THREE.AmbientLight(0x080c14, 0.14);
    this.scene.add(this.ambientLight);

    // Warm Dawn Directional Light outside
    this.dawnSunlight = new THREE.DirectionalLight(0xffdf95, 1.4);
    this.dawnSunlight.position.set(46, 12, -22);
    this.dawnSunlight.castShadow = true;
    this.dawnSunlight.shadow.mapSize.width = 1024;
    this.dawnSunlight.shadow.mapSize.height = 1024;
    this.scene.add(this.dawnSunlight);

    // 3D Flashlight SpotLight
    this.flashlight = new THREE.SpotLight(0xfffae8, 4.2, 34, Math.PI / 5.2, 0.42, 1.25);
    this.flashlight.position.set(0.2, -0.2, -0.1);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.flashlight.shadow.camera.near = 0.2;
    this.flashlight.shadow.camera.far = 34;

    this.flashlightTarget = new THREE.Object3D();
    this.flashlightTarget.position.set(0, 0, -5);
    this.camera.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;
    this.camera.add(this.flashlight);

    this.playerLight = new THREE.PointLight(0xfffae8, 0.25, 4.5);
    this.playerLight.position.set(0, -0.2, 0);
    this.camera.add(this.playerLight);

    this.scene.add(this.camera);
  }

  /* ==========================================================================
     6. CREATIVE 3D SCHOOL ENVIRONMENT (4 THEMATIC ROOMS)
     ========================================================================== */
  buildSchoolEnvironment() {
    const wallTex = TextureFactory.createWallTexture();
    const floorTex = TextureFactory.createFloorTexture();
    const ceilingTex = TextureFactory.createCeilingTexture();
    const lockerTex = TextureFactory.createLockerTexture();

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85, metalness: 0.1 });
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.7, metalness: 0.2 });
    const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 0.9, metalness: 0.05 });

    // Interior Floor
    const floorGeo = new THREE.PlaneGeometry(GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set((GRID_COLS * CELL_SIZE) / 2, 0, (GRID_ROWS * CELL_SIZE) / 2);
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Outside Driveway Floor
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.9 });
    const outsideGeo = new THREE.PlaneGeometry(GRID_COLS * CELL_SIZE, 24);
    const outsideFloor = new THREE.Mesh(outsideGeo, asphaltMat);
    outsideFloor.rotation.x = -Math.PI / 2;
    outsideFloor.position.set((GRID_COLS * CELL_SIZE) / 2, 0, -10);
    outsideFloor.receiveShadow = true;
    this.scene.add(outsideFloor);

    // Ceiling
    const ceilingMesh = new THREE.Mesh(floorGeo, ceilingMat);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.set((GRID_COLS * CELL_SIZE) / 2, WALL_HEIGHT, (GRID_ROWS * CELL_SIZE) / 2);
    this.scene.add(ceilingMesh);

    // Walls & Thematic Rooms
    const wallGeo = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = SCHOOL_GRID[r][c];
        const cx = c * CELL_SIZE + CELL_SIZE / 2;
        const cz = r * CELL_SIZE + CELL_SIZE / 2;

        if (cell === 1) {
          const wallMesh = new THREE.Mesh(wallGeo, wallMat);
          wallMesh.position.set(cx, WALL_HEIGHT / 2, cz);
          wallMesh.castShadow = true;
          wallMesh.receiveShadow = true;
          this.scene.add(wallMesh);
          this.colliders.push(new THREE.Box3().setFromObject(wallMesh));

          if ((r === 5 || r === 6 || r === 11) && Math.random() < 0.45) {
            const lockerMat = new THREE.MeshStandardMaterial({ map: lockerTex, roughness: 0.5, metalness: 0.6 });
            const lockerMesh = new THREE.Mesh(new THREE.BoxGeometry(CELL_SIZE * 0.8, 2.2, 0.4), lockerMat);
            lockerMesh.position.set(cx, 1.1, cz + (r === 5 ? 1.8 : -1.8));
            lockerMesh.castShadow = true;
            this.scene.add(lockerMesh);
          }
        } else if (cell === 8) {
          this.buildMainExitGate(cx, cz);
        } else if (cell === 5 && r === 12 && c === 2) {
          // ROOM 1: Teacher's Detention Room with Secret Signature Desk
          const chalkTex = TextureFactory.createChalkboardTexture("DETENTION ROOM - TEACHER'S DESK");
          const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshStandardMaterial({ map: chalkTex }));
          boardMesh.position.set(cx, 2.0, cz - 1.95);
          this.scene.add(boardMesh);

          // Secret Signature Desk: "Ibrahim Anwar - 2019"
          this.createSecretDesk(cx, cz - 0.7);
        } else if (cell === 4 && r === 2 && c === 19) {
          // ROOM 2: Science Laboratory with specimen tables
          const chalkTex = TextureFactory.createChalkboardTexture("SCIENCE LAB - SPECIMENS");
          const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshStandardMaterial({ map: chalkTex }));
          boardMesh.position.set(cx, 2.0, cz - 1.95);
          this.scene.add(boardMesh);

          this.createScienceLabTable(cx, cz);
        } else if (cell === 3 && r === 2 && c === 2) {
          // ROOM 3: The Library with tall dusty bookshelves
          this.createBookshelf(cx - 1.2, cz);
          this.createBookshelf(cx + 1.2, cz);
        } else if (cell === 6 && r === 13 && c === 19) {
          // ROOM 4: Principal's Executive Office
          this.createPrincipalOffice(cx, cz);
        }
      }
    }
  }

  /* Room 1 Desk: Ibrahim Anwar - 2019 Signature */
  createSecretDesk(x, z) {
    const deskGroup = new THREE.Group();
    const carvedTex = TextureFactory.createCarvedSignatureDeskTexture();
    const woodMat = new THREE.MeshStandardMaterial({ map: carvedTex, roughness: 0.65, metalness: 0.15 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.7, roughness: 0.4 });

    const topMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.0), woodMat);
    topMesh.position.y = 0.85;
    topMesh.castShadow = true;
    deskGroup.add(topMesh);

    [-0.7, 0.7].forEach(lx => {
      [-0.35, 0.35].forEach(lz => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85), metalMat);
        leg.position.set(lx, 0.425, lz);
        leg.castShadow = true;
        deskGroup.add(leg);
      });
    });

    deskGroup.position.set(x, 0, z);
    this.scene.add(deskGroup);
    this.colliders.push(new THREE.Box3().setFromObject(deskGroup));
    this.signatureDeskPos = new THREE.Vector3(x, 0.85, z);
  }

  /* Room 2: Science Lab Table with Jars */
  createScienceLabTable(x, z) {
    const group = new THREE.Group();
    const slateMat = new THREE.MeshStandardMaterial({ color: 0x181c20, roughness: 0.5 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.1), slateMat);
    top.position.y = 0.9;
    top.castShadow = true;
    group.add(top);

    // Specimen jars with eerie glowing fluids
    const jarMat = new THREE.MeshStandardMaterial({ color: 0x3aff6c, transparent: true, opacity: 0.65, emissive: 0x0a3312 });
    [-0.4, 0.0, 0.4].forEach((jx, idx) => {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25), jarMat);
      jar.position.set(jx, 1.05, (idx % 2 === 0 ? -0.2 : 0.2));
      group.add(jar);
    });

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.colliders.push(new THREE.Box3().setFromObject(group));
  }

  /* Room 3: Library Bookshelf */
  createBookshelf(x, z) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x2c1a12, roughness: 0.8 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.5), woodMat);
    frame.position.y = 1.3;
    frame.castShadow = true;
    group.add(frame);

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.colliders.push(new THREE.Box3().setFromObject(group));
  }

  /* Room 4: Principal's Executive Office */
  createPrincipalOffice(x, z) {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d1c12, roughness: 0.7 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.85, 1.2), woodMat);
    desk.position.y = 0.425;
    desk.castShadow = true;
    group.add(desk);

    // Office safe
    const safeMat = new THREE.MeshStandardMaterial({ color: 0x22262c, metalness: 0.8, roughness: 0.3 });
    const safe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.7), safeMat);
    safe.position.set(1.4, 0.55, -0.6);
    safe.castShadow = true;
    group.add(safe);

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.colliders.push(new THREE.Box3().setFromObject(group));
  }

  buildMainExitGate(x, z) {
    const gateGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a0f12, metalness: 0.8, roughness: 0.3 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x2d181c, metalness: 0.7, roughness: 0.4 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, 0.6), frameMat);
    frame.position.y = WALL_HEIGHT / 2;
    gateGroup.add(frame);

    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(CELL_SIZE * 0.46, WALL_HEIGHT * 0.85, 0.15), doorMat);
    leftDoor.position.set(-CELL_SIZE * 0.23, WALL_HEIGHT * 0.45, 0);
    gateGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(CELL_SIZE * 0.46, WALL_HEIGHT * 0.85, 0.15), doorMat);
    rightDoor.position.set(CELL_SIZE * 0.23, WALL_HEIGHT * 0.45, 0);
    gateGroup.add(rightDoor);

    this.gateRuneMeshes = [];
    for (let i = 0; i < 4; i++) {
      const rune = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.15, 16),
        new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
      );
      rune.position.set(-0.45 + i * 0.3, 1.6, 0.1);
      gateGroup.add(rune);
      this.gateRuneMeshes.push(rune);
    }

    gateGroup.position.set(x, 0, z);
    this.scene.add(gateGroup);
    this.exitGateMesh = gateGroup;

    this.exitCollider = new THREE.Box3().setFromObject(gateGroup);
    this.colliders.push(this.exitCollider);
  }

  /* ==========================================================================
     THE DACIA DUSTER 2019 GETAWAY CAR (3D MODEL)
     ========================================================================== */
  buildDaciaDuster2019() {
    const dusterGroup = new THREE.Group();

    // Atacama / Desert Orange Metallic Paint
    const paintMat = new THREE.MeshStandardMaterial({
      color: 0xbe5212,
      metalness: 0.65,
      roughness: 0.3
    });

    // Rugged Black Plastic Cladding
    const blackTrimMat = new THREE.MeshStandardMaterial({
      color: 0x161719,
      roughness: 0.9,
      metalness: 0.1
    });

    // Satin Silver Skid Plates & Roof Rails
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xabb0b8,
      metalness: 0.8,
      roughness: 0.25
    });

    // Tinted Glass
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0c1118,
      metalness: 0.95,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85
    });

    // Lower Chassis
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 4.2), blackTrimMat);
    lowerBody.position.y = 0.55;
    lowerBody.castShadow = true;
    dusterGroup.add(lowerBody);

    // Front & Rear Silver Skid Plates
    const frontSkid = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.15), silverMat);
    frontSkid.position.set(0, 0.45, 2.12);
    dusterGroup.add(frontSkid);

    const rearSkid = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.15), silverMat);
    rearSkid.position.set(0, 0.45, -2.12);
    dusterGroup.add(rearSkid);

    // Main Metal Body Shell
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.6, 4.1), paintMat);
    mainBody.position.y = 1.05;
    mainBody.castShadow = true;
    dusterGroup.add(mainBody);

    // Sculpted Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 1.4), paintMat);
    hood.position.set(0, 1.25, 1.3);
    hood.rotation.x = 0.08;
    hood.castShadow = true;
    dusterGroup.add(hood);

    // Cabin with Tinted Windows
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.68, 2.4), glassMat);
    cabin.position.set(0, 1.62, -0.2);
    cabin.castShadow = true;
    dusterGroup.add(cabin);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 2.35), paintMat);
    roof.position.set(0, 1.98, -0.2);
    roof.castShadow = true;
    dusterGroup.add(roof);

    // Roof Rails
    [-0.75, 0.75].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2), silverMat);
      rail.rotation.x = Math.PI / 2;
      rail.position.set(rx, 2.06, -0.2);
      dusterGroup.add(rail);
    });

    // Front Grille & Headlights
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.1), blackTrimMat);
    grille.position.set(0, 1.1, 2.08);
    dusterGroup.add(grille);

    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.75, 0.75].forEach(hx => {
      const lightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.08), headlightMat);
      lightMesh.position.set(hx, 1.12, 2.08);
      dusterGroup.add(lightMesh);

      const headSpot = new THREE.SpotLight(0xfffae8, 3.0, 18, Math.PI / 4, 0.35);
      headSpot.position.set(hx, 1.12, 2.15);
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(hx, 0.2, 10);
      dusterGroup.add(spotTarget);
      headSpot.target = spotTarget;
      dusterGroup.add(headSpot);
    });

    // Rear Taillights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1e2e });
    [-0.75, 0.75].forEach(tx => {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.06), tailMat);
      tail.position.set(tx, 1.2, -2.07);
      dusterGroup.add(tail);
    });

    // Wheels & Tires
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.95 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xc4c7cc, metalness: 0.8, roughness: 0.3 });

    const wheelPositions = [
      { x: -0.98, z: 1.35 },
      { x: 0.98, z: 1.35 },
      { x: -0.98, z: -1.35 },
      { x: 0.98, z: -1.35 }
    ];

    wheelPositions.forEach(wp => {
      const wheelGroup = new THREE.Group();

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.29, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      wheelGroup.position.set(wp.x, 0.42, wp.z);
      dusterGroup.add(wheelGroup);
    });

    // Parked outside exit gate (x = 46.0, z = -6.5)
    dusterGroup.position.set(46.0, 0, -6.5);
    dusterGroup.rotation.y = Math.PI;

    this.scene.add(dusterGroup);
    this.daciaDusterMesh = dusterGroup;
    this.daciaDusterPos = new THREE.Vector3(46.0, 1.2, -6.5);
  }

  /* ==========================================================================
     7. 3D INTERACTIVE GOLDEN KEYS
     ========================================================================== */
  createKeys() {
    this.keyData.forEach((k) => {
      const keyGroup = new THREE.Group();
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.95,
        roughness: 0.2,
        emissive: 0x443300
      });

      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 12, 24), goldMat);
      handle.rotation.x = Math.PI / 2;
      keyGroup.add(handle);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.32), goldMat);
      shaft.position.z = 0.2;
      shaft.rotation.x = Math.PI / 2;
      keyGroup.add(shaft);

      const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.03), goldMat);
      tooth1.position.set(0, -0.04, 0.32);
      keyGroup.add(tooth1);

      const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), goldMat);
      tooth2.position.set(0, -0.03, 0.26);
      keyGroup.add(tooth2);

      const keyLight = new THREE.PointLight(0xffd700, 0.8, 2.5);
      keyLight.position.set(0, 0, 0);
      keyGroup.add(keyLight);

      const worldX = k.cellX * CELL_SIZE + CELL_SIZE / 2;
      const worldZ = k.cellZ * CELL_SIZE + CELL_SIZE / 2;
      keyGroup.position.set(worldX, 1.0, worldZ);

      this.scene.add(keyGroup);
      this.keyObjects.push({ data: k, group: keyGroup, light: keyLight });
    });
  }

  /* ==========================================================================
     8. 3D SPECTER / ENTITY
     ========================================================================== */
  createSpecter() {
    const specterGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x050102,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92
    });

    const bodyMesh = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.2, 16), bodyMat);
    bodyMesh.position.y = 1.1;
    bodyMesh.rotation.x = Math.PI;
    specterGroup.add(bodyMesh);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), bodyMat);
    headMesh.position.y = 2.0;
    specterGroup.add(headMesh);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1e2e });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
    eyeL.position.set(-0.14, 2.05, 0.32);
    specterGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), eyeMat);
    eyeR.position.set(0.14, 2.05, 0.32);
    specterGroup.add(eyeR);

    const specterLight = new THREE.PointLight(0xff1e2e, 1.6, 6.5);
    specterLight.position.set(0, 2.0, 0.3);
    specterGroup.add(specterLight);

    specterGroup.position.copy(this.specter.position);
    this.scene.add(specterGroup);

    this.specter.mesh = specterGroup;
    this.specter.light = specterLight;
  }

  /* ==========================================================================
     UNIVERSAL TAP & CLICK BINDER (ZERO-DELAY MOBILE TOUCH & DESKTOP CLICK)
     ========================================================================== */
  bindTapOrClick(target, callback) {
    const el = (typeof target === 'string') ? document.getElementById(target) : target;
    if (!el) return;

    let touchHandled = false;

    const execute = (e) => {
      // Initialize or resume audio context directly within user gesture
      if (this.audio && typeof this.audio.init === 'function') {
        this.audio.init();
      }
      callback(e);
    };

    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      touchHandled = true;
      execute(e);
      setTimeout(() => { touchHandled = false; }, 400);
    }, { passive: false });

    el.addEventListener('click', (e) => {
      if (touchHandled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.stopPropagation();
      execute(e);
    });
  }

  /* ==========================================================================
     9. MULTI-LAYOUT KEYBOARD & TOUCH CONTROLS
     ========================================================================== */
  setupEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Failsafe key handler supporting QWERTY, AZERTY, Arrows, and Arabic layout
    const handleKeyEvent = (e, isPressed) => {
      const code = e.code || "";
      const key = (e.key || "").toLowerCase();

      // Forward: W, Z (AZERTY), Up, ص
      if (code === 'KeyW' || code === 'KeyZ' || code === 'ArrowUp' || key === 'w' || key === 'z' || key === 'ص') {
        this.moveInput.forward = isPressed;
      }
      // Backward: S, Down, س
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'س') {
        this.moveInput.backward = isPressed;
      }
      // Strafe Left: A, Q (AZERTY), Left, ش
      if (code === 'KeyA' || code === 'KeyQ' || code === 'ArrowLeft' || key === 'a' || key === 'q' || key === 'ش') {
        this.moveInput.left = isPressed;
      }
      // Strafe Right: D, Right, ي
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'ي') {
        this.moveInput.right = isPressed;
      }

      if (isPressed) {
        if (code === 'Escape' || key === 'escape') {
          this.toggleSettingsModal();
        }
        if (code === 'KeyF' || key === 'f' || key === 'ب') {
          if (this.state === 'PLAYING') this.toggleFlashlight();
        }
        if (code === 'KeyE' || key === 'e' || key === ' ' || key === 'ث') {
          if (this.state === 'PLAYING') this.handleInteraction();
        }
      }
    };

    window.addEventListener('keydown', (e) => handleKeyEvent(e, true));
    window.addEventListener('keyup', (e) => handleKeyEvent(e, false));

    // Pointer Lock for FPS mouse look
    this.canvas.addEventListener('click', () => {
      if (this.isSettingsOpen) return;
      if (this.state === 'PLAYING' && !this.isPointerLocked && !('ontouchstart' in window)) {
        this.canvas.requestPointerLock();
      } else if (this.state === 'PLAYING') {
        this.handleInteraction();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = (document.pointerLockElement === this.canvas);
      if (this.isPointerLocked) {
        this.ui.pointerLockHint.classList.add('hidden');
      } else if (this.state === 'PLAYING' && !('ontouchstart' in window) && !this.isSettingsOpen) {
        this.ui.pointerLockHint.classList.remove('hidden');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked && this.state === 'PLAYING' && !this.isSettingsOpen) {
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;
        this.rotateCamera(movementX * 0.0022, movementY * 0.0022);
      }
    });

    // Mobile Touch Controls
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) {
      this.ui.mobileControls.style.display = 'flex';
      this.ui.touchLookZone.style.display = 'block';
    }

    this.touchLookZone.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStart.x = e.touches[0].clientX;
        this.touchStart.y = e.touches[0].clientY;
      }
    }, { passive: true });

    this.touchLookZone.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0 && this.state === 'PLAYING' && !this.isSettingsOpen) {
        const deltaX = e.touches[0].clientX - this.touchStart.x;
        const deltaY = e.touches[0].clientY - this.touchStart.y;
        this.touchStart.x = e.touches[0].clientX;
        this.touchStart.y = e.touches[0].clientY;
        this.rotateCamera(deltaX * 0.0045, deltaY * 0.0045);
      }
    }, { passive: true });

    // Touch D-Pad Bindings
    const bindDpad = (id, dir) => {
      const el = document.getElementById(id);
      if (!el) return;
      const onStart = (e) => {
        e.preventDefault();
        this.moveInput[dir] = true;
        el.classList.add('active');
      };
      const onEnd = (e) => {
        e.preventDefault();
        this.moveInput[dir] = false;
        el.classList.remove('active');
      };
      el.addEventListener('touchstart', onStart, { passive: false });
      el.addEventListener('touchend', onEnd, { passive: false });
      el.addEventListener('touchcancel', onEnd, { passive: false });
      el.addEventListener('mousedown', onStart);
      el.addEventListener('mouseup', onEnd);
      el.addEventListener('mouseleave', onEnd);
    };

    bindDpad('dpad-up', 'forward');
    bindDpad('dpad-down', 'backward');
    bindDpad('dpad-left', 'left');
    bindDpad('dpad-right', 'right');

    // Mobile Action Buttons (Dual click & touch support with immediate response)
    this.bindTapOrClick('btn-mobile-interact', () => {
      this.handleInteraction();
    });

    this.bindTapOrClick('btn-mobile-flashlight', () => {
      this.toggleFlashlight();
    });

    // UI Buttons (WAKE UP, TRY AGAIN, PLAY AGAIN)
    this.bindTapOrClick('btn-begin', () => {
      this.startCinematicOpening();
    });

    this.bindTapOrClick('btn-restart', () => {
      this.resetGame();
      this.state = 'PLAYING';
      this.ui.gameoverOverlay.classList.add('hidden');
    });

    this.bindTapOrClick('btn-play-again', () => {
      this.resetGame();
      this.state = 'PLAYING';
      this.ui.winOverlay.classList.add('hidden');
    });
  }

  /* ==========================================================================
     SETTINGS & CREDITS CONTROLLER
     ========================================================================== */
  setupSettingsEvents() {
    const openBtns = ['btn-settings-start', 'btn-hud-settings', 'btn-gameover-settings', 'btn-win-settings'];
    openBtns.forEach(id => {
      this.bindTapOrClick(id, () => {
        this.openSettingsModal();
      });
    });

    const closeBtns = ['btn-close-settings', 'btn-save-settings'];
    closeBtns.forEach(id => {
      this.bindTapOrClick(id, () => {
        this.closeSettingsModal();
      });
    });

    if (this.ui.toggleGhost) {
      this.ui.toggleGhost.checked = this.ghostAIEnabled;
      this.ui.toggleGhost.addEventListener('change', (e) => {
        this.ghostAIEnabled = e.target.checked;
        if (this.specter.mesh) {
          this.specter.mesh.visible = this.ghostAIEnabled;
          this.specter.light.visible = this.ghostAIEnabled;
        }
        this.showAlertBanner(
          this.ghostAIEnabled
            ? "SPECTER AI: ACTIVE (HORROR MODE)"
            : "SPECTER AI: DISABLED (SAFE ROAM)"
        );
      });
    }

    if (this.ui.toggleSound) {
      this.ui.toggleSound.addEventListener('change', (e) => {
        this.audio.setMuted(!e.target.checked);
        if (e.target.checked) {
          this.audio.init();
        }
      });
    }

    if (this.ui.volumeSlider) {
      this.ui.volumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.ui.volumeValue.textContent = `${val}%`;
        this.audio.setVolume(val / 100);
      });
    }
  }

  openSettingsModal() {
    this.isSettingsOpen = true;
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
    this.ui.settingsOverlay.classList.remove('hidden');
  }

  closeSettingsModal() {
    this.isSettingsOpen = false;
    this.ui.settingsOverlay.classList.add('hidden');
  }

  toggleSettingsModal() {
    if (this.isSettingsOpen) {
      this.closeSettingsModal();
    } else {
      this.openSettingsModal();
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  rotateCamera(yawDelta, pitchDelta) {
    this.player.rotation.y -= yawDelta;
    this.player.rotation.x -= pitchDelta;
    this.player.rotation.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.player.rotation.x));
    this.camera.rotation.copy(this.player.rotation);
  }

  /* ==========================================================================
     10. CINEMATIC INTRO (YASSINE'S CRASH AWAKENING)
     ========================================================================== */
  startCinematicOpening() {
    this.ui.startOverlay.classList.add('hidden');
    this.ui.cinematicOverlay.classList.remove('hidden');
    this.state = 'INTRO';

    // Official Narrative Script (No mention of the car here!)
    const introStory = "Yassine, 18 years old...\nAfter a violent car crash in the foggy woods, he wakes up locked inside an abandoned, creepy school detention room at 3:00 AM.";
    let charIdx = 0;
    this.ui.typewriterText.textContent = "";

    let isTyping = true;
    let typeTimer = null;
    let wakeTriggered = false;

    const wakeUpNow = (e) => {
      if (wakeTriggered) return;
      wakeTriggered = true;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.ui.cinematicOverlay.removeEventListener('click', wakeUpNow);
      this.ui.cinematicOverlay.removeEventListener('touchend', wakeUpNow);
      this.wakeUpSequence();
    };

    const attachWakeHandler = () => {
      this.ui.typewriterPrompt.classList.remove('hidden');
      this.ui.cinematicOverlay.addEventListener('click', wakeUpNow);
      this.ui.cinematicOverlay.addEventListener('touchend', wakeUpNow, { passive: false });
    };

    // If user clicks or taps while typing, complete the narrative immediately
    const skipTyping = (e) => {
      if (!isTyping) return;
      isTyping = false;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      clearTimeout(typeTimer);
      this.ui.typewriterText.textContent = introStory;
      this.ui.cinematicOverlay.removeEventListener('click', skipTyping);
      this.ui.cinematicOverlay.removeEventListener('touchend', skipTyping);
      setTimeout(() => attachWakeHandler(), 40);
    };

    this.ui.cinematicOverlay.addEventListener('click', skipTyping);
    this.ui.cinematicOverlay.addEventListener('touchend', skipTyping, { passive: false });

    const typeNext = () => {
      if (!isTyping) return;
      if (charIdx < introStory.length) {
        const char = introStory.charAt(charIdx);
        if (char === '\n') {
          this.ui.typewriterText.appendChild(document.createElement('br'));
        } else {
          this.ui.typewriterText.appendChild(document.createTextNode(char));
        }
        charIdx++;
        if (Math.random() < 0.35) this.audio.playFootstep();
        typeTimer = setTimeout(typeNext, char === '.' ? 280 : (char === '\n' ? 450 : 38));
      } else {
        isTyping = false;
        this.ui.cinematicOverlay.removeEventListener('click', skipTyping);
        this.ui.cinematicOverlay.removeEventListener('touchend', skipTyping);
        attachWakeHandler();
      }
    };

    typeTimer = setTimeout(typeNext, 500);
  }

  wakeUpSequence() {
    this.ui.cinematicOverlay.classList.add('eyes-opening');
    this.triggerScreenShake(1.4, 10);
    this.audio.playFlashlightToggle();

    setTimeout(() => {
      this.ui.cinematicOverlay.classList.add('hidden');
      this.state = 'PLAYING';
      this.startTime = performance.now();
      if (!('ontouchstart' in window)) {
        this.ui.pointerLockHint.classList.remove('hidden');
      }
      this.showAlertBanner("AWAKENED IN DETENTION: SEARCH THE 4 ROOMS FOR THE 4 KEYS!");
    }, 1800);
  }

  /* ==========================================================================
     11. GAMEPLAY INTERACTIONS & LOGIC
     ========================================================================== */
  toggleFlashlight() {
    this.isFlashlightOn = !this.isFlashlightOn;
    this.flashlight.visible = this.isFlashlightOn;
    this.playerLight.visible = this.isFlashlightOn;
    this.audio.playFlashlightToggle();
    if (!this.isFlashlightOn) {
      this.showAlertBanner("FLASHLIGHT OFF: HARDER TO SEE, QUIETER TO MOVE");
    }
  }

  handleInteraction() {
    // 1. Check proximity to 3D keys
    for (let k of this.keyObjects) {
      if (!k.data.collected) {
        const dist = this.player.position.distanceTo(k.group.position);
        if (dist < 2.5) {
          k.data.collected = true;
          k.group.visible = false;
          this.audio.playKeyPickup();
          this.updateHUDKeys();
          this.showAlertBanner(`FOUND: ${k.data.name}! (${k.data.roomName})`);
          return;
        }
      }
    }

    // 2. Check proximity to Secret Signature Desk (Ibrahim Anwar - 2019)
    if (this.signatureDeskPos) {
      const distToDesk = this.player.position.distanceTo(this.signatureDeskPos);
      if (distToDesk < 2.6) {
        this.audio.playKeyPickup();
        this.triggerScreenShake(0.35, 4);
        this.showAlertBanner("SECRET SIGNATURE: Carved into the desk: Ibrahim Anwar - 2019 (ابراهيم أنور)!");
        return;
      }
    }

    // 3. Check proximity to 3D Exit Gate
    if (this.exitGateMesh) {
      const distToGate = this.player.position.distanceTo(this.exitGateMesh.position);
      if (distToGate < 4.5) {
        const count = this.keyData.filter(k => k.collected).length;
        if (count === 4) {
          if (!this.doorsOpened) {
            this.openExitDoors();
          } else {
            this.triggerWinEnding();
          }
        } else {
          this.audio.playDoorRattle();
          this.triggerScreenShake(0.3, 5);
          this.showAlertBanner(`DOORS LOCKED! REQUIRES ALL 4 KEYS (${count}/4 FOUND)`);
        }
        return;
      }
    }

    // 4. Check proximity to Dacia Duster 2019 outside
    if (this.daciaDusterPos && this.doorsOpened) {
      const distToCar = this.player.position.distanceTo(this.daciaDusterPos);
      if (distToCar < 5.0) {
        this.triggerWinEnding();
      }
    }
  }

  openExitDoors() {
    this.doorsOpened = true;
    this.audio.playDoorUnlock();
    this.triggerScreenShake(1.5, 6);

    if (this.exitGateMesh) {
      const leftDoor = this.exitGateMesh.children[1];
      const rightDoor = this.exitGateMesh.children[2];
      if (leftDoor) leftDoor.rotation.y = -Math.PI / 2;
      if (rightDoor) rightDoor.rotation.y = Math.PI / 2;
    }

    if (this.exitCollider) {
      const idx = this.colliders.indexOf(this.exitCollider);
      if (idx !== -1) {
        this.colliders.splice(idx, 1);
      }
    }

    this.showAlertBanner("GATES UNLOCKED! SPRINT OUTSIDE TO YOUR 2019 DACIA DUSTER!");
  }

  updateHUDKeys() {
    const count = this.keyData.filter(k => k.collected).length;
    this.ui.keyCount.textContent = count;
    this.keyData.forEach((k, idx) => {
      if (k.collected) {
        this.ui.keySlots[idx].classList.add('acquired');
        if (this.gateRuneMeshes && this.gateRuneMeshes[idx]) {
          this.gateRuneMeshes[idx].material.color.setHex(0xffd700);
        }
      } else {
        this.ui.keySlots[idx].classList.remove('acquired');
      }
    });

    if (count === 4) {
      this.ui.objectiveText.textContent = "All 4 keys collected! Run to the Main Gate to escape!";
      this.ui.objectiveText.style.color = "#ffd700";
      this.showAlertBanner("ALL 4 KEYS COLLECTED! RUN TO THE MAIN EXIT!");
    } else {
      this.ui.objectiveText.textContent = `Search the 4 rooms & collect the 4 keys (${count}/4)`;
    }
  }

  showAlertBanner(msg) {
    this.ui.alertBanner.textContent = msg;
    this.ui.alertBanner.classList.remove('hidden');
    clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => {
      this.ui.alertBanner.classList.add('hidden');
    }, 3200);
  }

  triggerScreenShake(duration, strength) {
    this.shakeTimer = duration;
    this.shakeStrength = strength;
  }

  /* ==========================================================================
     12. ROBUST PHYSICS & SLIDING COLLISION
     ========================================================================== */
  checkCollisions(newPos) {
    const playerBox = new THREE.Box3();
    const halfR = this.player.radius;
    // Bounding box at chest/legs level
    playerBox.min.set(newPos.x - halfR, 0.3, newPos.z - halfR);
    playerBox.max.set(newPos.x + halfR, 2.3, newPos.z + halfR);

    for (let c of this.colliders) {
      if (c.intersectsBox(playerBox)) {
        return true;
      }
    }
    return false;
  }

  updatePlayer(dt) {
    if (this.isSettingsOpen) return;

    let moveX = 0;
    let moveZ = 0;

    if (this.moveInput.forward) moveZ -= 1;
    if (this.moveInput.backward) moveZ += 1;
    if (this.moveInput.left) moveX -= 1;
    if (this.moveInput.right) moveX += 1;

    this.player.isMoving = (moveX !== 0 || moveZ !== 0);

    if (this.player.isMoving) {
      const moveDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation.y);

      const stepDist = this.player.speed * dt;

      // Test X independently for smooth wall sliding
      const testPosX = this.player.position.clone();
      testPosX.x += moveDir.x * stepDist;
      if (!this.checkCollisions(testPosX)) {
        this.player.position.x = testPosX.x;
      }

      // Test Z independently
      const testPosZ = this.player.position.clone();
      testPosZ.z += moveDir.z * stepDist;
      if (!this.checkCollisions(testPosZ)) {
        this.player.position.z = testPosZ.z;
      }

      this.player.stepTimer += dt;
      this.player.headBob += dt * 9;
      if (this.player.stepTimer > 0.42) {
        this.player.stepTimer = 0;
        this.audio.playFootstep();
      }
    } else {
      this.player.stepTimer = 0.3;
      this.player.headBob *= 0.85;
    }

    const bobOffset = Math.sin(this.player.headBob) * 0.055;
    this.camera.position.x = this.player.position.x;
    this.camera.position.y = this.player.position.y + bobOffset;
    this.camera.position.z = this.player.position.z;

    // Check if player has stepped outside through the open doors toward the Duster!
    if (this.doorsOpened && this.player.position.z < 0.2) {
      this.triggerWinEnding();
      return;
    }

    const bpmInterval = 60 / this.audio.heartbeatBpm;
    const now = performance.now() / 1000;
    if (now - this.lastHeartbeatTime > bpmInterval) {
      this.lastHeartbeatTime = now;
      this.audio.playHeartbeat();
    }

    this.checkInteractionPrompt();
  }

  checkInteractionPrompt() {
    let show = false;
    let label = "";

    // 1. Near keys
    for (let k of this.keyObjects) {
      if (!k.data.collected) {
        const dist = this.player.position.distanceTo(k.group.position);
        if (dist < 2.5) {
          show = true;
          label = `Pick up ${k.data.name}`;
          break;
        }
      }
    }

    // 2. Near Secret Signature Desk
    if (!show && this.signatureDeskPos) {
      const distToDesk = this.player.position.distanceTo(this.signatureDeskPos);
      if (distToDesk < 2.6) {
        show = true;
        label = "Inspect Carved Desk [Ibrahim Anwar - 2019]";
      }
    }

    // 3. Near Exit Gate
    if (!show && this.exitGateMesh) {
      const dist = this.player.position.distanceTo(this.exitGateMesh.position);
      if (dist < 4.5) {
        const count = this.keyData.filter(k => k.collected).length;
        if (count === 4) {
          show = true;
          label = this.doorsOpened ? "Sprint to Dacia Duster 2019!" : "Unlock Main Doors & Escape!";
        } else {
          show = true;
          label = `Inspect Locked Exit (${count}/4 Keys)`;
        }
      }
    }

    if (show) {
      this.ui.promptLabel.textContent = label;
      this.ui.interactionPrompt.classList.remove('hidden');
      this.ui.crosshair.classList.add('interactive');
    } else {
      this.ui.interactionPrompt.classList.add('hidden');
      this.ui.crosshair.classList.remove('interactive');
    }
  }

  /* ==========================================================================
     13. 3D SPECTER AI & PROXIMITY EFFECTS
     ========================================================================== */
  updateSpecter(dt) {
    if (!this.specter.mesh || this.isSettingsOpen) return;

    if (!this.ghostAIEnabled) {
      this.specter.mesh.visible = false;
      this.specter.light.visible = false;
      this.audio.updateMonsterProximity(0);
      this.ui.pulseDot.classList.remove('danger');
      this.ui.heartBarFill.classList.remove('danger');
      this.ui.heartbeatVignette.classList.remove('pulsing');
      this.ui.heartbeatVignette.style.opacity = "0";
      this.flashlight.intensity = 4.2;
      this.flashlight.color.setHex(0xfffae8);
      this.playerLight.color.setHex(0xfffae8);
      this.flickerIntensity = 0;
      return;
    }

    this.specter.mesh.visible = true;
    this.specter.light.visible = true;

    const specterPos = this.specter.position;
    const playerPos = this.player.position;
    const dist = specterPos.distanceTo(playerPos);

    this.specter.bobTimer += dt * 3;
    this.specter.mesh.position.y = 0.9 + Math.sin(this.specter.bobTimer) * 0.18;

    const rayDir = playerPos.clone().sub(specterPos).normalize();
    const ray = new THREE.Raycaster(specterPos, rayDir, 0.5, 30);
    const intersects = ray.intersectObjects(this.scene.children, true);

    let hasLineOfSight = true;
    if (intersects.length > 0) {
      for (let hit of intersects) {
        if (hit.object !== this.specter.mesh && hit.distance < dist - 0.5) {
          hasLineOfSight = false;
          break;
        }
      }
    }

    const hearingDist = this.player.isMoving ? 14 : 7;

    if (dist < 16 && (hasLineOfSight || dist < hearingDist)) {
      if (!this.specter.isChasing) {
        this.specter.isChasing = true;
        this.entityEncounters++;
      }
    } else if (dist > 24) {
      this.specter.isChasing = false;
    }

    const currentSpeed = this.specter.isChasing ? this.specter.chaseSpeed : this.specter.speed;

    if (this.specter.isChasing) {
      this.specter.targetPos.copy(playerPos);
    } else {
      this.specter.patrolTimer -= dt;
      if (this.specter.patrolTimer <= 0 || specterPos.distanceTo(this.specter.targetPos) < 1.0) {
        this.specter.patrolTimer = 5 + Math.random() * 5;
        let rx, rz;
        do {
          rx = Math.floor(Math.random() * (GRID_COLS - 2)) + 1;
          rz = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;
        } while (SCHOOL_GRID[rz][rx] === 1);

        this.specter.targetPos.set(rx * CELL_SIZE + CELL_SIZE / 2, 1.7, rz * CELL_SIZE + CELL_SIZE / 2);
      }
    }

    const moveDir = this.specter.targetPos.clone().sub(specterPos).normalize();
    specterPos.x += moveDir.x * currentSpeed * dt;
    specterPos.z += moveDir.z * currentSpeed * dt;
    this.specter.mesh.position.x = specterPos.x;
    this.specter.mesh.position.z = specterPos.z;

    this.specter.mesh.lookAt(playerPos.x, this.specter.mesh.position.y, playerPos.z);

    const maxDangerDist = 18.0;
    const proximityRatio = Math.max(0, Math.min(1, 1 - (dist / maxDangerDist)));
    this.audio.updateMonsterProximity(proximityRatio);

    const bpm = this.audio.heartbeatBpm;
    this.ui.bpmDisplay.textContent = bpm;
    this.ui.heartBarFill.style.width = `${Math.min(100, Math.round((bpm / 180) * 100))}%`;

    if (proximityRatio > 0.25) {
      this.ui.pulseDot.classList.add('danger');
      this.ui.heartBarFill.classList.add('danger');
      this.ui.heartbeatVignette.classList.add('pulsing');
      this.ui.heartbeatVignette.style.opacity = (proximityRatio * 0.9).toString();

      this.flickerIntensity = proximityRatio;
      if (Math.random() < this.flickerIntensity * 0.45) {
        this.flashlight.intensity = 0.5 + Math.random() * 2.0;
      } else {
        this.flashlight.intensity = 4.2;
      }

      const redAmount = Math.min(1.0, proximityRatio * 1.3);
      this.flashlight.color.setRGB(1.0, 0.98 * (1 - redAmount * 0.85), 0.91 * (1 - redAmount * 0.9));
      this.playerLight.color.setRGB(1.0, 0.98 * (1 - redAmount * 0.85), 0.91 * (1 - redAmount * 0.9));
    } else {
      this.ui.pulseDot.classList.remove('danger');
      this.ui.heartBarFill.classList.remove('danger');
      this.ui.heartbeatVignette.classList.remove('pulsing');
      this.ui.heartbeatVignette.style.opacity = "0";
      this.flashlight.intensity = 4.2;
      this.flashlight.color.setHex(0xfffae8);
      this.playerLight.color.setHex(0xfffae8);
      this.flickerIntensity = 0;
    }

    if (dist < (this.player.radius + this.specter.radius + 0.35)) {
      this.triggerJumpscare();
    }
  }

  /* ==========================================================================
     14. CINEMATIC ENDINGS: JUMPSCARE & DACIA DUSTER 2019 ESCAPE
     ========================================================================== */
  triggerJumpscare() {
    if (this.state !== 'PLAYING') return;
    this.state = 'JUMPSCARE';

    if (this.isPointerLocked) document.exitPointerLock();

    this.audio.playJumpscare();
    this.triggerScreenShake(1.5, 25);
    this.ui.jumpscareOverlay.classList.remove('hidden');

    setTimeout(() => {
      this.ui.jumpscareOverlay.classList.add('hidden');
      this.triggerGameOver();
    }, 1400);
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    const count = this.keyData.filter(k => k.collected).length;
    this.ui.finalKeys.textContent = `${count} / 4`;

    const survivalSeconds = Math.floor((performance.now() - this.startTime) / 1000);
    const mins = String(Math.floor(survivalSeconds / 60)).padStart(2, '0');
    const secs = String(survivalSeconds % 60).padStart(2, '0');
    this.ui.finalSurvivalTime.textContent = `${mins}:${secs}`;

    this.ui.gameoverOverlay.classList.remove('hidden');
  }

  triggerWinEnding() {
    if (this.state !== 'PLAYING') return;
    this.state = 'WIN';

    if (this.isPointerLocked) document.exitPointerLock();

    // Start Dacia Duster 2019 Engine & Escape
    this.audio.playCarEngineStart();
    this.triggerScreenShake(2.5, 10);

    const survivalSeconds = Math.floor((performance.now() - this.startTime) / 1000);
    const mins = String(Math.floor(survivalSeconds / 60)).padStart(2, '0');
    const secs = String(survivalSeconds % 60).padStart(2, '0');
    this.ui.winSurvivalTime.textContent = `${mins}:${secs}`;

    this.ui.winOverlay.classList.remove('hidden');
  }

  resetGame() {
    this.player.position.set(10.0, 1.7, 53.5);
    this.player.rotation.set(0, 0, 0, 'YXZ');
    this.camera.position.copy(this.player.position);
    this.camera.rotation.copy(this.player.rotation);

    this.moveInput.forward = false;
    this.moveInput.backward = false;
    this.moveInput.left = false;
    this.moveInput.right = false;

    this.isFlashlightOn = true;
    this.flashlight.visible = true;
    this.playerLight.visible = true;

    this.keyData.forEach(k => k.collected = false);
    this.keyObjects.forEach(ko => ko.group.visible = true);
    this.updateHUDKeys();

    this.doorsOpened = false;
    if (this.exitGateMesh) {
      const leftDoor = this.exitGateMesh.children[1];
      const rightDoor = this.exitGateMesh.children[2];
      if (leftDoor) leftDoor.rotation.y = 0;
      if (rightDoor) rightDoor.rotation.y = 0;
    }

    if (this.exitCollider && !this.colliders.includes(this.exitCollider)) {
      this.colliders.push(this.exitCollider);
    }

    this.specter.position.set(11 * CELL_SIZE, 1.7, 4 * CELL_SIZE);
    this.specter.targetPos.copy(this.specter.position);
    this.specter.isChasing = false;
    this.specter.patrolTimer = 0;
    this.entityEncounters = 0;

    this.audio.updateMonsterProximity(0);
    this.ui.heartbeatVignette.classList.remove('pulsing');
    this.ui.heartbeatVignette.style.opacity = "0";

    this.startTime = performance.now();
    this.showAlertBanner("DETENTION GATES LOCKED - FIND ALL 4 KEYS TO ESCAPE");
  }

  /* ==========================================================================
     15. MAIN ANIMATION & RENDER LOOP
     ========================================================================== */
  renderLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = currentTime;

    const time = currentTime * 0.002;
    this.keyObjects.forEach((ko) => {
      if (!ko.data.collected) {
        ko.group.rotation.y = time * 1.5;
        ko.group.position.y = 0.95 + Math.sin(time * 3 + ko.data.id) * 0.12;
      }
    });

    if (this.state === 'PLAYING') {
      this.updatePlayer(dt);
      this.updateSpecter(dt);
    }

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const sx = (Math.random() - 0.5) * this.shakeStrength * 0.03;
      const sy = (Math.random() - 0.5) * this.shakeStrength * 0.03;
      this.camera.position.x += sx;
      this.camera.position.y += sy;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.renderLoop.bind(this));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new MidnightDetention3D();
});
