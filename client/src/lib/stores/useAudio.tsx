import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  clappingSound: HTMLAudioElement | null;
  waterSpraySound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setClappingSound: (sound: HTMLAudioElement) => void;
  setWaterSpraySound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playClapping: () => void;
  playWaterSpray: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  clappingSound: null,
  waterSpraySound: null,
  isMuted: false, // Start with sound on by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setClappingSound: (sound) => set({ clappingSound: sound }),
  setWaterSpraySound: (sound) => set({ waterSpraySound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playClapping: () => {
    const { clappingSound, isMuted } = get();
    if (clappingSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Clapping sound skipped (muted)");
        return;
      }
      
      clappingSound.currentTime = 0;
      clappingSound.volume = 0.5;
      clappingSound.play().catch(error => {
        console.log("Clapping sound play prevented:", error);
      });
      
      // Stop after 5 seconds
      setTimeout(() => {
        clappingSound.pause();
        clappingSound.currentTime = 0;
      }, 5000);
    }
  },
  
  playWaterSpray: () => {
    const { waterSpraySound, isMuted } = get();
    if (waterSpraySound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Water spray sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow playing even if already playing
      const soundClone = waterSpraySound.cloneNode() as HTMLAudioElement;
      soundClone.currentTime = 0;
      soundClone.volume = 0.4; // Slightly lower volume
      soundClone.play().catch(error => {
        console.log("Water spray sound play prevented:", error);
      });
      
      // Stop after 2 seconds
      setTimeout(() => {
        soundClone.pause();
        soundClone.currentTime = 0;
      }, 2000);
    } else {
      console.log("Water spray sound not loaded");
    }
  }
}));
