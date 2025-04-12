import { useState, useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import RescueGame from "./game/RescueGame";

// Main App component
function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load audio assets
  useEffect(() => {
    try {
      // Load background music
      const bgMusic = new Audio("/sounds/background.mp3");
      bgMusic.loop = true;
      bgMusic.volume = 0.3;
      setBackgroundMusic(bgMusic);

      // Load hit sound for collisions
      const hitSfx = new Audio("/sounds/hit.mp3");
      hitSfx.volume = 0.5;
      setHitSound(hitSfx);

      // Load success sound for winning
      const successSfx = new Audio("/sounds/success.mp3");
      successSfx.volume = 0.7;
      setSuccessSound(successSfx);
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0' }}>
      <RescueGame />
    </div>
  );
}

export default App;
