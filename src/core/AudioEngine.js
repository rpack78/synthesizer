// Audio Engine - Manages audio context and effects chain

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.limiterGain = null;
    this.limiterCompressor = null;
    this.hardClipper = null;
    this.analyser = null;

    // Effects nodes
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayWet = null;
    this.delayDry = null;
    this.convolver = null;
    this.reverbWet = null;
    this.reverbDry = null;
    this.distortion = null;
    this.chorusDelay = null;
    this.chorusLFO = null;
    this.chorusLFOGain = null;
    this.chorusWet = null;
    this.chorusDry = null;
    this.flangerDelay = null;
    this.flangerLFO = null;
    this.flangerLFOGain = null;
    this.flangerFeedback = null;
    this.flangerWet = null;
    this.flangerDry = null;

    // Effect parameters
    this.effects = {
      delayTime: 0.3,
      delayFeedback: 0.3,
      delayMix: 0,
      reverbMix: 0,
      distortionDrive: 0,
      chorusRate: 0.5,
      chorusDepth: 0,
      flangerRate: 0.3,
      flangerDepth: 0,
      flangerFeedbackAmount: 0.5,
    };

    this.masterVolume = 0.5;

    // Limiter parameters
    this.limiter = {
      gain: 0, // dB (-12 to +12)
      ceiling: -0.3, // dB (-20 to 0)
      lookahead: 0, // ms (0 to 10)
      release: 300, // ms (10 to 1000)
    };
  }

  initialize() {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Setup effects chain
    this.setupEffects();

    // Setup analyser for visualization
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Create master gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.masterVolume;

    // Create proper limiter using DynamicsCompressorNode
    // Input gain for makeup gain
    this.limiterGain = this.audioContext.createGain();
    this.updateLimiterGain();

    // Compressor configured as a brick-wall limiter
    this.limiterCompressor = this.audioContext.createDynamicsCompressor();
    // Ultra-aggressive settings for true brick-wall limiting
    this.limiterCompressor.threshold.value = -0.1; // Just below 0 dB
    this.limiterCompressor.knee.value = 0; // Hard knee for limiting
    this.limiterCompressor.ratio.value = 20; // High ratio for smooth compression
    this.limiterCompressor.attack.value = 0.001; // Ultra-fast attack (1ms)
    this.limiterCompressor.release.value = this.limiter.release / 1000; // Convert ms to seconds

    // Hard clipper as final safety - absolutely prevents exceeding ceiling
    this.hardClipper = this.audioContext.createWaveShaper();
    this.updateHardClipperCurve();

    // Connect the effects chain
    this.connectEffectsChain();

    return this.audioContext;
  }

  setupEffects() {
    // Distortion
    this.distortion = this.audioContext.createWaveShaper();
    this.updateDistortionCurve(0);

    // Chorus
    this.chorusDelay = this.audioContext.createDelay(0.05);
    this.chorusDelay.delayTime.value = 0.025;

    this.chorusLFO = this.audioContext.createOscillator();
    this.chorusLFO.frequency.value = this.effects.chorusRate;
    this.chorusLFO.type = "sine";
    this.chorusLFO.start();

    this.chorusLFOGain = this.audioContext.createGain();
    this.chorusLFOGain.gain.value = 0.002;

    this.chorusLFO.connect(this.chorusLFOGain);
    this.chorusLFOGain.connect(this.chorusDelay.delayTime);

    this.chorusWet = this.audioContext.createGain();
    this.chorusWet.gain.value = 0;

    this.chorusDry = this.audioContext.createGain();
    this.chorusDry.gain.value = 1.0;

    // Flanger
    this.flangerDelay = this.audioContext.createDelay(0.02);
    this.flangerDelay.delayTime.value = 0.005;

    this.flangerLFO = this.audioContext.createOscillator();
    this.flangerLFO.frequency.value = this.effects.flangerRate;
    this.flangerLFO.type = "sine";
    this.flangerLFO.start();

    this.flangerLFOGain = this.audioContext.createGain();
    this.flangerLFOGain.gain.value = 0.002;

    this.flangerLFO.connect(this.flangerLFOGain);
    this.flangerLFOGain.connect(this.flangerDelay.delayTime);

    this.flangerFeedback = this.audioContext.createGain();
    this.flangerFeedback.gain.value = this.effects.flangerFeedbackAmount;

    this.flangerWet = this.audioContext.createGain();
    this.flangerWet.gain.value = 0;

    this.flangerDry = this.audioContext.createGain();
    this.flangerDry.gain.value = 1.0;

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

  connectEffectsChain() {
    // Signal flow: master -> distortion -> chorus -> flanger -> delay -> reverb -> analyser -> output
    this.masterGain.connect(this.distortion);

    // Chorus routing
    this.distortion.connect(this.chorusDry);
    this.distortion.connect(this.chorusDelay);
    this.chorusDelay.connect(this.chorusWet);

    // Flanger routing (after chorus)
    this.chorusDry.connect(this.flangerDry);
    this.chorusWet.connect(this.flangerDry);
    this.chorusDry.connect(this.flangerDelay);
    this.chorusWet.connect(this.flangerDelay);
    this.flangerDelay.connect(this.flangerWet);
    this.flangerDelay.connect(this.flangerFeedback);
    this.flangerFeedback.connect(this.flangerDelay);

    // Delay routing (after flanger)
    this.flangerDry.connect(this.delayDry);
    this.flangerWet.connect(this.delayDry);
    this.flangerDry.connect(this.delayNode);
    this.flangerWet.connect(this.delayNode);

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayFeedback.connect(this.delayWet);

    this.delayDry.connect(this.reverbDry);
    this.delayWet.connect(this.reverbDry);

    this.reverbDry.connect(this.convolver);
    this.convolver.connect(this.reverbWet);

    this.reverbDry.connect(this.limiterGain);
    this.reverbWet.connect(this.limiterGain);

    this.limiterGain.connect(this.limiterCompressor);
    this.limiterCompressor.connect(this.hardClipper);

    // Analyser after limiter to see actual output level
    this.hardClipper.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
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

  updateDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const drive = amount / 100;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      if (drive === 0) {
        curve[i] = x;
      } else {
        // Apply distortion using tanh-like curve
        const k = drive * 50;
        curve[i] = ((3 + k) * x) / (Math.PI + k * Math.abs(x));
      }
    }

    this.distortion.curve = curve;
  }

  setMasterVolume(volume) {
    this.masterVolume = volume;
    if (this.masterGain) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(volume, now + 0.01);
    }
  }

  updateMasterGainForPolyphony(numVoices) {
    if (numVoices === 0 || !this.audioContext) return;

    // Apply polyphony compensation
    const compensationFactor = Math.min(1, 0.5 + 0.5 / Math.sqrt(numVoices));
    const targetGain = this.masterVolume * compensationFactor;

    const now = this.audioContext.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.01);
  }

  // Limiter control methods
  updateLimiterGain() {
    if (this.limiterGain) {
      // Convert dB to linear gain
      const gainLinear = Math.pow(10, this.limiter.gain / 20);
      this.limiterGain.gain.value = gainLinear;
    }
  }

  updateHardClipperCurve() {
    if (this.hardClipper) {
      // Create a hard clipping curve at the ceiling level
      // This absolutely prevents any signal from exceeding the ceiling
      const samples = 4096;
      const curve = new Float32Array(samples);

      // Convert ceiling dB to linear amplitude
      const ceilingLinear = Math.pow(10, this.limiter.ceiling / 20);

      // Create hard clipping curve
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1; // Range: -1 to 1

        // Hard clip at ceiling level
        if (x > ceilingLinear) {
          curve[i] = ceilingLinear;
        } else if (x < -ceilingLinear) {
          curve[i] = -ceilingLinear;
        } else {
          curve[i] = x;
        }
      }

      this.hardClipper.curve = curve;
      this.hardClipper.oversample = "4x"; // High quality oversampling to reduce aliasing
    }
  }

  setLimiterGain(gainDb) {
    this.limiter.gain = gainDb;
    this.updateLimiterGain();
  }

  setLimiterCeiling(ceilingDb) {
    this.limiter.ceiling = ceilingDb;
    // Don't change compressor threshold - keep it at -0.1 dB for smooth compression
    // The hard clipper enforces the actual ceiling
    this.updateHardClipperCurve();
  }

  setLimiterLookahead(lookaheadMs) {
    this.limiter.lookahead = lookaheadMs;
    if (this.limiterCompressor) {
      // Attack time simulates lookahead (convert ms to seconds)
      // Minimum 0.001s (1ms) for ultra-fast limiting
      this.limiterCompressor.attack.value = Math.max(0.001, lookaheadMs / 1000);
    }
  }

  setLimiterRelease(releaseMs) {
    this.limiter.release = releaseMs;
    if (this.limiterCompressor) {
      // Convert ms to seconds
      this.limiterCompressor.release.value = releaseMs / 1000;
    }
  }
}
