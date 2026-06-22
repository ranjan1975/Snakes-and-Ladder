/**
 * Sound Synthesizer using Web Audio API
 */
class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.moveAudioBuffer = null;
    this.isLoadingMoveSound = false;
    this.snakeAudioBuffer = null;
    this.isLoadingSnakeSound = false;
    this.bgMusic = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Pre-load custom move sound buffer once AudioContext is initialized
    if (!this.moveAudioBuffer && !this.isLoadingMoveSound) {
      this.loadMoveSound();
    }
    // Pre-load custom snake bite sound buffer once AudioContext is initialized
    if (!this.snakeAudioBuffer && !this.isLoadingSnakeSound) {
      this.loadSnakeSound();
    }
  }

  async loadMoveSound() {
    this.isLoadingMoveSound = true;
    try {
      const response = await fetch('Footstep_Walking_Concrete_03.wav');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this.moveAudioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      console.log("Custom footstep sound loaded successfully!");
    } catch (err) {
      console.warn("Failed to load custom footstep audio, using synthesizer fallback:", err);
      this.isLoadingMoveSound = false;
    }
  }

  async loadSnakeSound() {
    this.isLoadingSnakeSound = true;
    try {
      const response = await fetch('snake%20bite.mp3');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this.snakeAudioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      console.log("Custom snake bite sound loaded successfully!");
    } catch (err) {
      console.warn("Failed to load custom snake bite audio, using synthesizer fallback:", err);
      this.isLoadingSnakeSound = false;
    }
  }

  toggle(enabled) {
    this.enabled = enabled;
    if (enabled) {
      this.init();
    }
  }

  createOscillator(type, freq, duration, startOffset = 0) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startOffset);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime + startOffset);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    return { osc, gain };
  }

  playMove() {
    if (!this.enabled) return;
    this.init();
    
    // Play custom footstep sound if loaded
    if (this.moveAudioBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.moveAudioBuffer;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.24, this.ctx.currentTime); // Standard comfortable volume
        
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (e) {
        console.warn("Error playing custom move buffer, falling back to synth:", e);
      }
    }
    
    // Fallback: Synthesized bubble pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playDiceShake() {
    if (!this.enabled) return;
    this.init();
    
    // Low frequency rumble/shake
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.3);
    
    // Add LFO modulation for shaking rumble
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 22; // 22Hz modulation
    lfoGain.gain.value = 30; // 30Hz range
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    lfo.start();
    osc.start();
    
    lfo.stop(this.ctx.currentTime + 0.3);
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playDiceRollClick(offset) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime + offset);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + offset + 0.03);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + offset + 0.03);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + offset);
    osc.stop(this.ctx.currentTime + offset + 0.03);
  }

  playDiceRoll() {
    if (!this.enabled) return;
    this.init();
    
    // Play a series of clicking sounds that decelerate over 1 second
    let delay = 0;
    const clicksCount = 8;
    for (let i = 0; i < clicksCount; i++) {
      // Linear deceleration curve
      delay += 0.04 + (i * 0.025);
      this.playDiceRollClick(delay);
    }
  }

  playLadderClimb() {
    if (!this.enabled) return;
    this.init();
    
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6 (ascending arpeggio)
    const noteDuration = 0.09;
    
    notes.forEach((freq, idx) => {
      const offset = idx * 0.08;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + offset);
      
      // Sweep bandpass filter for a "magical sparkle" sound
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime + offset);
      filter.frequency.exponentialRampToValueAtTime(freq * 3, this.ctx.currentTime + offset + noteDuration);
      filter.Q.value = 5;
      
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + offset);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + offset + noteDuration);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + offset);
      osc.stop(this.ctx.currentTime + offset + noteDuration);
    });
  }

  playSnakeBite() {
    if (!this.enabled) return;
    this.init();
    
    // Play custom snake bite audio if loaded
    if (this.snakeAudioBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.snakeAudioBuffer;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime); // Standard comfortable volume
        
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (e) {
        console.warn("Error playing custom snake bite buffer, falling back to synth:", e);
      }
    }
    
    // Fallback: Synthesized rattle hiss
    const duration = 1.2;
    
    // Create a white noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Bandpass filter for high-frequency hissing
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(5500, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);
    
    // Master volume envelope
    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.16, this.ctx.currentTime + 0.05);
    mainGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    // Rattle modulation
    const rattleGain = this.ctx.createGain();
    rattleGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sawtooth';
    lfo.frequency.setValueAtTime(16, this.ctx.currentTime); // 16Hz rapid rattling
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    
    // Hook up LFO to modulate rattle gain
    lfo.connect(lfoGain);
    lfoGain.connect(rattleGain.gain);
    
    // Signal routing
    noiseSource.connect(filter);
    filter.connect(rattleGain);
    rattleGain.connect(mainGain);
    mainGain.connect(this.ctx.destination);
    
    // Trigger playback
    lfo.start();
    noiseSource.start();
    
    lfo.stop(this.ctx.currentTime + duration);
    noiseSource.stop(this.ctx.currentTime + duration);
  }

  playVictory() {
    if (!this.enabled) return;
    this.stopMusic();
    
    const victoryAudio = new Audio('victory.mp3');
    victoryAudio.volume = 0.5;
    victoryAudio.play().catch(err => {
      console.warn("Error playing victory.mp3, falling back to synthesizer:", err);
      this.playVictorySynth();
    });
  }

  playVictorySynth() {
    this.init();
    
    // Triumphant arpeggios
    const tempo = 0.12;
    const playArpeggio = (baseNotes, startTime) => {
      baseNotes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime + (idx * tempo));
        
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + startTime + (idx * tempo));
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + startTime + (idx * tempo) + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + (idx * tempo) + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(this.ctx.currentTime + startTime + (idx * tempo));
        osc.stop(this.ctx.currentTime + startTime + (idx * tempo) + 0.25);
      });
    };

    // Arpeggio 1: C Major (C4, E4, G4, C5)
    playArpeggio([261.63, 329.63, 392.00, 523.25], 0);
    // Arpeggio 2: F Major (F4, A4, C5, F5)
    playArpeggio([349.23, 440.00, 523.25, 698.46], 0.45);
    // Arpeggio 3: G Major (G4, B4, D5, G5)
    playArpeggio([392.00, 493.88, 587.33, 783.99], 0.90);
    
    // Final Triumphant chord
    const finalChord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    finalChord.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + 1.35);
      
      vibrato.frequency.value = 6; // 6Hz vibrato
      vibratoGain.gain.value = freq * 0.01; // 1% vibrato depth
      
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + 1.35);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.4);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      vibrato.start(this.ctx.currentTime + 1.35);
      osc.start(this.ctx.currentTime + 1.35);
      
      vibrato.stop(this.ctx.currentTime + 3.0);
      osc.stop(this.ctx.currentTime + 3.0);
    });
  }

  playDefeat() {
    if (!this.enabled) return;
    this.stopMusic();
    
    const defeatAudio = new Audio('Defeat.mp3');
    defeatAudio.volume = 0.5;
    defeatAudio.play().catch(err => {
      console.warn("Error playing Defeat.mp3, falling back to synthesizer:", err);
      this.playDefeatSynth();
    });
  }

  playDefeatSynth() {
    this.init();
    
    // Melancholic, slow descending minor arpeggio
    const tempo = 0.25; 
    const notes = [440.00, 349.23, 329.63, 293.66, 261.63, 220.00, 146.83]; // A4, F4, E4, D4, C4, A3, D3
    
    notes.forEach((freq, idx) => {
      const startTime = idx * tempo;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
      osc.frequency.linearRampToValueAtTime(freq * 0.9, this.ctx.currentTime + startTime + 0.5); // Descending sigh
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + 0.6);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + 0.7);
    });
    
    // Low minor chord drone
    const droneChord = [110.00, 130.81, 164.81]; // A2, C3, E3
    droneChord.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 2.6);
    });
  }

  startMusic() {
    if (!this.enabled) return;
    if (this.bgMusic) {
      this.bgMusic.play().catch(err => console.log("Audio play blocked:", err));
      return;
    }
    this.bgMusic = new Audio('Serpent Board Loop.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.22;
    this.bgMusic.play().catch(err => console.log("Audio play blocked:", err));
  }

  stopMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  speakText(text, onEndCallback = null) {
    if (!this.enabled || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose a voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Snake parameters: low pitch, slightly slower rate
    utterance.pitch = 0.55; 
    utterance.rate = 0.82;  
    
    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };
    
    window.speechSynthesis.speak(utterance);
  }
}

// Export sound controller
const sound = new SoundController();
