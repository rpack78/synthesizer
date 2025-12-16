// MIDI Controller - Handles MIDI input and mapping

import { showMIDIMessage } from "../utils/utils.js";

export class MIDIController {
  constructor(voiceManager, audioEngine) {
    this.voiceManager = voiceManager;
    this.audioEngine = audioEngine;
    this.midiAccess = null;
    this.midiInputs = [];
    this.activeNotes = new Map(); // Track MIDI note numbers to noteId mapping
  }

  setup() {
    const connectBtn = document.getElementById("midi-connect-btn");
    const deviceSelect = document.getElementById("midi-device-select");

    connectBtn.addEventListener("click", () => {
      this.requestMIDIAccess();
    });

    deviceSelect.addEventListener("change", (e) => {
      this.selectMIDIDevice(e.target.value);
    });
  }

  async requestMIDIAccess() {
    if (!navigator.requestMIDIAccess) {
      showMIDIMessage("Web MIDI API not supported in this browser", "error");
      return;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      showMIDIMessage("MIDI Access Granted!", "success");
      this.updateMIDIDeviceList();

      // Listen for device changes
      this.midiAccess.onstatechange = () => {
        this.updateMIDIDeviceList();
      };
    } catch (error) {
      showMIDIMessage("MIDI Access Denied: " + error.message, "error");
    }
  }

  updateMIDIDeviceList() {
    const deviceSelect = document.getElementById("midi-device-select");
    const statusText = document.getElementById("midi-status-text");
    const indicator = document.getElementById("midi-indicator");

    deviceSelect.innerHTML = "";
    this.midiInputs = [];

    const inputs = Array.from(this.midiAccess.inputs.values());

    if (inputs.length === 0) {
      deviceSelect.innerHTML =
        '<option value="">No MIDI devices found</option>';
      deviceSelect.disabled = true;
      statusText.textContent = "No MIDI Devices";
      indicator.classList.remove("connected");
    } else {
      deviceSelect.disabled = false;
      inputs.forEach((input, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = input.name || `MIDI Device ${index + 1}`;
        deviceSelect.appendChild(option);
        this.midiInputs.push(input);
      });

      // Auto-select first device
      if (inputs.length > 0) {
        this.selectMIDIDevice(0);
      }
    }
  }

  selectMIDIDevice(index) {
    // Disconnect all previous inputs
    this.midiInputs.forEach((input) => {
      input.onmidimessage = null;
    });

    if (index === "" || index < 0 || index >= this.midiInputs.length) {
      return;
    }

    const input = this.midiInputs[index];
    const statusText = document.getElementById("midi-status-text");
    const indicator = document.getElementById("midi-indicator");

    // Set up MIDI message handler
    input.onmidimessage = (event) => {
      this.handleMIDIMessage(event);
    };

    statusText.textContent = `Connected: ${input.name || "MIDI Device"}`;
    indicator.classList.add("connected");
    showMIDIMessage(`Using ${input.name || "MIDI Device"}`, "success");
  }

  handleMIDIMessage(event) {
    const [command, note, velocity] = event.data;
    const channel = command & 0x0f;
    const messageType = command & 0xf0;

    switch (messageType) {
      case 0x90: // Note On
        if (velocity > 0) {
          this.handleMIDINoteOn(note, velocity);
        } else {
          this.handleMIDINoteOff(note);
        }
        break;
      case 0x80: // Note Off
        this.handleMIDINoteOff(note);
        break;
      case 0xb0: // Control Change
        this.handleMIDIControlChange(note, velocity);
        break;
    }
  }

  handleMIDINoteOn(midiNote, velocity) {
    // If this MIDI note is already playing, stop it first
    if (this.activeNotes.has(midiNote)) {
      this.handleMIDINoteOff(midiNote);
    }

    // Convert MIDI note to frequency
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    const noteId = `midi_${midiNote}`;

    this.audioEngine.initialize();
    const audioContext = this.audioEngine.audioContext;
    const now = audioContext.currentTime;

    // Create voice with MIDI velocity
    const voice = this.createMIDIVoice(frequency, velocity, now);

    // Store voice
    this.voiceManager.activeVoices.set(noteId, voice);
    this.activeNotes.set(midiNote, noteId);

    // Update master gain for polyphony
    this.audioEngine.updateMasterGainForPolyphony(
      this.voiceManager.activeVoices.size
    );

    // Safety timeout
    voice.safetyTimeout = setTimeout(() => {
      if (this.voiceManager.activeVoices.has(noteId)) {
        this.handleMIDINoteOff(midiNote);
      }
    }, 60000);
  }

