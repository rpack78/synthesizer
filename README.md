# 🎹 Advanced Web Synthesizer

A powerful, browser-based synthesizer built with the Web Audio API. Create rich, complex sounds through subtractive synthesis, modulation, and effects processing.

## ✨ Features

### 🌊 Multi-Oscillator Sound Generation
- **2 independent oscillators** with 4 waveforms each (Sine, Square, Sawtooth, Triangle)
- **Detune control** for thick, chorused sounds
- **White noise generator** for texture and percussion
- **Individual level mixing** for each sound source

### 🔊 Subtractive Synthesis
- **4 filter types**: Low-pass, High-pass, Band-pass, Notch
- **Cutoff frequency** control (20Hz - 20kHz)
- **Resonance** for classic synth character
- **Filter envelope** with dedicated Attack/Decay for dynamic filtering

### 📊 ADSR Envelope
- Full **Attack, Decay, Sustain, Release** control
- Shapes amplitude over time for expressive playing

### 〰️ LFO Modulation
- **4 LFO waveforms** for varied modulation shapes
- **Rate control** from 0.1 to 20 Hz
- Modulation targets:
  - **Pitch** (vibrato effects)
  - **Filter cutoff** (auto-wah effects)
  - **Amplitude** (tremolo effects)

### ✨ Effects
- **Distortion**: Harmonic saturation and drive (waveshaping)
- **Chorus**: Lush, detuned textures with rate and depth controls
- **Flanger**: Sweeping comb-filter effect with rate, depth, and feedback
- **Delay**: Adjustable time, feedback, and mix
- **Reverb**: Convolution-based spatial effects
- Creates ambient textures and depth

### 🎛️ Preset System
- **80 built-in presets** across 4 categories:
  - 20 Bass patches
  - 20 Lead patches
  - 20 Pad patches
  - 20 Special FX patches
- **Save custom presets** with browser localStorage
- **Import/Export** your sound designs

### 🎹 MIDI Controller Support
- **USB MIDI keyboard** input with velocity sensitivity
- **Device selection** for multiple controllers
- **MIDI CC mapping** for real-time parameter control:
  - CC 1 (Mod Wheel) → LFO Pitch Depth
  - CC 7 (Volume) → Master Volume
  - CC 71 → Filter Resonance
  - CC 72 → Release Time
  - CC 73 → Attack Time
  - CC 74 (Brightness) → Filter Cutoff
  - CC 91 → Reverb Mix

### 🎵 Playable Interface
- **25-key virtual keyboard** (2 octaves)
- **Computer keyboard** support (Z-M, Q-U, I for 25 keys)
- **Visual feedback** for active notes
- **Real-time waveform visualizer**

### ℹ️ Built-in Help System
- Info icons throughout the interface
- Tooltips explaining each parameter
- Tips for sound design and typical value ranges

## 🚀 Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/synthesiser.git
   cd synthesiser
   ```

2. Open `index.html` in a modern web browser (Chrome, Edge, or Opera recommended)

That's it! No build process or dependencies required.

### Using the Synthesizer

#### Playing Notes
- **Mouse**: Click on the keyboard keys
- **Computer Keyboard**: Use keys Z through I for a 25-key range
- **MIDI Controller**: Click "Enable MIDI" and select your device

#### Creating Sounds
1. **Start with a preset**: Select a category and preset from the dropdown
2. **Adjust oscillators**: Mix waveforms and detune for richness
3. **Shape with filters**: Use cutoff and resonance to sculpt the tone
4. **Add movement**: Use LFO for vibrato, tremolo, or filter sweeps
5. **Set envelope**: Control how notes start and end with ADSR
6. **Add effects**: Distortion for grit, chorus/flanger for movement, delay and reverb for space
7. **Save your patch**: Name it and click "Save Custom Patch"

## 🎨 Sound Design Tips

### Classic Sounds

**Bass**:
- Low octave (2-3)
- Sawtooth or square waves
- Low-pass filter with moderate resonance
- Short attack, medium release

**Lead**:
- Higher octave (4-5)
- Detuned sawtooth oscillators
- Filter envelope with positive modulation
- LFO on pitch for vibrato
- Add delay for depth

**Pad**:
- Slow attack (0.8-1.5s)
- Long release (1.5-2.5s)
- Multiple detuned oscillators
- Low-pass filter with gentle cutoff
- Heavy reverb and delay

**Effects**:
- Experiment with extreme settings
- High resonance on filters
- Fast LFO rates
- Noise mixed with oscillators

## 🛠️ Technical Details

### Built With
- **Web Audio API** - Sound synthesis and processing
- **Web MIDI API** - MIDI controller support
- **HTML5 Canvas** - Real-time waveform visualization
- **Vanilla JavaScript** - No frameworks required
- **CSS3** - Modern, responsive interface

### Browser Support
- ✅ Chrome/Chromium (recommended)
- ✅ Edge
- ✅ Opera
- ⚠️ Firefox (MIDI support may require configuration)
- ⚠️ Safari (MIDI support limited)

### Audio Architecture
```
Oscillators (×2) + Noise
    ↓
Biquad Filter (with envelope)
    ↓
LFO Modulation (pitch, filter, amplitude)
    ↓
Amplitude Envelope (ADSR)
    ↓
Distortion Effect
    ↓
Chorus Effect
    ↓
Flanger Effect
    ↓
Delay Effect
    ↓
Reverb Effect
    ↓
Master Gain
    ↓
Analyser → Visualizer
    ↓
Audio Output
```

## 📁 Project Structure

```
synthesiser/
├── index.html          # Main HTML structure
├── styles.css          # Styling and layout
├── synthesizer.js      # Synthesis engine and logic
└── README.md          # This file
```
phaser, compressor, EQ
## 🎯 Future Enhancements

- [ ] Additional waveforms (PWM, FM synthesis)
- [ ] Arpeggiator
- [ ] Sequencer/pattern recorder
- [ ] MIDI learn for CC mapping
- [ ] Preset sharing/export
- [ ] Oscilloscope view
- [ ] Spectrum analyzer

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👨‍💻 Author

Created with ❤️ using Web Audio API

---

**Enjoy creating sounds! 🎵**
