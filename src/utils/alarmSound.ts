let audioContext: AudioContext | null = null;
let isPlaying = false;

export const playAlarmSound = () => {
  if (isPlaying) return;
  
  // Create audio context if it doesn't exist
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  isPlaying = true;

  // Create oscillators for a pleasant alarm sound
  const playTone = (frequency: number, duration: number, delay: number) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + delay + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + duration);

    oscillator.start(audioContext.currentTime + delay);
    oscillator.stop(audioContext.currentTime + delay + duration);
  };

  // Play a series of tones for the alarm
  const pattern = [
    { freq: 800, duration: 0.2, delay: 0 },
    { freq: 1000, duration: 0.2, delay: 0.25 },
    { freq: 800, duration: 0.2, delay: 0.5 },
    { freq: 1000, duration: 0.4, delay: 0.75 },
  ];

  pattern.forEach(({ freq, duration, delay }) => {
    playTone(freq, duration, delay);
  });

  // Vibrate if available
  if ("vibrate" in navigator) {
    navigator.vibrate([200, 100, 200, 100, 400]);
  }

  // Reset playing state after the sound completes
  setTimeout(() => {
    isPlaying = false;
  }, 1500);
};

export const stopAlarmSound = () => {
  isPlaying = false;
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};