  createMIDIVoice(frequency, velocity, now) {
    const audioContext = this.audioEngine.audioContext;
    const voice = {
      oscillators: [],
      gainNodes: [],
      filter: null,
      ampGain: null,
      lfoOsc: null,
      lfoGains: {},
    };

    // Create filter
    voice.filter = audioContext.createBiquadFilter();
    voice.filter.type = this.voiceManager.filter.type;
    voice.filter.frequency.value = this.voiceManager.filter.cutoff;
    voice.filter.Q.value = this.voiceManager.filter.resonance;

    // Filter envelope
    if (this.voiceManager.filter.envAmount !== 0) {
      const filterAttackEnd = now + this.voiceManager.filter.attack;
      const filterDecayEnd = filterAttackEnd + this.voiceManager.filter.decay;

      voice.filter.frequency.setValueAtTime(
        this.voiceManager.filter.cutoff,
        now
      );
      voice.filter.frequency.linearRampToValueAtTime(
        this.voiceManager.filter.cutoff + this.voiceManager.filter.envAmount,
        filterAttackEnd
      );
      voice.filter.frequency.linearRampToValueAtTime(
        this.voiceManager.filter.cutoff,
        filterDecayEnd
      );
    }

    // Create LFO
    if (
      this.voiceManager.lfo.pitchDepth > 0 ||
      this.voiceManager.lfo.filterDepth > 0 ||
      this.voiceManager.lfo.ampDepth > 0
    ) {
      voice.lfoOsc = audioContext.createOscillator();
      voice.lfoOsc.type = this.voiceManager.lfo.wave;
      voice.lfoOsc.frequency.value = this.voiceManager.lfo.rate;
      voice.lfoOsc.start(now);
    }

    // Create oscillators with velocity sensitivity
    const velocityFactor = velocity / 127;

    if (this.voiceManager.osc1.level > 0) {
      this.createOscillator(
        audioContext,
        voice,
        frequency,
        this.voiceManager.osc1,
        velocityFactor,
        now
      );
    }

    if (this.voiceManager.osc2.level > 0) {
      this.createOscillator(
        audioContext,
        voice,
        frequency,
        this.voiceManager.osc2,
        velocityFactor,
        now
      );
    }

    if (this.voiceManager.noiseLevel > 0) {
      this.createNoise(audioContext, voice, velocityFactor, now);
    }

    // LFO filter modulation
    if (voice.lfoOsc && this.voiceManager.lfo.filterDepth > 0) {
      const lfoFilterGain = audioContext.createGain();
      lfoFilterGain.gain.value = this.voiceManager.lfo.filterDepth;
      voice.lfoOsc.connect(lfoFilterGain);
      lfoFilterGain.connect(voice.filter.frequency);
    }

    // Amplitude gain with envelope
    voice.ampGain = audioContext.createGain();
    voice.ampGain.gain.value = 0;
    voice.filter.connect(voice.ampGain);

    // LFO amplitude modulation
    if (voice.lfoOsc && this.voiceManager.lfo.ampDepth > 0) {
      const lfoAmpGain = audioContext.createGain();
      lfoAmpGain.gain.value = this.voiceManager.lfo.ampDepth;
      voice.lfoOsc.connect(lfoAmpGain);
      lfoAmpGain.connect(voice.ampGain.gain);
    }

    voice.ampGain.connect(this.audioEngine.masterGain);

    // ADSR Envelope
    const attackEnd = now + this.voiceManager.ampEnv.attack;
    const decayEnd = attackEnd + this.voiceManager.ampEnv.decay;

    voice.ampGain.gain.setValueAtTime(0, now);
    voice.ampGain.gain.linearRampToValueAtTime(1, attackEnd);
    voice.ampGain.gain.linearRampToValueAtTime(
      this.voiceManager.ampEnv.sustain,
      decayEnd
    );

    return voice;
  }

