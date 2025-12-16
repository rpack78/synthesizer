// Advanced Web Synthesizer - Main orchestrator

import { AudioEngine } from "./AudioEngine.js";
import { VoiceManager } from "./VoiceManager.js";
import { Visualizer } from "../visualization/Visualizer.js";
import { PresetManager } from "../managers/PresetManager.js";
import { MIDIController } from "../controllers/MIDIController.js";
import { UIController } from "../controllers/UIController.js";

class Synthesizer {
  constructor() {
    // Initialize core modules
    this.audioEngine = new AudioEngine();
    this.voiceManager = new VoiceManager(this.audioEngine);
    this.visualizer = new Visualizer(this.audioEngine);
    this.presetManager = new PresetManager(this.voiceManager, this.audioEngine);
    this.midiController = new MIDIController(
      this.voiceManager,
      this.audioEngine
    );
    this.uiController = new UIController(this.voiceManager, this.audioEngine);

    this.init();
  }

  init() {
    // Initialize audio context on user interaction
    document.addEventListener("click", () => this.initAudioContext(), {
      once: true,
    });
    document.addEventListener("keydown", () => this.initAudioContext(), {
      once: true,
    });

    // Setup all controllers
    this.uiController.setupControls();
    this.uiController.setupKeyboard();
    this.visualizer.setup();
    this.presetManager.setupControls();
    this.midiController.setup();
  }

  initAudioContext() {
    this.audioEngine.initialize();
    if (this.audioEngine.audioContext) {
      this.visualizer.start();
    }
  }
}

// Initialize synthesizer when page loads
document.addEventListener("DOMContentLoaded", () => {
  const synth = new Synthesizer();
});
