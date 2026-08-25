// Web Audio API Ambient Soundscape & Generative Synthesizer Engine
import { appState } from './state.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.riverGain = null;
    this.riverNode = null;
    this.isPlaying = false;
    this.chimeTimer = null;
    this.pelogFrequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // Slendro/Pelog harmonic base
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    appState.set('audioEnabled', true);
    this.startRiverAmbient();
    this.startPeriodicGamelanChimes();
    this.updateAudioButtonState(true);
  }

  stop() {
    if (!this.ctx) return;
    this.isPlaying = false;
    appState.set('audioEnabled', false);

    if (this.riverGain) {
      this.riverGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
    }
    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    this.updateAudioButtonState(false);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  // Generative pink noise river stream synthesizer
  startRiverAmbient() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    // Subtle LFO water oscillation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    this.riverGain = this.ctx.createGain();
    this.riverGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.riverGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 2);

    whiteNoise.connect(filter);
    filter.connect(this.riverGain);
    this.riverGain.connect(this.masterGain);

    whiteNoise.start();
    this.riverNode = whiteNoise;
  }

  // Generative meditative pentatonic gamelan chime
  playGamelanBell(freq = null) {
    if (!this.ctx || !this.isPlaying) return;
    const frequency = freq || this.pelogFrequencies[Math.floor(Math.random() * this.pelogFrequencies.length)];

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2.76, this.ctx.currentTime); // Inharmonic partial for bronze chime

    bellGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    bellGain.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 0.04);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

    osc.connect(bellGain);
    osc2.connect(bellGain);
    bellGain.connect(this.masterGain);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 4.6);
    osc2.stop(this.ctx.currentTime + 4.6);
  }

  startPeriodicGamelanChimes() {
    this.playGamelanBell(392.00);
    this.chimeTimer = setInterval(() => {
      if (this.isPlaying && Math.random() > 0.3) {
        this.playGamelanBell();
      }
    }, 6000);
  }

  playUiClick() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  updateAudioButtonState(active) {
    const btn = document.querySelector('.audio-toggle-btn');
    if (!btn) return;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
    const label = btn.querySelector('.audio-btn-label');
    if (label) {
      const currentLang = appState.get('lang');
      label.textContent = active 
        ? (currentLang === 'id' ? 'Suara Aktif' : 'Audio On') 
        : (currentLang === 'id' ? 'Suara Ambien' : 'Ambient Audio');
    }
  }
}

export const audioManager = new AudioManager();