  createOscillator(
    audioContext,
    voice,
    frequency,
    oscParams,
    velocityFactor,
    now
  ) {
    const osc = audioContext.createOscillator();
    osc.type = oscParams.wave;
    osc.frequency.value = frequency;
    osc.detune.value = oscParams.detune;

    const gain = audioContext.createGain();
    gain.gain.value = oscParams.level * velocityFactor;

    if (voice.lfoOsc && this.voiceManager.lfo.pitchDepth > 0) {
      const lfoGain = audioContext.createGain();
      lfoGain.gain.value = this.voiceManager.lfo.pitchDepth;
      voice.lfoOsc.connect(lfoGain);
      lfoGain.connect(osc.detune);
    }

    osc.connect(gain);
    gain.connect(voice.filter);
    osc.start(now);

    voice.oscillators.push(osc);
    voice.gainNodes.push(gain);
  }

  createNoise(audioContext, voice, velocityFactor, now) {
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
    noiseGain.gain.value = this.voiceManager.noiseLevel * velocityFactor;

    noise.connect(noiseGain);
    noiseGain.connect(voice.filter);
    noise.start(now);

    voice.oscillators.push(noise);
    voice.gainNodes.push(noiseGain);
  }

  handleMIDINoteOff(midiNote) {
    const noteId = this.activeNotes.get(midiNote);
    if (!noteId || !this.voiceManager.activeVoices.has(noteId)) {
      return;
    }

    const voice = this.voiceManager.activeVoices.get(noteId);
    const audioContext = this.audioEngine.audioContext;
    const now = audioContext.currentTime;

    // Clear safety timeout
    if (voice.safetyTimeout) {
      clearTimeout(voice.safetyTimeout);
    }

    // Release envelope
    voice.ampGain.gain.cancelScheduledValues(now);
    voice.ampGain.gain.setValueAtTime(voice.ampGain.gain.value, now);
    voice.ampGain.gain.linearRampToValueAtTime(
      0,
      now + this.voiceManager.ampEnv.release
    );

    // Stop oscillators
    voice.oscillators.forEach((osc) => {
      try {
        osc.stop(now + this.voiceManager.ampEnv.release);
      } catch (e) {}
    });

    if (voice.lfoOsc) {
      try {
        voice.lfoOsc.stop(now + this.voiceManager.ampEnv.release);
      } catch (e) {}
    }

    // Remove from active voices
    this.voiceManager.activeVoices.delete(noteId);
    this.activeNotes.delete(midiNote);
    this.audioEngine.updateMasterGainForPolyphony(
      this.voiceManager.activeVoices.size
    );

    // Schedule cleanup
    voice.cleanupTimeout = setTimeout(() => {
      try {
        voice.ampGain.disconnect();
        voice.filter.disconnect();
        voice.gainNodes.forEach((g) => g.disconnect());
      } catch (e) {}
    }, this.voiceManager.ampEnv.release * 1000 + 50);
  }

  handleMIDIControlChange(ccNumber, value) {
    const normalized = value / 127;

    switch (ccNumber) {
      case 1: // Mod Wheel -> LFO Pitch Depth
        this.voiceManager.lfo.pitchDepth = value * 0.78;
        this.updateUISlider("lfo-pitch-depth", value * 0.78);
        break;
      case 74: // Brightness -> Filter Cutoff
        this.voiceManager.filter.cutoff = 20 + normalized * 19980;
        this.updateUISlider("filter-cutoff", this.voiceManager.filter.cutoff);
        break;
      case 71: // Resonance -> Filter Resonance
        this.voiceManager.filter.resonance = 0.1 + normalized * 29.9;
        this.updateUISlider(
          "filter-resonance",
          this.voiceManager.filter.resonance
        );
        break;
      case 73: // Attack Time
        this.voiceManager.ampEnv.attack = normalized * 2;
        this.updateUISlider("attack", this.voiceManager.ampEnv.attack);
        break;
      case 72: // Release Time
        this.voiceManager.ampEnv.release = normalized * 3;
        this.updateUISlider("release", this.voiceManager.ampEnv.release);
        break;
      case 7: // Volume
        this.audioEngine.setMasterVolume(normalized);
        this.updateUISlider("master-volume", value * 0.78);
        break;
      case 91: // Reverb
        this.audioEngine.effects.reverbMix = normalized;
        this.updateUISlider("reverb-mix", value * 0.78);
        if (this.audioEngine.reverbWet) {
          this.audioEngine.reverbWet.gain.value = normalized;
        }
        break;
    }
  }

  updateUISlider(id, value) {
    const slider = document.getElementById(id);
    const valueDisplay = document.getElementById(`${id}-value`);
    if (slider && valueDisplay) {
      slider.value = value;
      valueDisplay.textContent = value;
    }
  }
}
