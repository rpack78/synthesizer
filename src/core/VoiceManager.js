// Voice Manager - Handles note playback and polyphony

import { getFrequency } from "../utils/utils.js";

export class VoiceManager {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.activeVoices = new Map();

    // Oscillator parameters
    this.osc1 = { wave: "sawtooth", detune: 0, level: 1.0 };
    this.osc2 = { wave: "square", detune: 7, level: 0.5 };
    this.noiseLevel = 0;
    this.octave = 4;

    // Filter parameters
    this.filter = {
      type: "lowpass",
      cutoff: 2000,
      resonance: 1,
      envAmount: 0,
      attack: 0.1,
      decay: 0.2,
    };

    // Amplitude envelope parameters
    this.ampEnv = {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.3,
    };

    // LFO parameters
    this.lfo = {
      wave: "sine",
      rate: 5,
      pitchDepth: 0,
      filterDepth: 0,
      ampDepth: 0,
    };
  }

  playNote(note, keyElement, octaveOffset = 0) {
    const noteId = `${note}_${octaveOffset}`;

    // If note is already playing, stop it first
    if (this.activeVoices.has(noteId)) {
      const oldVoice = this.activeVoices.get(noteId);
      this.cleanupVoice(oldVoice, noteId);
    }

    this.audioEngine.initialize();
    const audioContext = this.audioEngine.audioContext;

    const frequency =
      getFrequency(note, this.octave) * Math.pow(2, octaveOffset);
    const now = audioContext.currentTime;

    // Create voice object
    const voice = {
      oscillators: [],
      gainNodes: [],
      filter: null,
      filterEnvGain: null,
      ampGain: null,
      lfoOsc: null,
      lfoGains: {},
    };

    // Create filter
    voice.filter = audioContext.createBiquadFilter();
    voice.filter.type = this.filter.type;
    voice.filter.frequency.value = this.filter.cutoff;
    voice.filter.Q.value = this.filter.resonance;

    // Filter envelope modulation
    if (this.filter.envAmount !== 0) {
      const filterAttackEnd = now + this.filter.attack;
      const filterDecayEnd = filterAttackEnd + this.filter.decay;

      voice.filter.frequency.setValueAtTime(this.filter.cutoff, now);
      voice.filter.frequency.linearRampToValueAtTime(
        this.filter.cutoff + this.filter.envAmount,
        filterAttackEnd
      );
      voice.filter.frequency.linearRampToValueAtTime(
        this.filter.cutoff,
        filterDecayEnd
      );
    }

    // Create LFO
    if (
      this.lfo.pitchDepth > 0 ||
      this.lfo.filterDepth > 0 ||
      this.lfo.ampDepth > 0
    ) {
      voice.lfoOsc = audioContext.createOscillator();
      voice.lfoOsc.type = this.lfo.wave;
      voice.lfoOsc.frequency.value = this.lfo.rate;
      voice.lfoOsc.start(now);
    }

    // Create oscillator 1
    if (this.osc1.level > 0) {
      this.createOscillator(audioContext, voice, frequency, this.osc1, now);
    }

    // Create oscillator 2
    if (this.osc2.level > 0) {
      this.createOscillator(audioContext, voice, frequency, this.osc2, now);
    }

    // Create noise source
    if (this.noiseLevel > 0) {
      this.createNoise(audioContext, voice, now);
    }

    // LFO filter modulation
    if (voice.lfoOsc && this.lfo.filterDepth > 0) {
      const lfoFilterGain = audioContext.createGain();
      lfoFilterGain.gain.value = this.lfo.filterDepth;
      voice.lfoOsc.connect(lfoFilterGain);
      lfoFilterGain.connect(voice.filter.frequency);
    }

    // Create amplitude gain node with envelope
    voice.ampGain = audioContext.createGain();
    voice.ampGain.gain.value = 0;

    // Connect filter to amp gain
    voice.filter.connect(voice.ampGain);

    // LFO amplitude modulation
    if (voice.lfoOsc && this.lfo.ampDepth > 0) {
      const lfoAmpGain = audioContext.createGain();
      lfoAmpGain.gain.value = this.lfo.ampDepth;
      voice.lfoOsc.connect(lfoAmpGain);
      lfoAmpGain.connect(voice.ampGain.gain);
    }

    // Connect to master
    voice.ampGain.connect(this.audioEngine.masterGain);

    // Amplitude ADSR Envelope
    const attackEnd = now + this.ampEnv.attack;
    const decayEnd = attackEnd + this.ampEnv.decay;

    voice.ampGain.gain.setValueAtTime(0, now);
    voice.ampGain.gain.linearRampToValueAtTime(1, attackEnd);
    voice.ampGain.gain.linearRampToValueAtTime(this.ampEnv.sustain, decayEnd);

    // Store voice
    this.activeVoices.set(noteId, voice);

    // Update master gain for polyphony compensation
    this.audioEngine.updateMasterGainForPolyphony(this.activeVoices.size);

    // Safety timeout
    voice.safetyTimeout = setTimeout(() => {
      if (this.activeVoices.has(noteId)) {
        this.stopNote(noteId, keyElement);
      }
    }, 60000);

    // Visual feedback
    if (keyElement) {
      keyElement.classList.add("active");
    }

    return noteId;
  }

  createOscillator(audioContext, voice, frequency, oscParams, now) {
    const osc = audioContext.createOscillator();
    osc.type = oscParams.wave;
    osc.frequency.value = frequency;
    osc.detune.value = oscParams.detune;

    const gain = audioContext.createGain();
    gain.gain.value = oscParams.level;

    // LFO pitch modulation
    if (voice.lfoOsc && this.lfo.pitchDepth > 0) {
      const lfoGain = audioContext.createGain();
      lfoGain.gain.value = this.lfo.pitchDepth;
      voice.lfoOsc.connect(lfoGain);
      lfoGain.connect(osc.detune);
    }

    osc.connect(gain);
    gain.connect(voice.filter);
    osc.start(now);

    voice.oscillators.push(osc);
    voice.gainNodes.push(gain);
  }

  createNoise(audioContext, voice, now) {
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = this.noiseLevel;

    noise.connect(noiseGain);
    noiseGain.connect(voice.filter);
    noise.start(now);

    voice.oscillators.push(noise);
    voice.gainNodes.push(noiseGain);
  }

  stopNote(noteId, keyElement) {
    if (!this.activeVoices.has(noteId)) {
      return;
    }

    const voice = this.activeVoices.get(noteId);
    const audioContext = this.audioEngine.audioContext;
    const now = audioContext.currentTime;

    // Clear safety timeout
    if (voice.safetyTimeout) {
      clearTimeout(voice.safetyTimeout);
    }

    // Release envelope
    voice.ampGain.gain.cancelScheduledValues(now);
    voice.ampGain.gain.setValueAtTime(voice.ampGain.gain.value, now);
    voice.ampGain.gain.linearRampToValueAtTime(0, now + this.ampEnv.release);

    // Stop all oscillators after release
    voice.oscillators.forEach((osc) => {
      try {
        osc.stop(now + this.ampEnv.release);
      } catch (e) {
        // Already stopped
      }
    });

    // Stop LFO
    if (voice.lfoOsc) {
      try {
        voice.lfoOsc.stop(now + this.ampEnv.release);
      } catch (e) {
        // Already stopped
      }
    }

    // Remove from active voices
    this.activeVoices.delete(noteId);
    this.audioEngine.updateMasterGainForPolyphony(this.activeVoices.size);

    // Schedule cleanup
    voice.cleanupTimeout = setTimeout(() => {
      try {
        voice.ampGain.disconnect();
        voice.filter.disconnect();
        voice.gainNodes.forEach((g) => g.disconnect());
      } catch (e) {}
    }, this.ampEnv.release * 1000 + 50);

    // Visual feedback
    if (keyElement) {
      keyElement.classList.remove("active");
    }
  }

  cleanupVoice(voice, noteId) {
    // Cancel any pending cleanup
    if (voice.cleanupTimeout) {
      clearTimeout(voice.cleanupTimeout);
    }
    if (voice.safetyTimeout) {
      clearTimeout(voice.safetyTimeout);
    }
    // Stop oscillators immediately
    const now = this.audioEngine.audioContext.currentTime;
    voice.oscillators.forEach((osc) => {
      try {
        osc.stop(now);
      } catch (e) {}
    });
    if (voice.lfoOsc) {
      try {
        voice.lfoOsc.stop(now);
      } catch (e) {}
    }
    this.activeVoices.delete(noteId);
  }

  stopAllNotes() {
    const notesToStop = Array.from(this.activeVoices.keys());
    notesToStop.forEach((noteId) => {
      this.stopNote(noteId, null);
    });
  }
}
