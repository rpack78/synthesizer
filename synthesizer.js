// Advanced Web Synthesizer with Multi-Oscillator, Filters, LFO, and Effects
class Synthesizer {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeVoices = new Map();
        this.analyser = null;
        this.visualizerCanvas = null;
        this.visualizerContext = null;
        
        // Audio nodes for effects
        this.delayNode = null;
        this.delayFeedback = null;
        this.delayWet = null;
        this.delayDry = null;
        this.convolver = null;
        this.reverbWet = null;
        this.reverbDry = null;
        
        // Oscillator parameters
        this.osc1 = { wave: 'sawtooth', detune: 0, level: 1.0 };
        this.osc2 = { wave: 'square', detune: 7, level: 0.5 };
        this.noiseLevel = 0;
        this.octave = 4;
        
        // Filter parameters
        this.filter = {
            type: 'lowpass',
            cutoff: 2000,
            resonance: 1,
            envAmount: 0,
            attack: 0.1,
            decay: 0.2
        };
        
        // Amplitude envelope parameters
        this.ampEnv = {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.7,
            release: 0.3
        };
        
        // LFO parameters
        this.lfo = {
            wave: 'sine',
            rate: 5,
            pitchDepth: 0,
            filterDepth: 0,
            ampDepth: 0
        };
        
        // Effects parameters
        this.effects = {
            delayTime: 0.3,
            delayFeedback: 0.3,
            delayMix: 0,
            reverbMix: 0
        };
        
        this.masterVolume = 0.5;
        
        // Preset system
        this.presets = this.initializePresets();
        this.customPresets = this.loadCustomPresets();
        
        // Note frequencies (A4 = 440Hz)
        this.noteFrequencies = {
            'C': 261.63,
            'C#': 277.18,
            'D': 293.66,
            'D#': 311.13,
            'E': 329.63,
            'F': 349.23,
            'F#': 369.99,
            'G': 392.00,
            'G#': 415.30,
            'A': 440.00,
            'A#': 466.16,
            'B': 493.88
        };
        
