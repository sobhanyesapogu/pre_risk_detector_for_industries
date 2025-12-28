/**
 * Audio utility for ProSentry dashboard sound effects
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;
  private isInitialized = false;

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      // Multiple event listeners to ensure initialization
      ['click', 'keydown', 'touchstart'].forEach(event => {
        document.addEventListener(event, this.initAudioContext.bind(this), { once: true });
      });
    }
  }

  private initAudioContext() {
    try {
      if (!this.audioContext && !this.isInitialized) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.isInitialized = true;
        console.log('Audio context initialized successfully');
      }
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
      this.isEnabled = false;
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }

  private async createBeep(frequency: number, duration: number, volume: number = 0.1) {
    if (!this.isEnabled) return;
    
    try {
      await this.ensureAudioContext();
      
      if (!this.audioContext || this.audioContext.state !== 'running') {
        console.warn('Audio context not available or not running');
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
      // Clean up after sound finishes
      setTimeout(() => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
      }, (duration + 0.1) * 1000);
      
    } catch (error) {
      console.warn('Error creating beep:', error);
    }
  }

  // Subtle scanning beep for data updates
  scanningBeep() {
    this.createBeep(800, 0.1, 0.05);
  }

  // Button click sound
  buttonClick() {
    this.createBeep(1200, 0.05, 0.08);
  }

  // Risk level change sound
  riskLevelChange(level: 'Low' | 'Medium' | 'High') {
    switch (level) {
      case 'Low':
        this.createBeep(600, 0.15, 0.06);
        break;
      case 'Medium':
        this.createBeep(800, 0.2, 0.08);
        break;
      case 'High':
        // Double beep for high risk
        this.createBeep(1000, 0.15, 0.1);
        setTimeout(() => this.createBeep(1200, 0.15, 0.1), 150);
        break;
    }
  }

  // Critical alert sound
  criticalAlert() {
    // Urgent triple beep pattern
    [0, 200, 400].forEach(delay => {
      setTimeout(() => this.createBeep(1500, 0.2, 0.12), delay);
    });
  }

  // Simulation start sound
  simulationStart() {
    // Rising tone sequence
    [600, 700, 800].forEach((freq, i) => {
      setTimeout(() => this.createBeep(freq, 0.1, 0.07), i * 100);
    });
  }

  // Simulation stop sound
  simulationStop() {
    // Descending tone
    [800, 600, 400].forEach((freq, i) => {
      setTimeout(() => this.createBeep(freq, 0.15, 0.06), i * 80);
    });
  }

  // Toggle sound on/off
  toggleSound() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.buttonClick();
    }
  }

  get soundEnabled() {
    return this.isEnabled;
  }

  // Manual initialization method
  async initialize() {
    await this.ensureAudioContext();
  }
}

// Export singleton instance
export const soundManager = new SoundManager();