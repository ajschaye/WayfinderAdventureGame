import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRescueGame, ObstacleType, MAX_OBSTACLE_PERCENTAGE } from '../lib/stores/useRescueGame';
import { useAudio } from '../lib/stores/useAudio';
import { Volume2, VolumeX } from 'lucide-react';
import { Confetti } from '../components/game/Confetti';
import { useIsMobile } from '../hooks/use-is-mobile';
import fireTruckSvg from './assets/fire-truck.svg';
import fireSvg from './assets/fire.svg';
import obstacleSvg from './assets/obstacle.svg';
import puddleSvg from './assets/puddle.svg';
import fallenTreeSvg from './assets/fallen-tree.svg';
import trafficConeSvg from './assets/traffic-cone.svg';
import bouncingBallSvg from './assets/bouncing-ball.svg';
import gooseSvg from './assets/goose.svg';
import waterSpraySvg from './assets/water-spray.svg';

const RescueGame: React.FC = () => {
  const {
    gridSize,
    obstacleCount,
    gameState,
    fireTruckPosition,
    firePosition,
    obstacles,
    moveTruck,
    checkWinCondition,
    startGame,
    stopGame,
    resetGame,
    setGridSize,
    setObstacleCount
  } = useRescueGame();

  const { toggleMute, isMuted, playHit, playSuccess, playClapping, playWaterSpray, backgroundMusic } = useAudio();
  
  // Check if the user is on a mobile device
  const isMobile = useIsMobile();

  // Local state for input values
  const [gridSizeInput, setGridSizeInput] = useState(gridSize.x);
  const [obstacleCountInput, setObstacleCountInput] = useState(obstacleCount);
  
  // State to track if the water spray effect is active
  const [isSprayingWater, setIsSprayingWater] = useState(false);
  
  // Calculate if the truck is next to the fire (but not on it)
  const isNextToFire = 
    (Math.abs(fireTruckPosition.x - firePosition.x) === 1 && fireTruckPosition.y === firePosition.y) || 
    (Math.abs(fireTruckPosition.y - firePosition.y) === 1 && fireTruckPosition.x === firePosition.x);

  // Function to handle water spraying when truck is next to fire
  const handleFireExtinguishing = useCallback(() => {
    if (!isNextToFire || isSprayingWater) return false;
    
    // Start spraying water
    setIsSprayingWater(true);
    playWaterSpray();
    
    // After spraying animation, allow the truck to move to the fire's position
    setTimeout(() => {
      console.log("Moving truck to fire position after spraying water");
      
      // If the truck is to the left of the fire
      if (fireTruckPosition.x < firePosition.x) {
        moveTruck(1, 0);
      }
      // If the truck is to the right of the fire
      else if (fireTruckPosition.x > firePosition.x) {
        moveTruck(-1, 0);
      }
      // If the truck is above the fire
      else if (fireTruckPosition.y < firePosition.y) {
        moveTruck(0, 1);
      }
      // If the truck is below the fire
      else if (fireTruckPosition.y > firePosition.y) {
        moveTruck(0, -1);
      }
      
      // Check win condition after moving
      setTimeout(() => {
        console.log("Checking win condition after truck moved to fire");
        checkWinCondition();
        setIsSprayingWater(false);
      }, 300); // Increased timeout to ensure movement completes
    }, 1500); // Spray water for 1.5 seconds before moving
    
    return true;
  }, [isNextToFire, isSprayingWater, firePosition, fireTruckPosition, moveTruck, playWaterSpray, checkWinCondition]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent arrow keys from scrolling the window
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
      e.preventDefault();
    }
    
    if (gameState !== 'playing' || isSprayingWater) return;

    // If next to fire and the key would move towards the fire, start spraying
    if (isNextToFire) {
      const wouldMoveToFire = 
        (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && fireTruckPosition.x < firePosition.x ||
        (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && fireTruckPosition.x > firePosition.x ||
        (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && fireTruckPosition.y < firePosition.y ||
        (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && fireTruckPosition.y > firePosition.y;
      
      if (wouldMoveToFire && handleFireExtinguishing()) {
        return;
      }
    }

    // Normal movement
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        moveTruck(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        moveTruck(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        moveTruck(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        moveTruck(1, 0);
        break;
      default:
        return;
    }
  }, [gameState, isSprayingWater, isNextToFire, fireTruckPosition, firePosition, handleFireExtinguishing, moveTruck]);

  // References for swipe detection
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const touchTimeoutRef = useRef<number | null>(null);
  
  // State for swipe feedback
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const swipeFeedbackTimeoutRef = useRef<number | null>(null);
  
  // Handle swipe directional controls
  const handleSwipe = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'playing' || isSprayingWater) return;
    
    // Check if next to fire and would move towards the fire
    if (isNextToFire) {
      const wouldMoveToFire = 
        (direction === 'right') && fireTruckPosition.x < firePosition.x ||
        (direction === 'left') && fireTruckPosition.x > firePosition.x ||
        (direction === 'down') && fireTruckPosition.y < firePosition.y ||
        (direction === 'up') && fireTruckPosition.y > firePosition.y;
      
      if (wouldMoveToFire && handleFireExtinguishing()) {
        return;
      }
    }
    
    // Normal movement
    switch (direction) {
      case 'up':
        moveTruck(0, -1);
        break;
      case 'down':
        moveTruck(0, 1);
        break;
      case 'left':
        moveTruck(-1, 0);
        break;
      case 'right':
        moveTruck(1, 0);
        break;
    }
  }, [gameState, isSprayingWater, isNextToFire, fireTruckPosition, firePosition, handleFireExtinguishing, moveTruck]);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (gameState !== 'playing' || isSprayingWater) return;
    
    // Store the initial touch position
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Clear any existing timeout
    if (touchTimeoutRef.current !== null) {
      window.clearTimeout(touchTimeoutRef.current);
    }
  }, [gameState, isSprayingWater]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (gameState !== 'playing' || !touchStartRef.current || isSprayingWater) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    
    // Calculate distance and angle
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Only register as a swipe if the distance is significant
    if (distance < 20) return;
    
    // Determine swipe direction
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    
    let direction: 'up' | 'down' | 'left' | 'right';
    
    if (absX > absY) {
      // Horizontal swipe
      if (dx > 0) {
        direction = 'right';
      } else {
        direction = 'left';
      }
    } else {
      // Vertical swipe
      if (dy > 0) {
        direction = 'down';
      } else {
        direction = 'up';
      }
    }
    
    // Show visual feedback for the swipe
    setSwipeDirection(direction);
    
    // Clear any existing swipe feedback timeout
    if (swipeFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(swipeFeedbackTimeoutRef.current);
    }
    
    // Hide swipe feedback after a short delay
    swipeFeedbackTimeoutRef.current = window.setTimeout(() => {
      setSwipeDirection(null);
      swipeFeedbackTimeoutRef.current = null;
    }, 500);
    
    // Perform the swipe action
    handleSwipe(direction);
    
    // Reset the touch start position
    touchStartRef.current = null;
    
    // Add a short cooldown to prevent multiple swipes
    touchTimeoutRef.current = window.setTimeout(() => {
      touchTimeoutRef.current = null;
    }, 200);
  }, [gameState, isSprayingWater, handleSwipe]);

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update game settings when inputs change
  useEffect(() => {
    setGridSize(gridSizeInput, gridSizeInput);
    
    // Calculate max obstacles for new grid size
    const maxObstacles = Math.floor(gridSizeInput * gridSizeInput * MAX_OBSTACLE_PERCENTAGE);
    
    // If current obstacle count exceeds the new maximum, adjust it down
    if (obstacleCountInput > maxObstacles) {
      setObstacleCountInput(maxObstacles);
    }
  }, [gridSizeInput, setGridSize, obstacleCountInput]);
  
  useEffect(() => {
    setObstacleCount(obstacleCountInput);
  }, [obstacleCountInput, setObstacleCount]);

  // Play background music when game starts
  useEffect(() => {
    if (gameState === "playing" && backgroundMusic && !isMuted) {
      backgroundMusic.play();
    } else if (backgroundMusic) {
      backgroundMusic.pause();
    }
  }, [gameState, backgroundMusic, isMuted]);

  // Handle winning effects (confetti and clapping sound)
  useEffect(() => {
    if (gameState === "won") {
      // Play clapping sound when the player wins
      playClapping();
      // Play success sound as well
      playSuccess();
    }
  }, [gameState, playClapping, playSuccess]);
  
  // Calculate cell size to fit grid in the container width
  const maxContainerWidth = Math.min(window.innerWidth * 0.85, 800) - 40; // 40px accounts for padding
  const cellSize = Math.floor(maxContainerWidth / gridSize.x);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      fontFamily: "'Inter', sans-serif",
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '0 10px 10px 10px', // Removed top padding
      overflowY: 'hidden', // Prevent vertical scrolling when using arrow keys
      overflowX: 'hidden',
      minHeight: '100vh',
      height: 'auto',
      backgroundColor: '#e63946', // Red background
      position: 'relative'
    }}>
      {/* Confetti effect when player wins */}
      <Confetti active={gameState === "won"} duration={5000} />
      {/* Game title */}
      <div className="game-title" style={{
        display: "block",
        width: "100%",
        padding: "15px 5px",
        margin: "0 0 20px 0",
        backgroundColor: "#ffd166",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        textAlign: "center",
        color: "#d62828",
        fontWeight: "bold",
        fontSize: "32px", // Reduced font size for better fit
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        🚒 Fire Rescue Adventure 🚒
      </div>
      
      {/* Game controls panel */}
      <div style={{
        backgroundColor: "#e63946", // Changed from white to match the background
        padding: "15px",
        width: "100%",
        marginBottom: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        color: "white" // Changed text color to white for better contrast
      }}>
        
        {/* Grid size control */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label htmlFor="gridSize">Size of grid:</label>
          <input
            id="gridSize"
            type="range"
            min="3"
            max="10"
            value={gridSizeInput}
            onChange={(e) => setGridSizeInput(parseInt(e.target.value))}
            disabled={gameState === "playing"}
            style={{ width: "50%" }}
          />
          <span>{gridSizeInput} x {gridSizeInput}</span>
        </div>
        
        {/* Obstacle count control */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label htmlFor="obstacles">Number of obstacles:</label>
          <input
            id="obstacles"
            type="range"
            min="0"
            max={Math.floor(gridSizeInput * gridSizeInput * MAX_OBSTACLE_PERCENTAGE)}
            value={obstacleCountInput}
            onChange={(e) => setObstacleCountInput(parseInt(e.target.value))}
            disabled={gameState === "playing"}
            style={{ width: "50%" }}
          />
          <span>{obstacleCountInput}</span>
        </div>
      </div>
      
      {/* Sound toggle button in lower right corner */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 100
      }}>
        <button
          onClick={toggleMute}
          style={{
            backgroundColor: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={24} color="#e63946" /> : <Volume2 size={24} color="#4CAF50" />}
        </button>
      </div>
      
      {/* Play/stop button */}
      <div style={{
        backgroundColor: "#ffd166",
        borderRadius: "50px",
        padding: "10px 30px",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        color: "#d62828"
      }}
      onClick={() => {
        if (gameState === "playing") {
          stopGame();
        } else if (gameState === "ready" || gameState === "stopped") {
          startGame();
        } else if (gameState === "won") {
          resetGame();
        }
      }}>
        {gameState === "playing" ? "Stop" : gameState === "won" ? "Play Again" : "Play"}
      </div>
      
      {/* Game grid container */}
      <div style={{
        width: "100%",
        backgroundColor: '#ccc',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        display: 'flex',
        justifyContent: 'center',
        overflow: 'visible'
      }}>
        {/* Game grid with touch event handlers */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize.x}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize.y}, ${cellSize}px)`,
            gap: '2px',
            minWidth: 'fit-content'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Generate grid cells */}
          {Array.from({ length: gridSize.y }).map((_, y) =>
            Array.from({ length: gridSize.x }).map((_, x) => {
              // Determine cell content
              const isFireTruck = x === fireTruckPosition.x && y === fireTruckPosition.y;
              const isFire = x === firePosition.x && y === firePosition.y;
              const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
              
              // Set cell content and style
              let cellContent = null;
              let cellStyle: React.CSSProperties = {
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: '#eee',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '4px'
              };

              if (isFireTruck) {
                // Set background color to black for fire truck cell
                cellStyle.backgroundColor = '#000';
                
                // Determine if water spray should be shown from this fire truck
                const showWaterSpray = isSprayingWater && isNextToFire;
                
                // Calculate direction from fire truck to fire
                let sprayDirection = "0deg";
                if (showWaterSpray) {
                  if (fireTruckPosition.x < firePosition.x) sprayDirection = "0deg"; // Spray right
                  else if (fireTruckPosition.x > firePosition.x) sprayDirection = "180deg"; // Spray left
                  else if (fireTruckPosition.y < firePosition.y) sprayDirection = "90deg"; // Spray down
                  else if (fireTruckPosition.y > firePosition.y) sprayDirection = "270deg"; // Spray up
                }
                
                cellContent = (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                      src={fireTruckSvg} 
                      alt="Fire Truck" 
                      style={{ 
                        width: '85%', 
                        height: '85%',
                        animation: gameState === 'won' ? 'spin 1s linear infinite' : 'bob 1s ease-in-out infinite',
                        zIndex: 1
                      }} 
                    />
                    
                    {/* Water spray */}
                    {showWaterSpray && (
                      <div style={{ 
                        position: 'absolute', 
                        transform: `rotate(${sprayDirection})`, 
                        width: '150%', 
                        height: '150%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        pointerEvents: 'none'
                      }}>
                        <img 
                          src={waterSpraySvg} 
                          alt="Water Spray" 
                          style={{ 
                            width: '100%', 
                            height: '100%',
                            animation: 'spray 0.5s ease-in-out infinite alternate'
                          }} 
                        />
                      </div>
                    )}
                  </div>
                );
              } else if (isFire) {
                cellContent = (
                  <img 
                    src={fireSvg} 
                    alt="Fire" 
                    style={{ 
                      width: '85%', 
                      height: '85%',
                      animation: gameState === 'won' ? 'shrink 1s linear forwards' : 
                                isSprayingWater && isNextToFire ? 'flicker 0.2s ease-in-out infinite' : 
                                'flicker 0.5s ease-in-out infinite'
                    }} 
                  />
                );
              } else if (isObstacle) {
                // Find the obstacle type
                const obstacle = obstacles.find(obs => obs.x === x && obs.y === y);
                
                // Get the correct SVG based on the obstacle type
                const getObstacleSvg = (type: ObstacleType) => {
                  switch (type) {
                    case 'puddle':
                      return { src: puddleSvg, alt: "Water Puddle", animation: "pulse 3s ease-in-out infinite" };
                    case 'fallen-tree':
                      return { src: fallenTreeSvg, alt: "Fallen Tree", animation: "none" };
                    case 'traffic-cone':
                      return { src: trafficConeSvg, alt: "Traffic Cone", animation: "pulse 2s ease-in-out infinite" };
                    case 'bouncing-ball':
                      return { src: bouncingBallSvg, alt: "Bouncing Ball", animation: "bounce 0.5s alternate infinite" };
                    case 'goose':
                      return { src: gooseSvg, alt: "Goose", animation: "waddle 1s ease-in-out infinite" };
                    default:
                      return { src: obstacleSvg, alt: "Obstacle", animation: "pulse 2s ease-in-out infinite" };
                  }
                };
                
                const { src, alt, animation } = getObstacleSvg(obstacle?.type || 'puddle');
                
                cellContent = (
                  <img 
                    src={src} 
                    alt={alt} 
                    style={{ 
                      width: '85%', 
                      height: '85%',
                      animation: gameState === 'playing' ? animation : 'none'
                    }} 
                  />
                );
              }

              return (
                <div key={`${x}-${y}`} style={cellStyle}>
                  {cellContent}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Swipe direction indicator */}
      {isMobile && gameState === "playing" && swipeDirection && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(255, 209, 102, 0.6)",
          borderRadius: "8px",
          padding: "10px",
          zIndex: 100,
          fontSize: "24px",
          fontWeight: "bold",
          color: "#d62828",
          animation: "fadeOut 0.5s forwards",
          pointerEvents: "none"
        }}>
          {swipeDirection === 'up' && '⬆️'}
          {swipeDirection === 'down' && '⬇️'}
          {swipeDirection === 'left' && '⬅️'}
          {swipeDirection === 'right' && '➡️'}
        </div>
      )}
      
      {/* Win message */}
      {gameState === "won" && (
        <div style={{
          backgroundColor: "rgba(76, 175, 80, 0.9)",
          color: "white",
          padding: "20px",
          borderRadius: "8px",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 100,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          minWidth: "400px",
          maxWidth: "90%"
        }}>
          Great job! 🎊<br />
          You put out the fire!
        </div>
      )}
      

      
      {/* Game instructions */}
      {(gameState === "ready" || gameState === "playing") && (
        <div style={{
          width: "100%",
          maxWidth: "600px",
          textAlign: "center",
          color: "black",
          marginTop: "20px",
          padding: "0 20px",
          boxSizing: "border-box"
        }}>
          <p style={{ fontSize: "18px", marginBottom: "8px" }}>
            {isMobile ? 
              "Swipe in any direction to move the fire truck to the fire!" :
              "Use arrow keys (or WASD) to move the fire truck to the fire!"}
          </p>
          {gameState === "ready" && <p style={{ fontSize: "18px", margin: 0 }}>Press the Play button to begin.</p>}
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes flicker {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.95); opacity: 0.9; }
          }
          
          @keyframes shrink {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.95); }
          }
          
          @keyframes spray {
            0% { transform: scaleX(0.9) scaleY(0.9); opacity: 0.7; }
            100% { transform: scaleX(1.1) scaleY(1.1); opacity: 1; }
          }
          
          @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-10px); }
          }
          
          @keyframes waddle {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
          
          @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default RescueGame;