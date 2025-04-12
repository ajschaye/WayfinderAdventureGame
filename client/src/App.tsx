import { useState, useEffect, lazy, Suspense } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

// Lazy load the game component to avoid import issues
const RescueGame = lazy(() => import("./game/RescueGame"));

// Main App component
function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound, setClappingSound, setWaterSpraySound } = useAudio();
  const [loaded, setLoaded] = useState(false);

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
      
      // Load clapping sound for winning celebrations
      const clappingSfx = new Audio("/sounds/clapping.mp3");
      clappingSfx.volume = 0.3; // Lower volume for better experience
      setClappingSound(clappingSfx);
      
      // Load water spray sound
      const waterSpraySfx = new Audio("/sounds/water-spray.mp3");
      waterSpraySfx.volume = 0.6;
      setWaterSpraySound(waterSpraySfx);
    } catch (error) {
      console.error("Error loading audio:", error);
    }
    
    // Mark assets as loaded
    setLoaded(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound, setClappingSound, setWaterSpraySound]);

  return (
    <div style={{ 
      width: '100vw', 
      height: 'auto', // Changed from 100vh to auto
      minHeight: '100vh',
      position: 'relative', 
      overflow: 'visible', // Changed from auto to visible
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start', // Changed to flex-start
      background: '#e63946', // Red background as requested
      color: 'white',
      paddingTop: '60px', // Increased padding at the top
      paddingBottom: '30px' // Added padding at the bottom
    }}>
      <Suspense fallback={<div>Loading Rescue Adventure...</div>}>
        <RescueGame />
      </Suspense>
    </div>
  );
}

export default App;
