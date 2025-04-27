import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRescueGame, ObstacleType, Obstacle, MAX_OBSTACLE_PERCENTAGE } from '../lib/stores/useRescueGame';
import { useAudio } from '../lib/stores/useAudio';
import { Volume2, VolumeX } from 'lucide-react';
import { Confetti } from '../components/game/Confetti';
import { useIsMobile } from '../hooks/use-is-mobile';
import sailboatSvg from './assets/sailboat.svg';
import tropicalIslandSvg from './assets/tropical-island.svg';
import obstacleSvg from './assets/obstacle.svg';
import sharkSvg from './assets/shark.svg';
import coconutSvg from './assets/coconut.svg';
import giantClamSvg from './assets/giant-clam.svg';
import waterSpraySvg from './assets/water-spray.svg';
import tropicalFlowersSvg from './assets/tropical-flowers.svg';

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
    setObstacleCount,
    visitsCount,
    gamesPlayedCount,
    gamesWonCount
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

  // Function to handle scattering tropical flowers when boat is next to island
  const handleFireExtinguishing = useCallback(() => {
    if (!isNextToFire || isSprayingWater) return false;
    
    // Start scattering tropical flowers
    setIsSprayingWater(true);
    playWaterSpray();
    
    // After flower scattering animation, allow the boat to move to the island's position
    setTimeout(() => {
      console.log("Moving sailboat to island position after scattering tropical flowers");
      
      // If the boat is to the left of the island
      if (fireTruckPosition.x < firePosition.x) {
        moveTruck(1, 0);
      }
      // If the boat is to the right of the island
      else if (fireTruckPosition.x > firePosition.x) {
        moveTruck(-1, 0);
      }
      // If the boat is above the island
      else if (fireTruckPosition.y < firePosition.y) {
        moveTruck(0, 1);
      }
      // If the boat is below the island
      else if (fireTruckPosition.y > firePosition.y) {
        moveTruck(0, -1);
      }
      
      // Check win condition after moving
      setTimeout(() => {
        console.log("Checking win condition after sailboat reached the island");
        checkWinCondition();
        setIsSprayingWater(false);
      }, 300); // Increased timeout to ensure movement completes
    }, 1500); // Scatter flowers for 1.5 seconds before moving
    
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
      padding: '0 10px 30px 10px', // Added more bottom padding for the stats bar
      overflowY: 'auto', // Changed to auto to allow scrolling
      overflowX: 'hidden',
      minHeight: '100vh',
      height: 'auto',
      backgroundColor: '#0077b6', // Ocean blue background
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
        backgroundColor: "#4cc9f0",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        textAlign: "center",
        color: "#03045e",
        fontWeight: "bold",
        fontSize: "32px", // Reduced font size for better fit
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        ⛵ The Wayfinder's Adventure ⛵
      </div>
      
      {/* Game controls panel */}
      <div style={{
        backgroundColor: "#0096c7", // Ocean blue panel
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
        backgroundColor: "#90e0ef",
        borderRadius: "50px",
        padding: "10px 30px",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        color: "#03045e"
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
        backgroundColor: '#ade8f4',
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
              
              // Enhanced function to check if a position is part of a giant clam
              const isPartOfGiantClam = (posX: number, posY: number): Obstacle | undefined => {
                // Find the first giant clam obstacle that contains this position
                return obstacles.find(obs => 
                  obs.type === 'giant-clam' && 
                  ((posX === obs.x && posY === obs.y) || // Top-left
                   (posX === obs.x + 1 && posY === obs.y) || // Top-right
                   (posX === obs.x && posY === obs.y + 1) || // Bottom-left
                   (posX === obs.x + 1 && posY === obs.y + 1)) // Bottom-right
                );
              };
              
              // Check if this cell is part of a giant clam
              const giantClamObstacle = isPartOfGiantClam(x, y);
              const isGiantClam = !!giantClamObstacle;
              
              // Set cell content and style
              let cellContent = null;
              let cellStyle: React.CSSProperties = {
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: '#eee',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                borderBottomLeftRadius: '4px',
                borderBottomRightRadius: '4px',
                border: '1px solid #ccc', // Default border for all cells
                boxSizing: 'border-box' // Ensure border doesn't affect layout
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
                      src={sailboatSvg} 
                      alt="Sailboat" 
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
                          src={tropicalFlowersSvg} 
                          alt="Tropical Flowers" 
                          style={{ 
                            width: '120%', 
                            height: '120%',
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
                    src={tropicalIslandSvg} 
                    alt="Tropical Island" 
                    style={{ 
                      width: '85%', 
                      height: '85%',
                      animation: gameState === 'won' ? 'shrink 1s linear forwards' : 
                                isSprayingWater && isNextToFire ? 'flicker 0.2s ease-in-out infinite' : 
                                'flicker 0.5s ease-in-out infinite'
                    }} 
                  />
                );
              } else if (isObstacle || isGiantClam) {
                // For normal obstacles, use the obstacle at this position
                // For giant clams, use the found clam obstacle (which might be elsewhere in the 2x2 grid)
                const obstacle = isObstacle 
                  ? obstacles.find(obs => obs.x === x && obs.y === y)
                  : giantClamObstacle;
                
                // Get the correct SVG based on the obstacle type
                const getObstacleSvg = (type: ObstacleType) => {
                  switch (type) {
                    case 'shark':
                      return { src: sharkSvg, alt: "Shark", animation: "pulse 3s ease-in-out infinite" };
                    case 'coconut':
                      return { src: coconutSvg, alt: "Coconut", animation: "bounce 0.5s alternate infinite" };
                    case 'giant-clam':
                      return { src: giantClamSvg, alt: "Giant Clam", animation: "pulse 2s ease-in-out infinite" };
                    default:
                      return { src: sharkSvg, alt: "Shark", animation: "pulse 2s ease-in-out infinite" };
                  }
                };
                
                const { src, alt, animation } = getObstacleSvg(obstacle?.type || 'shark');
                
                // For giant clams, render each cell as part of the 2x2 grid
                if (obstacle?.type === 'giant-clam' && giantClamObstacle) {
                  // Create a single wrapper div that will contain the 2x2 grid
                  // First determine which corner of the 2x2 grid this cell is
                  const isTopLeft = x === giantClamObstacle.x && y === giantClamObstacle.y;
                  const isTopRight = x === giantClamObstacle.x + 1 && y === giantClamObstacle.y;
                  const isBottomLeft = x === giantClamObstacle.x && y === giantClamObstacle.y + 1;
                  const isBottomRight = x === giantClamObstacle.x + 1 && y === giantClamObstacle.y + 1;
                  
                  // Each cell will simply be a colored background with appropriate borders
                  cellStyle = {
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: '#90e0ef', // Light blue background for clam area
                    position: 'relative',
                    boxSizing: 'border-box',
                    border: 'none', // Reset borders to avoid style conflicts
                  };
                  
                  // Add the appropriate border style based on position
                  if (isTopLeft) {
                    // Add specific borders for each corner to avoid style conflicts
                    Object.assign(cellStyle, {
                      borderTop: '2px solid #0096c7',
                      borderLeft: '2px solid #0096c7',
                      borderTopLeftRadius: '8px',
                      borderRight: 'none',
                      borderBottom: 'none',
                      borderTopRightRadius: '0px',
                      borderBottomLeftRadius: '0px',
                      borderBottomRightRadius: '0px'
                    });
                    
                    // Only the top-left cell will hold the image for the entire 2x2 grid
                    cellContent = (
                      <div style={{
                        position: 'absolute',
                        width: `${cellSize * 2}px`,
                        height: `${cellSize * 2}px`,
                        top: 0,
                        left: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        pointerEvents: 'none', // Prevent capturing touch/mouse events
                      }}>
                        <img 
                          src={src} 
                          alt={alt} 
                          style={{ 
                            width: '85%', 
                            height: '85%',
                            animation: gameState === 'playing' ? animation : 'none'
                          }} 
                        />
                      </div>
                    );
                  } else if (isTopRight) {
                    Object.assign(cellStyle, {
                      borderTop: '2px solid #0096c7',
                      borderRight: '2px solid #0096c7',
                      borderTopRightRadius: '8px',
                      borderLeft: 'none',
                      borderBottom: 'none',
                      borderTopLeftRadius: '0px',
                      borderBottomLeftRadius: '0px',
                      borderBottomRightRadius: '0px'
                    });
                    cellContent = null;
                  } else if (isBottomLeft) {
                    Object.assign(cellStyle, {
                      borderLeft: '2px solid #0096c7',
                      borderBottom: '2px solid #0096c7',
                      borderBottomLeftRadius: '8px',
                      borderTop: 'none',
                      borderRight: 'none',
                      borderTopRightRadius: '0px',
                      borderTopLeftRadius: '0px',
                      borderBottomRightRadius: '0px'
                    });
                    cellContent = null;
                  } else if (isBottomRight) {
                    Object.assign(cellStyle, {
                      borderRight: '2px solid #0096c7',
                      borderBottom: '2px solid #0096c7',
                      borderBottomRightRadius: '8px',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderTopRightRadius: '0px',
                      borderTopLeftRadius: '0px',
                      borderBottomLeftRadius: '0px'
                    });
                    cellContent = null;
                  }
                } else {
                  // Regular obstacle
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
          backgroundColor: "rgba(0, 119, 182, 0.9)",
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
          Congratulations! 🏝️<br />
          You've reached the tropical island!
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
              "Swipe in any direction to sail your boat to the tropical island!" :
              "Use arrow keys (or WASD) to navigate your sailboat to the tropical island!"}
          </p>
          {gameState === "ready" && <p style={{ fontSize: "18px", margin: 0 }}>Press the Play button to begin your adventure!</p>}
        </div>
      )}

      {/* Game statistics counter */}
      <div style={{
        position: "relative",
        width: "100%",
        textAlign: "center",
        fontSize: "14px",
        color: "white",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "8px 0",
        marginTop: "20px",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        gap: "5px"
      }}>
        <div>
          <span style={{ marginRight: "20px" }}>👁️ Visits: {visitsCount}</span>
          <span>🎮 Games Played: {gamesPlayedCount}</span>
        </div>
        <div style={{ fontSize: "10px", color: "black" }}>
          ©️ Copyright 2025. All Rights Reserved.
        </div>
      </div>

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