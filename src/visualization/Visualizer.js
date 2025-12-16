// Visualizer - Audio visualization

export class Visualizer {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.canvas = null;
    this.context = null;
    this.clipTimeout = null;
  }

  setup() {
    this.canvas = document.getElementById("visualizer");
    this.context = this.canvas.getContext("2d");

    // Set canvas size
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  start() {
    if (!this.audioEngine.analyser) return;

    const bufferLength = this.audioEngine.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const clippingIndicator = document.getElementById("clipping-indicator");

    const draw = () => {
      requestAnimationFrame(draw);

      this.audioEngine.analyser.getByteTimeDomainData(dataArray);

      // Check for clipping
      let isClipping = false;
      const clipThreshold = 250;
      for (let i = 0; i < bufferLength; i++) {
        if (
          dataArray[i] >= clipThreshold ||
          dataArray[i] <= 255 - clipThreshold
        ) {
          isClipping = true;
          break;
        }
      }

      // Update clipping indicator
      if (isClipping) {
        clippingIndicator.classList.add("active");
        if (this.clipTimeout) {
          clearTimeout(this.clipTimeout);
        }
        this.clipTimeout = setTimeout(() => {
          clippingIndicator.classList.remove("active");
        }, 200);
      }

      const ctx = this.context;
      const width = this.canvas.width;
      const height = this.canvas.height;

      // Clear canvas
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, width, height);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#667eea";
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

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
}
