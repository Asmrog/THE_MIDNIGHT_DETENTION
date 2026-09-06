/**
 * THE MIDNIGHT DETENTION (3D)
 * Built with Three.js (WebGL) & Procedural Web Audio API
 * 
 * Lead Developer: Ibrahim Anouer (ابراهيم أنور) - 2026
 * 
 * Features:
 * - Robust multi-layout keyboard support (WASD, ZQSD, Arrow keys, Arabic layout)
 * - Failsafe collision physics with sliding response
 * - Narrative Intro: Yassine (18 yo) car crash awakening at 3:00 AM
 * - 4 Thematic Rooms:
 *   1. Teacher's Room (Carved secret signature: "Ibrahim Anouer - 2026")
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

    ctx.fillStyle = '#3c433e';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#5c6560';
    ctx.fillRect(0, 0, 512, 340);

    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 6, 2 + Math.random() * 6);
    }

    ctx.strokeStyle = 'rgba(10, 15, 10, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 300);
      ctx.lineTo(Math.random() * 512, Math.random() * 300);
      ctx.stroke();
    }

    ctx.fillStyle = '#1a120e';
    ctx.fillRect(0, 480, 512, 32);

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

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#3e2415';
    ctx.lineWidth = 3;
    ctx.strokeRect(70, 160, 372, 190);

    ctx.strokeStyle = '#0a0402';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(76, 166, 360, 178);

    ctx.font = 'bold 28px "Cinzel", serif';
    ctx.fillStyle = '#080302';
    ctx.fillText('Ibrahim Anwar - 2019', 256 + 2, 230 + 2);
    ctx.fillStyle = '#e5b035';
    ctx.fillText('Ibrahim Anwar - 2019', 256, 230);

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
   3. 3D SCHOOL MAP LAYOUT & GAME CONTROLLER
   ========================================================================== */
const CELL_SIZE = 4.0;
const WALL_HEIGHT = 3.6;

