// Sistema de efeitos sonoros cyberpunk para Shark Loterias

interface SoundConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;
  volume: number;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

class CyberpunkSoundEngine {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private masterVolume: number = 0.3;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Web Audio API não suportado neste navegador');
      this.isEnabled = false;
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Som de alerta digital agressivo quando gera palpites
  async playSharkAlert() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    const config: SoundConfig = {
      frequency: 800,
      type: 'sawtooth',
      duration: 0.3,
      volume: this.masterVolume * 0.8,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 }
    };

    // Sequência de 3 bipes agressivos
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone({
          ...config,
          frequency: config.frequency + (i * 200)
        });
      }, i * 150);
    }
  }

  // Som de "rugido digital" quando entra no modo Shark Attack
  async playSharkAttackMode() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    // Rugido grave cyberpunk
    this.playTone({
      frequency: 60,
      type: 'sawtooth',
      duration: 1.2,
      volume: this.masterVolume,
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.5 }
    });

    // Harmônico agudo sobreposto
    setTimeout(() => {
      this.playTone({
        frequency: 1200,
        type: 'square',
        duration: 0.4,
        volume: this.masterVolume * 0.6,
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3 }
      });
    }, 200);
  }

  // Som de sucesso quando encontra padrões
  async playPatternFound() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    // Sequência ascendente cyberpunk
    const frequencies = [440, 554, 659, 880];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          type: 'sine',
          duration: 0.2,
          volume: this.masterVolume * 0.7,
          envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.15 }
        });
      }, index * 100);
    });
  }

  // Som de scan/análise
  async playScanSound() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    // Som de varredura digital
    const startTime = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(2000, startTime + 0.8);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.8);
  }

  // Som de erro crítico
  async playErrorSound() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    // Alarme vermelho digital
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        this.playTone({
          frequency: 150,
          type: 'square',
          duration: 0.4,
          volume: this.masterVolume * 0.9,
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.1 }
        });
      }, i * 500);
    }
  }

  // Som de clique cyberpunk para botões
  async playClickSound() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    this.playTone({
      frequency: 1200,
      type: 'square',
      duration: 0.05,
      volume: this.masterVolume * 0.3,
      envelope: { attack: 0.01, decay: 0.02, sustain: 0.5, release: 0.02 }
    });
  }

  // Som de notificação importante
  async playNotification() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    // Sequência de notificação cyberpunk
    const sequence = [880, 1108, 880, 1108];
    sequence.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          type: 'sine',
          duration: 0.15,
          volume: this.masterVolume * 0.6,
          envelope: { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.09 }
        });
      }, index * 200);
    });
  }

  private playTone(config: SoundConfig) {
    if (!this.audioContext) return;

    const startTime = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, startTime);
    
    if (config.envelope) {
      const { attack, decay, sustain, release } = config.envelope;
      const sustainLevel = config.volume * sustain;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(config.volume, startTime + attack);
      gainNode.gain.exponentialRampToValueAtTime(sustainLevel, startTime + attack + decay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + config.duration);
    } else {
      gainNode.gain.setValueAtTime(config.volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + config.duration);
    }
    
    oscillator.start(startTime);
    oscillator.stop(startTime + config.duration);
  }

  // Configurações
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  getEnabled() {
    return this.isEnabled;
  }

  getVolume() {
    return this.masterVolume;
  }
}

// Instância singleton
export const cyberpunkSound = new CyberpunkSoundEngine();

// Hook para usar os sons de forma reativa
export function useCyberpunkSounds() {
  return {
    playSharkAlert: () => cyberpunkSound.playSharkAlert(),
    playSharkAttackMode: () => cyberpunkSound.playSharkAttackMode(),
    playPatternFound: () => cyberpunkSound.playPatternFound(),
    playScanSound: () => cyberpunkSound.playScanSound(),
    playErrorSound: () => cyberpunkSound.playErrorSound(),
    playClickSound: () => cyberpunkSound.playClickSound(),
    playNotification: () => cyberpunkSound.playNotification(),
    setEnabled: (enabled: boolean) => cyberpunkSound.setEnabled(enabled),
    setVolume: (volume: number) => cyberpunkSound.setVolume(volume),
    getEnabled: () => cyberpunkSound.getEnabled(),
    getVolume: () => cyberpunkSound.getVolume(),
  };
}