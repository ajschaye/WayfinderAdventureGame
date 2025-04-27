import { useState, useEffect, lazy, Suspense } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

// Lazy load the game component to avoid import issues
const RescueGame = lazy(() => import("./game/RescueGame"));

// Main App component
function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound, setClappingSound, setFlowerScatteringSound } = useAudio();
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
      
      // Load flower scattering sound
      const flowerScatteringSfx = new Audio("/sounds/flower-scattering.mp3");
      flowerScatteringSfx.volume = 0.6;
      setFlowerScatteringSound(flowerScatteringSfx);
    } catch (error) {
      console.error("Error loading audio:", error);
    }
    
    // Mark assets as loaded
    setLoaded(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound, setClappingSound, setFlowerScatteringSound]);

  return (
    <div style={{ 
      width: '100vw', 
      height: 'auto',
      minHeight: '100vh',
      position: 'relative', 
      overflow: 'visible',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start',
      background: '#0077b6', // Ocean blue background
      color: 'white',
      paddingTop: '0', // Removed padding at the top
      paddingBottom: '30px'
    }}>
      <Suspense fallback={<div>Loading Rescue Adventure...</div>}>
        <RescueGame />
      </Suspense>
    </div>
  );
}

export default App;