const SCHOOL_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1],
  [1, 3, 3, 3, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 4, 4, 4, 1],
  [1, 3, 3, 3, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 4, 4, 4, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 5, 1, 0, 1, 6, 1, 0, 0, 0, 0, 1, 6, 1, 0, 1, 5, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

class MidnightDetentionGame {
  constructor() {
    this.audio = new HorrorAudioEngine();
    this.state = 'START'; // START, CINEMATIC, PLAYING, SETTINGS, GAMEOVER, WIN
    this.keysAcquired = 0;
    this.totalKeys = 4;
    this.gameStartTime = 0;
    this.elapsedSeconds = 0;

    // Player State
    this.player = {
      position: new THREE.Vector3(2.0, 1.7, 32.0),
      velocity: new THREE.Vector3(),
      rotation: { yaw: 0, pitch: 0 },
      speed: 4.8,
      isFlashlightOn: true,
      radius: 0.35
    };

    // Input state
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      keys: {}
    };

    this.mobileControls = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    this.keysData = [
      { id: 0, room: "Teacher's Room", pos: new THREE.Vector3(-14, 0.8, -10), collected: false, name: "Teacher's Room Key" },
      { id: 1, room: "Science Lab", pos: new THREE.Vector3(14, 0.8, -10), collected: false, name: "Science Lab Key" },
      { id: 2, room: "Library", pos: new THREE.Vector3(-14, 0.8, 10), collected: false, name: "Library Key" },
      { id: 3, room: "Principal's Office", pos: new THREE.Vector3(6, 0.8, -14), collected: false, name: "Principal's Golden Key" }
    ];

    this.specter = {
      mesh: null,
      position: new THREE.Vector3(0, 0, -20),
      speed: 2.1,
      active: true,
      state: 'STALKING', // STALKING, CHASING, ATTACKING
      alertTimer: 0
    };

    this.interactiveObjects = [];
    this.doorsData = [];
    this.clock = new THREE.Clock();
    this.heartbeatTimer = 0;

    this.initUI();
  }

  initUI() {
    // Start button
    const btnBegin = document.getElementById('btn-begin');
    if (btnBegin) {
      btnBegin.addEventListener('click', () => {
        this.audio.init();
        this.audio.resume();
        this.startCinematicIntro();
      });
    }

    // Settings buttons
    ['btn-settings-start', 'btn-hud-settings', 'btn-gameover-settings', 'btn-win-settings'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => this.openSettings());
      }
    });

    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => this.closeSettings());
    }

    const btnSaveSettings = document.getElementById('btn-save-settings');
    if (btnSaveSettings) {
      btnSaveSettings.addEventListener('click', () => this.closeSettings());
    }

    // Toggles & Sliders
    const toggleSound = document.getElementById('toggle-sound');
    if (toggleSound) {
      toggleSound.addEventListener('change', (e) => {
        this.audio.setMuted(!e.target.checked);
      });
    }

    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (volumeValue) volumeValue.textContent = `${val}%`;
        this.audio.setVolume(val / 100);
      });
    }

    const toggleGhost = document.getElementById('toggle-ghost');
    if (toggleGhost) {
      toggleGhost.addEventListener('change', (e) => {
        this.specter.active = e.target.checked;
        if (this.specter.mesh) {
          this.specter.mesh.visible = this.specter.active;
        }
      });
    }

    // Restart & Play Again
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => location.reload());
    }

    const btnPlayAgain = document.getElementById('btn-play-again');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => location.reload());
    }

    // Cinematic skip / eye open
    const cinematicOverlay = document.getElementById('cinematic-overlay');
    if (cinematicOverlay) {
      cinematicOverlay.addEventListener('click', () => {
        if (this.state === 'CINEMATIC') {
          this.beginGameplay();
        }
      });
    }

    // Setup input listeners
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mobile D-Pad listeners
    const bindTouchButton = (id, actionStart, actionEnd) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); actionStart(); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); actionEnd(); });
      el.addEventListener('mousedown', (e) => { e.preventDefault(); actionStart(); });
      el.addEventListener('mouseup', (e) => { e.preventDefault(); actionEnd(); });
    };

    bindTouchButton('dpad-up', () => { this.mobileControls.forward = true; }, () => { this.mobileControls.forward = false; });
    bindTouchButton('dpad-down', () => { this.mobileControls.backward = true; }, () => { this.mobileControls.backward = false; });
    bindTouchButton('dpad-left', () => { this.mobileControls.left = true; }, () => { this.mobileControls.left = false; });
    bindTouchButton('dpad-right', () => { this.mobileControls.right = true; }, () => { this.mobileControls.right = false; });

    const btnMobileInteract = document.getElementById('btn-mobile-interact');
    if (btnMobileInteract) {
      btnMobileInteract.addEventListener('click', () => this.tryInteract());
    }

    const btnMobileFlashlight = document.getElementById('btn-mobile-flashlight');
    if (btnMobileFlashlight) {
      btnMobileFlashlight.addEventListener('click', () => this.toggleFlashlight());
    }

    // Pointer Lock & Desktop mouse look
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.addEventListener('click', () => {
        if (this.state === 'PLAYING' && document.pointerLockElement !== canvas) {
          canvas.requestPointerLock();
        }
      });
    }

    document.addEventListener('mousemove', (e) => {
      if (this.state === 'PLAYING' && document.pointerLockElement === document.getElementById('game-canvas')) {
        const sensitivity = 0.0022;
        this.player.rotation.yaw -= e.movementX * sensitivity;
        this.player.rotation.pitch -= e.movementY * sensitivity;
        this.player.rotation.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.player.rotation.pitch));
      }
    });

    // Mobile touch swipe look zone
    const touchLookZone = document.getElementById('touch-look-zone');
    if (touchLookZone) {
      let touchStartX = 0;
      let touchStartY = 0;
      touchLookZone.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      touchLookZone.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0 && this.state === 'PLAYING') {
          const x = e.touches[0].clientX;
          const y = e.touches[0].clientY;
          const dx = x - touchStartX;
          const dy = y - touchStartY;
          touchStartX = x;
          touchStartY = y;

          const sensitivity = 0.0035;
          this.player.rotation.yaw -= dx * sensitivity;
          this.player.rotation.pitch -= dy * sensitivity;
          this.player.rotation.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.player.rotation.pitch));
        }
      }, { passive: true });
    }

    this.initThreeScene();
  }

  initThreeScene() {
    const container = document.getElementById('game-container');
    const canvas = document.getElementById('game-canvas');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020205);
    this.scene.fog = new THREE.FogExp2(0x020205, 0.075);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x080912, 0.6);
    this.scene.add(ambientLight);

    // Player Flashlight
    this.flashlight = new THREE.SpotLight(0xfffae8, 3.2, 22, Math.PI / 5, 0.4, 1.2);
    this.flashlight.position.set(0, 0, 0);
    this.flashlight.castShadow = true;
    this.camera.add(this.flashlight);

    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, -10);
    this.camera.add(targetObject);
    this.flashlight.target = targetObject;

    this.scene.add(this.camera);

    this.buildSchoolEnvironment();
    this.buildSpecterEntity();
  }

  buildSchoolEnvironment() {
    const wallTex = TextureFactory.createWallTexture();
    const floorTex = TextureFactory.createFloorTexture();
    const ceilingTex = TextureFactory.createCeilingTexture();
    const lockerTex = TextureFactory.createLockerTexture();
    const deskTex = TextureFactory.createCarvedSignatureDeskTexture();

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85 });
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
    const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 0.95 });
    const lockerMat = new THREE.MeshStandardMaterial({ map: lockerTex, roughness: 0.4 });
    const deskMat = new THREE.MeshStandardMaterial({ map: deskTex, roughness: 0.6 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x111318, metalness: 0.8, roughness: 0.3 });

    const gridRows = SCHOOL_GRID.length;
    const gridCols = SCHOOL_GRID[0].length;
    const offsetX = (gridCols * CELL_SIZE) / 2;
    const offsetZ = (gridRows * CELL_SIZE) / 2;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const val = SCHOOL_GRID[r][c];
        const wx = c * CELL_SIZE - offsetX + CELL_SIZE / 2;
        const wz = r * CELL_SIZE - offsetZ + CELL_SIZE / 2;

        // Floor
        const floorGeo = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE);
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(wx, 0, wz);
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        // Ceiling
        const ceilingMesh = new THREE.Mesh(floorGeo, ceilingMat);
        ceilingMesh.rotation.x = Math.PI / 2;
        ceilingMesh.position.set(wx, WALL_HEIGHT, wz);
        this.scene.add(ceilingMesh);

        // Walls & Props
        if (val === 1) {
          const wallGeo = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, 0.3);
          const wallMesh = new THREE.Mesh(wallGeo, wallMat);
          wallMesh.position.set(wx, WALL_HEIGHT / 2, wz);
          wallMesh.castShadow = true;
          wallMesh.receiveShadow = true;
          this.scene.add(wallMesh);
        } else if (val >= 3 && val <= 6) {
          // Classroom / Room interior prop
          if (r === 7 && c === 3) {
            // Detention Room - Secret Desk with "Ibrahim Anwar - 2019" signature
            const deskGeo = new THREE.BoxGeometry(1.6, 0.9, 1.0);
            const deskMesh = new THREE.Mesh(deskGeo, deskMat);
            deskMesh.position.set(wx, 0.45, wz);
            deskMesh.castShadow = true;
            this.scene.add(deskMesh);
          }
        } else if (val === 8) {
          // Main Exit Gate (Locked until 4 keys are gathered)
          if (r === 0 && (c === 11 || c === 12)) {
            const gateGeo = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, 0.2);
            const gateMesh = new THREE.Mesh(gateGeo, ironMat);
            gateMesh.position.set(wx, WALL_HEIGHT / 2, wz);
            gateMesh.castShadow = true;
            this.scene.add(gateMesh);
            this.doorsData.push({ mesh: gateMesh, pos: gateMesh.position, isExit: true });
          }
        }
      }
    }

    // Spawn 3D Key Meshes in respective rooms
    this.keysData.forEach((keyData) => {
      const keyGroup = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(0.25, 0.07, 12, 24);
      const keyMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
      const ringMesh = new THREE.Mesh(ringGeo, keyMat);
      keyGroup.add(ringMesh);

      const shaftGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 12);
      const shaftMesh = new THREE.Mesh(shaftGeo, keyMat);
      shaftMesh.rotation.z = Math.PI / 2;
      shaftMesh.position.set(0.35, 0, 0);
      keyGroup.add(shaftMesh);

      keyGroup.position.copy(keyData.pos);
      keyGroup.rotation.y = Math.random() * Math.PI * 2;
      keyGroup.userData = { type: 'key', keyId: keyData.id, name: keyData.name };
      this.scene.add(keyGroup);
      this.interactiveObjects.push(keyGroup);
    });

    // Spawn Dacia Duster 2019 at the exit courtyard (Row -1, Col 11.5)
    this.spawnDaciaDusterModel(new THREE.Vector3(2, 0, -6.5));
  }

  spawnDaciaDusterModel(pos) {
    const dusterGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b4252, metalness: 0.7, roughness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.8 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x101012, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, metalness: 0.8, roughness: 0.2 });

    // Chassis body
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.8, 4.4);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.6, 0);
    bodyMesh.castShadow = true;
    dusterGroup.add(bodyMesh);

    // Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2.4);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, 1.25, -0.2);
    dusterGroup.add(cabinMesh);

    // Wheels (4)
    [-1.05, 1.05].forEach(wx => {
      [-1.4, 1.4].forEach(wz => {
        const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 24);
        tireGeo.rotateX(Math.PI / 2);
        const tireMesh = new THREE.Mesh(tireGeo, tireMat);
        tireMesh.position.set(wx, 0.38, wz);
        dusterGroup.add(tireMesh);
      });
    });

    dusterGroup.position.copy(pos);
    dusterGroup.userData = { type: 'dacia', name: 'Dacia Duster 2019' };
    this.scene.add(dusterGroup);
    this.interactiveObjects.push(dusterGroup);
  }

  buildSpecterEntity() {
    const specterGroup = new THREE.Group();
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.9, transparent: true, opacity: 0.88 });
    const robeGeo = new THREE.ConeGeometry(0.8, 2.8, 16);
    const robeMesh = new THREE.Mesh(robeGeo, robeMat);
    robeMesh.position.set(0, 1.4, 0);
    specterGroup.add(robeMesh);

    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, robeMat);
    headMesh.position.set(0, 2.7, 0);
    specterGroup.add(headMesh);

    // Glowing Red Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1e2e });
    const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 2.75, -0.25);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.12, 2.75, -0.25);
    specterGroup.add(leftEye);
    specterGroup.add(rightEye);

    specterGroup.position.copy(this.specter.position);
    this.scene.add(specterGroup);
    this.specter.mesh = specterGroup;
  }

  startCinematicIntro() {
    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) startOverlay.classList.add('hidden');

    const cinematicOverlay = document.getElementById('cinematic-overlay');
    if (cinematicOverlay) cinematicOverlay.classList.remove('hidden');

    this.state = 'CINEMATIC';

    const typewriterText = document.getElementById('typewriter-text');
    const typewriterPrompt = document.getElementById('typewriter-prompt');

    const narrativeLines = [
      "3:00 AM. The heavy silence of the detention hall.",
      "Yassine, 18 years old, gasps awake slumped over a wooden desk.",
      "A terrifying car crash echoing in memory... yet here you are, locked inside.",
      "Find the 4 school keys before the Specter claims your soul..."
    ];

    let lineIdx = 0;
    let charIdx = 0;

    const typeWriterInterval = setInterval(() => {
      if (lineIdx < narrativeLines.length) {
        if (charIdx < narrativeLines[lineIdx].length) {
          if (typewriterText) typewriterText.textContent += narrativeLines[lineIdx].charAt(charIdx);
          charIdx++;
        } else {
          setTimeout(() => {
            if (typewriterText && lineIdx < narrativeLines.length - 1) {
              typewriterText.textContent = '';
            }
            lineIdx++;
            charIdx = 0;
          }, 1400);
        }
      } else {
        clearInterval(typeWriterInterval);
        if (typewriterPrompt) typewriterPrompt.classList.remove('hidden');
      }
    }, 45);
  }

  beginGameplay() {
    const cinematicOverlay = document.getElementById('cinematic-overlay');
    if (cinematicOverlay) {
      cinematicOverlay.classList.add('eyes-opening');
      setTimeout(() => {
        cinematicOverlay.classList.add('hidden');
      }, 2000);
    }

    this.state = 'PLAYING';
    this.gameStartTime = performance.now();

    const canvas = document.getElementById('game-canvas');
    if (canvas && canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }

    const pointerHint = document.getElementById('pointer-lock-hint');
    if (pointerHint) {
      pointerHint.classList.remove('hidden');
      setTimeout(() => pointerHint.classList.add('hidden'), 5000);
    }

    this.showAlert("OBJECTIVE: COLLECT 4 KEYS FROM THE ROOMS");
    this.runGameLoop();
  }

  openSettings() {
    const prev = this.state;
    this.state = 'SETTINGS';
    const settingsOverlay = document.getElementById('settings-overlay');
    if (settingsOverlay) settingsOverlay.classList.remove('hidden');
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  closeSettings() {
    const settingsOverlay = document.getElementById('settings-overlay');
    if (settingsOverlay) settingsOverlay.classList.add('hidden');
    this.state = 'PLAYING';
  }

  onKeyDown(e) {
    this.input.keys[e.code] = true;
    if (e.code === 'KeyE' && this.state === 'PLAYING') {
      this.tryInteract();
    }
    if (e.code === 'KeyF' && this.state === 'PLAYING') {
      this.toggleFlashlight();
    }
    if (e.code === 'Escape') {
      if (this.state === 'PLAYING') {
        this.openSettings();
      } else if (this.state === 'SETTINGS') {
        this.closeSettings();
      }
    }
  }

  onKeyUp(e) {
    this.input.keys[e.code] = false;
  }

  toggleFlashlight() {
    this.player.isFlashlightOn = !this.player.isFlashlightOn;
    this.flashlight.visible = this.player.isFlashlightOn;
    this.audio.playFlashlightToggle();
    this.showAlert(this.player.isFlashlightOn ? "FLASHLIGHT ON" : "FLASHLIGHT OFF");
  }

  showAlert(msg) {
    const banner = document.getElementById('alert-banner');
    if (!banner) return;
    banner.textContent = msg;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 3500);
  }

  tryInteract() {
    // Check distance to interactive objects (Keys or Dacia Duster Exit)
    const playerPos = this.player.position;
    for (let i = this.interactiveObjects.length - 1; i >= 0; i--) {
      const obj = this.interactiveObjects[i];
      const dist = obj.position.distanceTo(playerPos);
      if (dist < 3.2) {
        if (obj.userData.type === 'key') {
          this.collectKey(obj, i);
          return;
        } else if (obj.userData.type === 'dacia') {
          if (this.keysAcquired >= this.totalKeys) {
            this.triggerVictory();
          } else {
            this.audio.playDoorRattle();
            this.showAlert(`GATE LOCKED! YOU NEED ALL 4 KEYS (${this.keysAcquired}/${this.totalKeys})`);
          }
          return;
        }
      }
    }
  }

  collectKey(obj, index) {
    this.audio.playKeyPickup();
    this.keysAcquired++;

    // Update HUD
    const keyCountEl = document.getElementById('key-count');
    if (keyCountEl) keyCountEl.textContent = this.keysAcquired;

    const slotEl = document.getElementById(`slot-${obj.userData.keyId}`);
    if (slotEl) slotEl.classList.add('acquired');

    this.scene.remove(obj);
    this.interactiveObjects.splice(index, 1);

    this.showAlert(`ACQUIRED: ${obj.userData.name.toUpperCase()} (${this.keysAcquired}/4)`);

    if (this.keysAcquired >= this.totalKeys) {
      this.showAlert("ALL 4 KEYS SECURED! ESCAPE THROUGH THE NORTH COURTYARD DACIA DUSTER!");
      const objText = document.getElementById('objective-text');
      if (objText) objText.textContent = "Escape to the Dacia Duster 2019!";
    }
  }

  triggerVictory() {
    this.state = 'WIN';
    if (document.pointerLockElement) document.exitPointerLock();
    this.audio.playCarEngineStart();

    const survivalSec = Math.floor((performance.now() - this.gameStartTime) / 1000);
    const mins = String(Math.floor(survivalSec / 60)).padStart(2, '0');
    const secs = String(survivalSec % 60).padStart(2, '0');

    const winTimeEl = document.getElementById('win-survival-time');
    if (winTimeEl) winTimeEl.textContent = `${mins}:${secs}`;

    const winOverlay = document.getElementById('win-overlay');
    if (winOverlay) winOverlay.classList.remove('hidden');
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    if (document.pointerLockElement) document.exitPointerLock();
    this.audio.playJumpscare();

    const jumpscareOverlay = document.getElementById('jumpscare-overlay');
    if (jumpscareOverlay) jumpscareOverlay.classList.remove('hidden');

    setTimeout(() => {
      if (jumpscareOverlay) jumpscareOverlay.classList.add('hidden');
      const gameoverOverlay = document.getElementById('gameover-overlay');
      if (gameoverOverlay) gameoverOverlay.classList.remove('hidden');

      const survivalSec = Math.floor((performance.now() - this.gameStartTime) / 1000);
      const mins = String(Math.floor(survivalSec / 60)).padStart(2, '0');
      const secs = String(survivalSec % 60).padStart(2, '0');

      const finalKeys = document.getElementById('final-keys');
      if (finalKeys) finalKeys.textContent = `${this.keysAcquired} / 4`;
      const finalTime = document.getElementById('final-survival-time');
      if (finalTime) finalTime.textContent = `${mins}:${secs}`;
    }, 1100);
  }

  runGameLoop() {
    const animate = () => {
      if (this.state === 'PLAYING') {
        const dt = Math.min(this.clock.getDelta(), 0.1);
        this.updatePlayerMovement(dt);
        this.updateSpecterAI(dt);
        this.updateHUDAndProximity(dt);

        this.renderer.render(this.scene, this.camera);
      }
      if (this.state !== 'START' && this.state !== 'GAMEOVER' && this.state !== 'WIN') {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  updatePlayerMovement(dt) {
    const k = this.input.keys;
    const mc = this.mobileControls;

    let moveForward = k['KeyW'] || k['ArrowUp'] || k['KeyZ'] || mc.forward;
    let moveBackward = k['KeyS'] || k['ArrowDown'] || mc.backward;
    let moveLeft = k['KeyA'] || k['ArrowLeft'] || k['KeyQ'] || mc.left;
    let moveRight = k['KeyD'] || k['ArrowRight'] || mc.right;

    const dir = new THREE.Vector3();
    const yaw = this.player.rotation.yaw;

    const forwardVec = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const rightVec = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    if (moveForward) dir.add(forwardVec);
    if (moveBackward) dir.sub(forwardVec);
    if (moveLeft) dir.sub(rightVec);
    if (moveRight) dir.add(rightVec);

    dir.normalize();
    const speed = this.player.speed;
    this.player.velocity.x = dir.x * speed;
    this.player.velocity.z = dir.z * speed;

    const nextPos = this.player.position.clone().addScaledVector(this.player.velocity, dt);

    // Simple grid collision boundary check
    const gridRows = SCHOOL_GRID.length;
    const gridCols = SCHOOL_GRID[0].length;
    const offsetX = (gridCols * CELL_SIZE) / 2;
    const offsetZ = (gridRows * CELL_SIZE) / 2;

    const cellC = Math.floor((nextPos.x + offsetX) / CELL_SIZE);
    const cellR = Math.floor((nextPos.z + offsetZ) / CELL_SIZE);

    if (cellR >= 0 && cellR < gridRows && cellC >= 0 && cellC < gridCols) {
      if (SCHOOL_GRID[cellR][cellC] !== 1) {
        this.player.position.copy(nextPos);
      }
    }

    // Update Camera position & rotation
    this.camera.position.copy(this.player.position);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotation.y = this.player.rotation.yaw;
    this.camera.rotation.x = this.player.rotation.pitch;

    // Footstep audio trigger
    if ((moveForward || moveBackward || moveLeft || moveRight) && Math.random() < 0.12) {
      this.audio.playFootstep();
    }

    // Check crosshair target interaction highlight
    this.checkInteractionRaycast();
  }

  checkInteractionRaycast() {
    const playerPos = this.player.position;
    let foundInteractable = false;

    for (let i = 0; i < this.interactiveObjects.length; i++) {
      const obj = this.interactiveObjects[i];
      if (obj.position.distanceTo(playerPos) < 3.2) {
        foundInteractable = true;
        break;
      }
    }

    const crosshair = document.getElementById('crosshair');
    const prompt = document.getElementById('interaction-prompt');
    const promptLabel = document.getElementById('prompt-label');

    if (foundInteractable) {
      if (crosshair) crosshair.classList.add('interactive');
      if (prompt) prompt.classList.remove('hidden');
    } else {
      if (crosshair) crosshair.classList.remove('interactive');
      if (prompt) prompt.classList.add('hidden');
    }
  }

  updateSpecterAI(dt) {
    if (!this.specter.active || !this.specter.mesh) return;

    const specterPos = this.specter.mesh.position;
    const playerPos = this.player.position;

    const dist = specterPos.distanceTo(playerPos);

    // Specter stalks towards player
    const dir = new THREE.Vector3().subVectors(playerPos, specterPos).normalize();
    specterPos.addScaledVector(dir, this.specter.speed * dt);
    specterPos.y = 0;
    this.specter.mesh.lookAt(playerPos.x, specterPos.y, playerPos.z);

    // Audio proximity & heartbeat intensity
    const proximityIntensity = Math.max(0, 1 - dist / 14);
    this.audio.updateMonsterProximity(proximityIntensity);

    // Trigger jumpscare game over if caught
    if (dist < 1.4) {
      this.triggerGameOver();
    }
  }

  updateHUDAndProximity(dt) {
    this.elapsedSeconds += dt;
    this.heartbeatTimer += dt;

    const bpm = this.audio.heartbeatBpm;
    const bpmEl = document.getElementById('bpm-display');
    if (bpmEl) bpmEl.textContent = bpm;

    const pulseInterval = 60 / bpm;
    if (this.heartbeatTimer >= pulseInterval) {
      this.heartbeatTimer = 0;
      this.audio.playHeartbeat();

      const vignette = document.getElementById('heartbeat-vignette');
      if (vignette) {
        vignette.classList.add('pulsing');
        setTimeout(() => vignette.classList.remove('pulsing'), 250);
      }
    }
  }
}

// Initialize the Master Game on window load
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new MidnightDetentionGame();
});
