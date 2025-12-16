// Utility functions for the synthesizer

export const noteFrequencies = {
  C: 261.63,
  "C#": 277.18,
  D: 293.66,
  "D#": 311.13,
  E: 329.63,
  F: 349.23,
  "F#": 369.99,
  G: 392.0,
  "G#": 415.3,
  A: 440.0,
  "A#": 466.16,
  B: 493.88,
};

export function getFrequency(note, octave) {
  const baseFreq = noteFrequencies[note];
  // Adjust for octave (default is octave 4)
  const octaveMultiplier = Math.pow(2, octave - 4);
  return baseFreq * octaveMultiplier;
}

export function showMessage(text, type = "info") {
  const message = document.getElementById("status-message");
  message.textContent = text;
  message.className = `message ${type} show`;
  setTimeout(() => {
    message.classList.remove("show");
  }, 3000);
}

export function showMIDIMessage(text, type = "info") {
  const message = document.getElementById("midi-message");
  message.textContent = text;
  message.className = `midi-message ${type} show`;
  setTimeout(() => {
    message.classList.remove("show");
  }, 3000);
}