        this.init();
    }
    
    initializePresets() {
        return {
            bass: [
                {
                    name: "Deep Sub Bass",
                    osc1: { wave: 'sine', detune: 0, level: 100 },
                    osc2: { wave: 'sine', detune: -12, level: 50 },
                    noiseLevel: 0,
                    octave: 3,
                    filter: { type: 'lowpass', cutoff: 200, resonance: 1, envAmount: 0, attack: 0.01, decay: 0.1 },
                    ampEnv: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 },
                    lfo: { wave: 'sine', rate: 5, pitchDepth: 0, filterDepth: 0, ampDepth: 0 },
                    effects: { delayTime: 0.3, delayFeedback: 30, delayMix: 0, reverbMix: 10 },
                    masterVolume: 60
                },
                {
                    name: "Funky Bass",
                    osc1: { wave: 'sawtooth', detune: 0, level: 100 },
                    osc2: { wave: 'square', detune: 7, level: 40 },
                    noiseLevel: 5,
                    octave: 3,
                    filter: { type: 'lowpass', cutoff: 800, resonance: 8, envAmount: 1200, attack: 0.01, decay: 0.15 },
                    ampEnv: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2 },
                    lfo: { wave: 'sine', rate: 6, pitchDepth: 0, filterDepth: 0, ampDepth: 0 },
                    effects: { delayTime: 0.3, delayFeedback: 20, delayMix: 0, reverbMix: 5 },
                    masterVolume: 55
                },
                {
                    name: "Acid Bass",
                    osc1: { wave: 'sawtooth', detune: 0, level: 100 },
                    osc2: { wave: 'square', detune: 0, level: 70 },
                    noiseLevel: 0,
                    octave: 3,
                    filter: { type: 'lowpass', cutoff: 400, resonance: 20, envAmount: 3000, attack: 0.01, decay: 0.4 },
                    ampEnv: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.2 },
                    lfo: { wave: 'sine', rate: 8, pitchDepth: 0, filterDepth: 1500, ampDepth: 0 },
                    effects: { delayTime: 0.3, delayFeedback: 25, delayMix: 15, reverbMix: 20 },
                    masterVolume: 50
                },
                {
                    name: "Wobble Bass",
                    osc1: { wave: 'sawtooth', detune: 0, level: 100 },
                    osc2: { wave: 'square', detune: -7, level: 80 },
                    noiseLevel: 0,
                    octave: 3,
                    filter: { type: 'lowpass', cutoff: 1500, resonance: 10, envAmount: 0, attack: 0.01, decay: 0.1 },
                    ampEnv: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.3 },
                    lfo: { wave: 'square', rate: 4, pitchDepth: 0, filterDepth: 2500, ampDepth: 0 },
                    effects: { delayTime: 0.3, delayFeedback: 30, delayMix: 0, reverbMix: 15 },
                    masterVolume: 50
                },
                {
                    name: "Punch Bass",
                    osc1: { wave: 'triangle', detune: 0, level: 100 },
                    osc2: { wave: 'sine', detune: -12, level: 60 },
                    noiseLevel: 10,
                    octave: 3,
                    filter: { type: 'lowpass', cutoff: 600, resonance: 3, envAmount: 800, attack: 0.001, decay: 0.1 },
                    ampEnv: { attack: 0.001, decay: 0.15, sustain: 0.6, release: 0.25 },
                    lfo: { wave: 'sine', rate: 5, pitchDepth: 0, filterDepth: 0, ampDepth: 0 },
                    effects: { delayTime: 0.3, delayFeedback: 20, delayMix: 0, reverbMix: 5 },
                    masterVolume: 60
                }
            ],
            lead: [
                {
                    name: "Classic Lead",
                    osc1: { wave: 'sawtooth', detune: 0, level: 100 },
                    osc2: { wave: 'sawtooth', detune: 7, level: 70 },
                    noiseLevel: 0,
                    octave: 5,
                    filter: { type: 'lowpass', cutoff: 3000, resonance: 5, envAmount: 2000, attack: 0.05, decay: 0.3 },
                    ampEnv: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.4 },
                    lfo: { wave: 'sine', rate: 5, pitchDepth: 20, filterDepth: 0, ampDepth: 0 },
                    effects: { delayTime: 0.375, delayFeedback: 35, delayMix: 25, reverbMix: 30 },
                    masterVolume: 50
                },
                {
                    name: "Square Lead",
                    osc1: { wave: 'square', detune: 0, level: 100 },
                    osc2: { wave: 'square', detune: -5, level: 80 },
                    noiseLevel: 0,
                    octave: 5,
                    filter: { type: 'lowpass', cutoff: 2500, resonance: 3, envAmount: 1500, attack: 0.08, decay: 0.25 },
                    ampEnv: { attack: 0.02, decay: 0.15, sustain: 0.8, release: 0.3 },
                    lfo: { wave: 'sine', rate: 6, pitchDepth: 15, filterDepth: 0, ampDepth: 0 },
                    effects: { delayTime: 0.25, delayFeedback: 40, delayMix: 20, reverbMix: 25 },
                    masterVolume: 50
                },
                {
                    name: "Synth Brass",
                    osc1: { wave: 'sawtooth', detune: 0, level: 100 },
                    osc2: { wave: 'sawtooth', detune: -7, level: 90 },
                    noiseLevel: 5,
                    octave: 4,
                    filter: { type: 'lowpass', cutoff: 2000, resonance: 6, envAmount: 1000, attack: 0.2, decay: 0.3 },
                    ampEnv: { attack: 0.15, decay: 0.2, sustain: 0.8, release: 0.5 },
                    lfo: { wave: 'sine', rate: 4, pitchDepth: 10, filterDepth: 300, ampDepth: 5 },
                    effects: { delayTime: 0.3, delayFeedback: 25, delayMix: 15, reverbMix: 35 },
                    masterVolume: 55
                },
                {
                    name: "Pluck Lead",
                    osc1: { wave: 'sawtooth', detune: 0, level: 100 },
                    osc2: { wave: 'triangle', detune: 12, level: 50 },
                    noiseLevel: 8,
                    octave: 5,
                    filter: { type: 'lowpass', cutoff: 4000, resonance: 2, envAmount: 3000, attack: 0.001, decay: 0.15 },
                    ampEnv: { attack: 0.001, decay: 0.2, sustain: 0.3, release: 0.2 },
                    lfo: { wave: 'sine', rate: 5, pitchDepth: 0, filterDepth: 0, ampDepth: 0 },
                    effects: { delayTime: 0.5, delayFeedback: 45, delayMix: 35, reverbMix: 40 },
                    masterVolume: 55
                },
                {
                    name: "Distorted Lead",
                    osc1: { wave: 'square', detune: 0, level: 100 },
                    osc2: { wave: 'sawtooth', detune: 14, level: 100 },
                    noiseLevel: 3,
                    octave: 5,
                    filter: { type: 'lowpass', cutoff: 3500, resonance: 15, envAmount: 2500, attack: 0.02, decay: 0.2 },
                    ampEnv: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.3 },
                    lfo: { wave: 'sine', rate: 7, pitchDepth: 25, filterDepth: 500, ampDepth: 0 },
                    effects: { delayTime: 0.3, delayFeedback: 50, delayMix: 30, reverbMix: 25 },
                    masterVolume: 45
                }
            ],
            pad: [
                {
                    name: "Warm Pad",
                    osc1: { wave: 'sawtooth', detune: 0, level: 80 },
                    osc2: { wave: 'sawtooth', detune: 7, level: 80 },
                    noiseLevel: 0,
                    octave: 4,
                    filter: { type: 'lowpass', cutoff: 1500, resonance: 1, envAmount: 500, attack: 0.8, decay: 0.5 },
                    ampEnv: { attack: 0.8, decay: 0.3, sustain: 0.7, release: 1.2 },
                    lfo: { wave: 'sine', rate: 0.5, pitchDepth: 8, filterDepth: 300, ampDepth: 10 },
                    effects: { delayTime: 0.5, delayFeedback: 40, delayMix: 20, reverbMix: 60 },
                    masterVolume: 40
                },
                {
                    name: "Strings Pad",
                    osc1: { wave: 'sawtooth', detune: -7, level: 70 },
                    osc2: { wave: 'sawtooth', detune: 7, level: 70 },
                    noiseLevel: 2,
                    octave: 4,
                    filter: { type: 'lowpass', cutoff: 2000, resonance: 2, envAmount: 800, attack: 1.0, decay: 0.8 },
                    ampEnv: { attack: 1.0, decay: 0.5, sustain: 0.8, release: 1.5 },
                    lfo: { wave: 'sine', rate: 0.3, pitchDepth: 5, filterDepth: 200, ampDepth: 8 },
                    effects: { delayTime: 0.4, delayFeedback: 35, delayMix: 15, reverbMix: 70 },
                    masterVolume: 45
                },
                {
                    name: "Choir Pad",
                    osc1: { wave: 'sine', detune: 0, level: 90 },
                    osc2: { wave: 'triangle', detune: 12, level: 60 },
                    noiseLevel: 3,
                    octave: 5,
                    filter: { type: 'lowpass', cutoff: 2500, resonance: 1.5, envAmount: 600, attack: 1.2, decay: 0.6 },
                    ampEnv: { attack: 1.2, decay: 0.4, sustain: 0.75, release: 1.8 },
                    lfo: { wave: 'sine', rate: 0.4, pitchDepth: 12, filterDepth: 400, ampDepth: 12 },
                    effects: { delayTime: 0.6, delayFeedback: 45, delayMix: 25, reverbMix: 75 },
                    masterVolume: 40
                },
                {
                    name: "Dark Pad",
                    osc1: { wave: 'triangle', detune: 0, level: 100 },
                    osc2: { wave: 'sine', detune: -12, level: 70 },
                    noiseLevel: 5,
                    octave: 3,
                    filter: { type: 'lowpass', cutoff: 800, resonance: 3, envAmount: 200, attack: 1.5, decay: 1.0 },
                    ampEnv: { attack: 1.5, decay: 0.6, sustain: 0.7, release: 2.0 },
                    lfo: { wave: 'triangle', rate: 0.2, pitchDepth: 3, filterDepth: 150, ampDepth: 15 },
                    effects: { delayTime: 0.7, delayFeedback: 50, delayMix: 30, reverbMix: 80 },
                    masterVolume: 45
                },
                {
                    name: "Shimmer Pad",
                    osc1: { wave: 'sine', detune: 0, level: 80 },
                    osc2: { wave: 'triangle', detune: 24, level: 60 },
                    noiseLevel: 8,
                    octave: 5,
                    filter: { type: 'bandpass', cutoff: 3000, resonance: 5, envAmount: 1000, attack: 0.9, decay: 0.7 },
                    ampEnv: { attack: 0.9, decay: 0.5, sustain: 0.6, release: 1.5 },
                    lfo: { wave: 'sine', rate: 2, pitchDepth: 20, filterDepth: 800, ampDepth: 20 },
                    effects: { delayTime: 0.5, delayFeedback: 60, delayMix: 40, reverbMix: 85 },
                    masterVolume: 40
                }
            ],
            fx: [
                {
                    name: "Laser Zap",
                    osc1: { wave: 'square', detune: 0, level: 100 },
                    osc2: { wave: 'sawtooth', detune: 7, level: 80 },
                    noiseLevel: 15,
                    octave: 6,
                    filter: { type: 'bandpass', cutoff: 5000, resonance: 20, envAmount: -4000, attack: 0.001, decay: 0.3 },
                    ampEnv: { attack: 0.001, decay: 0.4, sustain: 0.2, release: 0.3 },
                    lfo: { wave: 'sawtooth', rate: 15, pitchDepth: 100, filterDepth: 3000, ampDepth: 0 },
                    effects: { delayTime: 0.15, delayFeedback: 60, delayMix: 40, reverbMix: 50 },
                    masterVolume: 50
                },
                {
                    name: "Space Sweep",
                    osc1: { wave: 'sine', detune: 0, level: 90 },
                    osc2: { wave: 'triangle', detune: 19, level: 70 },
                    noiseLevel: 20,
                    octave: 5,
                    filter: { type: 'highpass', cutoff: 200, resonance: 8, envAmount: 3000, attack: 2.0, decay: 1.5 },
                    ampEnv: { attack: 0.5, decay: 1.0, sustain: 0.5, release: 2.0 },
                    lfo: { wave: 'sine', rate: 0.3, pitchDepth: 50, filterDepth: 2000, ampDepth: 30 },
                    effects: { delayTime: 0.8, delayFeedback: 70, delayMix: 60, reverbMix: 90 },
                    masterVolume: 45
                },
                {
                    name: "Robot Voice",
                    osc1: { wave: 'square', detune: 0, level: 100 },
                    osc2: { wave: 'square', detune: -24, level: 100 },
                    noiseLevel: 25,
                    octave: 4,
                    filter: { type: 'bandpass', cutoff: 1500, resonance: 15, envAmount: 0, attack: 0.01, decay: 0.1 },
                    ampEnv: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 },
                    lfo: { wave: 'square', rate: 8, pitchDepth: 0, filterDepth: 1000, ampDepth: 50 },
                    effects: { delayTime: 0.2, delayFeedback: 50, delayMix: 30, reverbMix: 40 },
                    masterVolume: 50
                },
                {
                    name: "Wind Noise",
                    osc1: { wave: 'sine', detune: 0, level: 30 },
                    osc2: { wave: 'triangle', detune: 12, level: 30 },
                    noiseLevel: 100,
                    octave: 3,
                    filter: { type: 'bandpass', cutoff: 2000, resonance: 5, envAmount: 0, attack: 0.5, decay: 0.5 },
                    ampEnv: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 2.5 },
                    lfo: { wave: 'sine', rate: 0.5, pitchDepth: 0, filterDepth: 1500, ampDepth: 40 },
                    effects: { delayTime: 0.6, delayFeedback: 60, delayMix: 40, reverbMix: 85 },
                    masterVolume: 45
                },
                {
                    name: "Glitch Hit",
                    osc1: { wave: 'square', detune: 0, level: 100 },
                    osc2: { wave: 'sawtooth', detune: 31, level: 100 },
                    noiseLevel: 40,
                    octave: 5,
                    filter: { type: 'notch', cutoff: 3000, resonance: 25, envAmount: -2000, attack: 0.001, decay: 0.05 },
                    ampEnv: { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.15 },
                    lfo: { wave: 'square', rate: 20, pitchDepth: 200, filterDepth: 4000, ampDepth: 80 },
                    effects: { delayTime: 0.1, delayFeedback: 80, delayMix: 50, reverbMix: 60 },
                    masterVolume: 50
                }
            ]
        };
    }
    
    loadCustomPresets() {
        const stored = localStorage.getItem('synthCustomPresets');
        return stored ? JSON.parse(stored) : [];
    }
    
    saveCustomPresetsToStorage() {
        localStorage.setItem('synthCustomPresets', JSON.stringify(this.customPresets));
    }
    
    init() {
        // Initialize audio context on user interaction
        document.addEventListener('click', () => this.initAudioContext(), { once: true });
        document.addEventListener('keydown', () => this.initAudioContext(), { once: true });
        
        this.setupControls();
        this.setupKeyboard();
        this.setupVisualizer();
        this.setupPresetControls();
    }
    
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Setup effects chain
            this.setupEffects();
            
            // Setup analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            
            // Connect master gain to effects
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            
            // Setup signal chain: masterGain -> delay -> reverb -> analyser -> destination
            this.masterGain.connect(this.delayDry);
            this.masterGain.connect(this.delayNode);
            
            this.delayNode.connect(this.delayFeedback);
            this.delayFeedback.connect(this.delayNode);
            this.delayFeedback.connect(this.delayWet);
            
            this.delayDry.connect(this.reverbDry);
            this.delayWet.connect(this.reverbDry);
            
            this.reverbDry.connect(this.convolver);
            this.convolver.connect(this.reverbWet);
            
            this.reverbDry.connect(this.analyser);
            this.reverbWet.connect(this.analyser);
            
            this.analyser.connect(this.audioContext.destination);
            
            this.startVisualizer();
        }
    }
    
    setupEffects() {
        // Delay effect
        this.delayNode = this.audioContext.createDelay(5.0);
        this.delayNode.delayTime.value = this.effects.delayTime;
        
        this.delayFeedback = this.audioContext.createGain();
        this.delayFeedback.gain.value = this.effects.delayFeedback;
        
        this.delayWet = this.audioContext.createGain();
        this.delayWet.gain.value = this.effects.delayMix;
        
        this.delayDry = this.audioContext.createGain();
        this.delayDry.gain.value = 1.0;
        
        // Reverb effect (using convolver)
        this.convolver = this.audioContext.createConvolver();
        this.createReverbImpulse();
        
        this.reverbWet = this.audioContext.createGain();
        this.reverbWet.gain.value = this.effects.reverbMix;
        
        this.reverbDry = this.audioContext.createGain();
        this.reverbDry.gain.value = 1.0;
    }
    
    createReverbImpulse() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 second reverb
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.convolver.buffer = impulse;
    }
    
    setupControls() {
        // Oscillator 1 controls
        this.setupControl('osc1-wave', (value) => this.osc1.wave = value);
        this.setupSlider('osc1-detune', (value) => this.osc1.detune = parseFloat(value));
        this.setupSlider('osc1-level', (value) => this.osc1.level = value / 100);
        
        // Oscillator 2 controls
        this.setupControl('osc2-wave', (value) => this.osc2.wave = value);
        this.setupSlider('osc2-detune', (value) => this.osc2.detune = parseFloat(value));
        this.setupSlider('osc2-level', (value) => this.osc2.level = value / 100);
        
        // Noise control
        this.setupSlider('noise-level', (value) => this.noiseLevel = value / 100);
        
        // Octave control
        this.setupSlider('octave', (value) => this.octave = parseInt(value));
        
        // Filter controls
        this.setupControl('filter-type', (value) => this.filter.type = value);
        this.setupSlider('filter-cutoff', (value) => this.filter.cutoff = parseFloat(value));
        this.setupSlider('filter-resonance', (value) => this.filter.resonance = parseFloat(value));
        this.setupSlider('filter-env-amount', (value) => this.filter.envAmount = parseFloat(value));
        this.setupSlider('filter-attack', (value) => this.filter.attack = parseFloat(value));
        this.setupSlider('filter-decay', (value) => this.filter.decay = parseFloat(value));
        
        // Amplitude envelope controls
        this.setupSlider('attack', (value) => this.ampEnv.attack = parseFloat(value));
        this.setupSlider('decay', (value) => this.ampEnv.decay = parseFloat(value));
        this.setupSlider('sustain', (value) => this.ampEnv.sustain = parseFloat(value));
        this.setupSlider('release', (value) => this.ampEnv.release = parseFloat(value));
        
        // LFO controls
        this.setupControl('lfo-wave', (value) => this.lfo.wave = value);
        this.setupSlider('lfo-rate', (value) => this.lfo.rate = parseFloat(value));
        this.setupSlider('lfo-pitch-depth', (value) => this.lfo.pitchDepth = parseFloat(value));
        this.setupSlider('lfo-filter-depth', (value) => this.lfo.filterDepth = parseFloat(value));
        this.setupSlider('lfo-amp-depth', (value) => this.lfo.ampDepth = parseFloat(value) / 100);
        
        // Effects controls
        this.setupSlider('delay-time', (value) => {
            this.effects.delayTime = parseFloat(value);
            if (this.delayNode) this.delayNode.delayTime.value = this.effects.delayTime;
        });
        this.setupSlider('delay-feedback', (value) => {
            this.effects.delayFeedback = parseFloat(value) / 100;
            if (this.delayFeedback) this.delayFeedback.gain.value = this.effects.delayFeedback;
        });
        this.setupSlider('delay-mix', (value) => {
            this.effects.delayMix = parseFloat(value) / 100;
            if (this.delayWet) this.delayWet.gain.value = this.effects.delayMix;
        });
        this.setupSlider('reverb-mix', (value) => {
            this.effects.reverbMix = parseFloat(value) / 100;
            if (this.reverbWet) this.reverbWet.gain.value = this.effects.reverbMix;
        });
        this.setupSlider('master-volume', (value) => {
            this.masterVolume = value / 100;
            if (this.masterGain) this.masterGain.gain.value = this.masterVolume;
        });
    }
    
    setupControl(id, callback) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', (e) => callback(e.target.value));
        }
    }
    
    setupSlider(id, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                valueDisplay.textContent = value;
                callback(value);
            });
        }
    }
    
    setupKeyboard() {
        const keys = document.querySelectorAll('.key');
        
        // Mouse/touch events
        keys.forEach(key => {
            const note = key.dataset.note;
            const octaveOffset = parseInt(key.dataset.octaveOffset || 0);
            const noteId = `${note}_${octaveOffset}`;
            
            key.addEventListener('mousedown', () => this.playNote(note, key, octaveOffset));
            key.addEventListener('mouseup', () => this.stopNote(noteId, key));
            key.addEventListener('mouseleave', () => this.stopNote(noteId, key));
            
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playNote(note, key, octaveOffset);
            });
            key.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopNote(noteId, key);
            });
        });
        
        // Keyboard events
        const keyMap = new Map();
        keys.forEach(key => {
            const note = key.dataset.note;
            const octaveOffset = parseInt(key.dataset.octaveOffset || 0);
            keyMap.set(key.dataset.key.toLowerCase(), { 
                note, 
                octaveOffset,
                noteId: `${note}_${octaveOffset}`,
                element: key 
            });
        });
        
        const pressedKeys = new Set();
        
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (keyMap.has(key) && !pressedKeys.has(key)) {
                pressedKeys.add(key);
                const { note, octaveOffset, noteId, element } = keyMap.get(key);
                this.playNote(note, element, octaveOffset);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (keyMap.has(key)) {
                pressedKeys.delete(key);
                const { noteId, element } = keyMap.get(key);
                this.stopNote(noteId, element);
            }
        });
    }
    
    getFrequency(note) {
        const baseFreq = this.noteFrequencies[note];
        // Adjust for octave (default is octave 4)
        const octaveMultiplier = Math.pow(2, this.octave - 4);
        return baseFreq * octaveMultiplier;
    }
    
    playNote(note, keyElement, octaveOffset = 0) {
        const noteId = `${note}_${octaveOffset}`;
        
        if (this.activeVoices.has(noteId)) {
            return; // Already playing
        }
        
        this.initAudioContext();
        
        const frequency = this.getFrequency(note) * Math.pow(2, octaveOffset);
        const now = this.audioContext.currentTime;
        
        // Create voice object to hold all nodes
        const voice = {
            oscillators: [],
            gainNodes: [],
            filter: null,
            filterEnvGain: null,
            ampGain: null,
            lfoOsc: null,
            lfoGains: {}
        };
        
        // Create filter
        voice.filter = this.audioContext.createBiquadFilter();
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
        if (this.lfo.pitchDepth > 0 || this.lfo.filterDepth > 0 || this.lfo.ampDepth > 0) {
            voice.lfoOsc = this.audioContext.createOscillator();
            voice.lfoOsc.type = this.lfo.wave;
            voice.lfoOsc.frequency.value = this.lfo.rate;
            voice.lfoOsc.start(now);
        }
        
        // Create oscillator 1
        if (this.osc1.level > 0) {
            const osc = this.audioContext.createOscillator();
            osc.type = this.osc1.wave;
            osc.frequency.value = frequency;
            osc.detune.value = this.osc1.detune;
            
            const gain = this.audioContext.createGain();
            gain.gain.value = this.osc1.level;
            
            // LFO pitch modulation for osc1
            if (voice.lfoOsc && this.lfo.pitchDepth > 0) {
                const lfoGain = this.audioContext.createGain();
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
        
        // Create oscillator 2
        if (this.osc2.level > 0) {
            const osc = this.audioContext.createOscillator();
            osc.type = this.osc2.wave;
            osc.frequency.value = frequency;
            osc.detune.value = this.osc2.detune;
            
            const gain = this.audioContext.createGain();
            gain.gain.value = this.osc2.level;
            
            // LFO pitch modulation for osc2
            if (voice.lfoOsc && this.lfo.pitchDepth > 0) {
                const lfoGain = this.audioContext.createGain();
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
        
        // Create noise source
        if (this.noiseLevel > 0) {
            const bufferSize = this.audioContext.sampleRate * 2;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;
            
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.value = this.noiseLevel;
            
            noise.connect(noiseGain);
            noiseGain.connect(voice.filter);
            noise.start(now);
            
            voice.oscillators.push(noise);
            voice.gainNodes.push(noiseGain);
        }
        
        // LFO filter modulation
        if (voice.lfoOsc && this.lfo.filterDepth > 0) {
            const lfoFilterGain = this.audioContext.createGain();
            lfoFilterGain.gain.value = this.lfo.filterDepth;
            voice.lfoOsc.connect(lfoFilterGain);
            lfoFilterGain.connect(voice.filter.frequency);
        }
        
        // Create amplitude gain node with envelope
        voice.ampGain = this.audioContext.createGain();
        voice.ampGain.gain.value = 0;
        
        // Connect filter to amp gain
        voice.filter.connect(voice.ampGain);
        
        // LFO amplitude modulation
        if (voice.lfoOsc && this.lfo.ampDepth > 0) {
            const lfoAmpGain = this.audioContext.createGain();
            lfoAmpGain.gain.value = this.lfo.ampDepth;
            voice.lfoOsc.connect(lfoAmpGain);
            lfoAmpGain.connect(voice.ampGain.gain);
        }
        
        // Connect to master
        voice.ampGain.connect(this.masterGain);
        
        // Amplitude ADSR Envelope
        const attackEnd = now + this.ampEnv.attack;
        const decayEnd = attackEnd + this.ampEnv.decay;
        
        voice.ampGain.gain.setValueAtTime(0, now);
        voice.ampGain.gain.linearRampToValueAtTime(1, attackEnd);
        voice.ampGain.gain.linearRampToValueAtTime(this.ampEnv.sustain, decayEnd);
        
        // Store voice
        this.activeVoices.set(noteId, voice);
        
        // Visual feedback
        keyElement.classList.add('active');
    }
    
    stopNote(noteId, keyElement) {
        if (!this.activeVoices.has(noteId)) {
            return;
        }
        
        const voice = this.activeVoices.get(noteId);
        const now = this.audioContext.currentTime;
        
        // Release envelope
        voice.ampGain.gain.cancelScheduledValues(now);
        voice.ampGain.gain.setValueAtTime(voice.ampGain.gain.value, now);
        voice.ampGain.gain.linearRampToValueAtTime(0, now + this.ampEnv.release);
        
        // Stop all oscillators after release
        voice.oscillators.forEach(osc => {
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
        
        // Clean up
        this.activeVoices.delete(noteId);
        
        // Visual feedback
        keyElement.classList.remove('active');
    }
    
    setupVisualizer() {
        this.visualizerCanvas = document.getElementById('visualizer');
        this.visualizerContext = this.visualizerCanvas.getContext('2d');
        
        // Set canvas size
        const resizeCanvas = () => {
            const rect = this.visualizerCanvas.getBoundingClientRect();
            this.visualizerCanvas.width = rect.width;
            this.visualizerCanvas.height = rect.height;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    startVisualizer() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            requestAnimationFrame(draw);
            
            this.analyser.getByteTimeDomainData(dataArray);
            
            const ctx = this.visualizerContext;
            const width = this.visualizerCanvas.width;
            const height = this.visualizerCanvas.height;
            
            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, width, height);
            
            // Draw waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#667eea';
            ctx.beginPath();
            
            const sliceWidth = width / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height / 2;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.lineTo(width, height / 2);
            ctx.stroke();
        };
        
        draw();
    }
    
    setupPresetControls() {
        const categorySelect = document.getElementById('preset-category');
        const presetList = document.getElementById('preset-list');
        const loadBtn = document.getElementById('load-preset');
        const saveBtn = document.getElementById('save-preset');
        const deleteBtn = document.getElementById('delete-preset');
        const presetName = document.getElementById('preset-name');
        const message = document.getElementById('preset-message');
        
        // Update preset list when category changes
        categorySelect.addEventListener('change', () => {
            this.updatePresetList();
        });
        
        // Load preset
        loadBtn.addEventListener('click', () => {
            const category = categorySelect.value;
            const index = parseInt(presetList.value);
            
            let preset;
            if (category === 'custom') {
                preset = this.customPresets[index];
            } else {
                preset = this.presets[category][index];
            }
            
            if (preset) {
                this.loadPreset(preset);
                this.showMessage(`Loaded: ${preset.name}`, 'success');
            }
        });
        
        // Save custom preset
        saveBtn.addEventListener('click', () => {
            const name = presetName.value.trim();
            if (!name) {
                this.showMessage('Please enter a preset name', 'error');
                return;
            }
            
            const preset = this.getCurrentSettings();
            preset.name = name;
            
            this.customPresets.push(preset);
            this.saveCustomPresetsToStorage();
            
            // Switch to custom category and update list
            categorySelect.value = 'custom';
            this.updatePresetList();
            presetList.value = this.customPresets.length - 1;
            
            this.showMessage(`Saved: ${name}`, 'success');
            presetName.value = '';
        });
        
        // Delete custom preset
        deleteBtn.addEventListener('click', () => {
            if (categorySelect.value !== 'custom') {
                this.showMessage('Can only delete custom presets', 'error');
                return;
            }
            
            const index = parseInt(presetList.value);
            if (index >= 0 && index < this.customPresets.length) {
                const name = this.customPresets[index].name;
                this.customPresets.splice(index, 1);
                this.saveCustomPresetsToStorage();
                this.updatePresetList();
                this.showMessage(`Deleted: ${name}`, 'success');
            }
        });
        
        // Initialize preset list
        this.updatePresetList();
    }
    
    updatePresetList() {
        const categorySelect = document.getElementById('preset-category');
        const presetList = document.getElementById('preset-list');
        const category = categorySelect.value;
        
        presetList.innerHTML = '';
        
        let presets;
        if (category === 'custom') {
            presets = this.customPresets;
        } else {
            presets = this.presets[category];
        }
        
        presets.forEach((preset, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = preset.name;
            presetList.appendChild(option);
        });
        
        // Show/hide delete button
        const deleteBtn = document.getElementById('delete-preset');
        deleteBtn.style.display = category === 'custom' && presets.length > 0 ? 'block' : 'none';
    }
    
    getCurrentSettings() {
        return {
            osc1: { 
                wave: this.osc1.wave,
                detune: this.osc1.detune,
                level: this.osc1.level * 100  // Convert to percentage for storage
            },
            osc2: { 
                wave: this.osc2.wave,
                detune: this.osc2.detune,
                level: this.osc2.level * 100  // Convert to percentage for storage
            },
            noiseLevel: this.noiseLevel * 100,  // Convert to percentage for storage
            octave: this.octave,
            filter: { ...this.filter },
            ampEnv: { ...this.ampEnv },
            lfo: { 
                wave: this.lfo.wave,
                rate: this.lfo.rate,
                pitchDepth: this.lfo.pitchDepth,
                filterDepth: this.lfo.filterDepth,
                ampDepth: this.lfo.ampDepth * 100  // Convert to percentage for storage
            },
            effects: { 
                delayTime: this.effects.delayTime,
                delayFeedback: this.effects.delayFeedback * 100,  // Convert to percentage for storage
                delayMix: this.effects.delayMix * 100,  // Convert to percentage for storage
                reverbMix: this.effects.reverbMix * 100  // Convert to percentage for storage
            },
            masterVolume: this.masterVolume * 100  // Convert to percentage for storage
        };
    }
    
    loadPreset(preset) {
        // Update all parameters - convert percentage values to decimals where needed
        this.osc1 = { 
            wave: preset.osc1.wave,
            detune: preset.osc1.detune,
            level: preset.osc1.level / 100  // Convert from percentage
        };
        this.osc2 = { 
            wave: preset.osc2.wave,
            detune: preset.osc2.detune,
            level: preset.osc2.level / 100  // Convert from percentage
        };
        this.noiseLevel = preset.noiseLevel / 100;  // Convert from percentage
        this.octave = preset.octave;
        this.filter = { ...preset.filter };
        this.ampEnv = { ...preset.ampEnv };
        this.lfo = { 
            wave: preset.lfo.wave,
            rate: preset.lfo.rate,
            pitchDepth: preset.lfo.pitchDepth,
            filterDepth: preset.lfo.filterDepth,
            ampDepth: preset.lfo.ampDepth / 100  // Convert from percentage
        };
        this.effects = { 
            delayTime: preset.effects.delayTime,
            delayFeedback: preset.effects.delayFeedback / 100,  // Convert from percentage
            delayMix: preset.effects.delayMix / 100,  // Convert from percentage
            reverbMix: preset.effects.reverbMix / 100  // Convert from percentage
        };
        this.masterVolume = preset.masterVolume / 100;  // Convert from percentage
        
        // Update all UI controls
        this.updateUIFromSettings();
        
        // Update audio nodes
        if (this.delayNode) {
            this.delayNode.delayTime.value = this.effects.delayTime;
            this.delayFeedback.gain.value = this.effects.delayFeedback;
            this.delayWet.gain.value = this.effects.delayMix;
            this.reverbWet.gain.value = this.effects.reverbMix;
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    updateUIFromSettings() {
        // Oscillator 1
        this.updateUIControl('osc1-wave', this.osc1.wave);
        this.updateUISlider('osc1-detune', this.osc1.detune);
        this.updateUISlider('osc1-level', this.osc1.level * 100);
        
        // Oscillator 2
        this.updateUIControl('osc2-wave', this.osc2.wave);
        this.updateUISlider('osc2-detune', this.osc2.detune);
        this.updateUISlider('osc2-level', this.osc2.level * 100);
        
        // Noise
        this.updateUISlider('noise-level', this.noiseLevel * 100);
        
        // Octave
        this.updateUISlider('octave', this.octave);
        
        // Filter
        this.updateUIControl('filter-type', this.filter.type);
        this.updateUISlider('filter-cutoff', this.filter.cutoff);
        this.updateUISlider('filter-resonance', this.filter.resonance);
        this.updateUISlider('filter-env-amount', this.filter.envAmount);
        this.updateUISlider('filter-attack', this.filter.attack);
        this.updateUISlider('filter-decay', this.filter.decay);
        
        // Amplitude Envelope
        this.updateUISlider('attack', this.ampEnv.attack);
        this.updateUISlider('decay', this.ampEnv.decay);
        this.updateUISlider('sustain', this.ampEnv.sustain);
        this.updateUISlider('release', this.ampEnv.release);
        
        // LFO
        this.updateUIControl('lfo-wave', this.lfo.wave);
        this.updateUISlider('lfo-rate', this.lfo.rate);
        this.updateUISlider('lfo-pitch-depth', this.lfo.pitchDepth);
        this.updateUISlider('lfo-filter-depth', this.lfo.filterDepth);
        this.updateUISlider('lfo-amp-depth', this.lfo.ampDepth * 100);
        
        // Effects
        this.updateUISlider('delay-time', this.effects.delayTime);
        this.updateUISlider('delay-feedback', this.effects.delayFeedback * 100);
        this.updateUISlider('delay-mix', this.effects.delayMix * 100);
        this.updateUISlider('reverb-mix', this.effects.reverbMix * 100);
        this.updateUISlider('master-volume', this.masterVolume * 100);
    }
    
    updateUIControl(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
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
    
    showMessage(text, type) {
        const message = document.getElementById('preset-message');
        message.textContent = text;
        message.className = 'preset-message show';
        message.style.background = type === 'success' 
            ? 'rgba(76, 175, 80, 0.9)' 
            : 'rgba(244, 67, 54, 0.9)';
        
        setTimeout(() => {
            message.classList.remove('show');
        }, 3000);
    }
}

// Initialize synthesizer when page loads
document.addEventListener('DOMContentLoaded', () => {
    const synth = new Synthesizer();
});
