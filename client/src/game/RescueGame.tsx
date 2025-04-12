import React, { useState, useEffect, useCallback } from 'react';
import { useRescueGame } from '../lib/stores/useRescueGame';
import { useAudio } from '../lib/stores/useAudio';
import fireTruckSvg from './assets/fire-truck.svg';
import fireSvg from './assets/fire.svg';
import obstacleSvg from './assets/obstacle.svg';

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

  const { toggleMute, isMuted, playHit, playSuccess, backgroundMusic } = useAudio();

  // Local state for input values
  const [gridSizeInput, setGridSizeInput] = useState(gridSize.x);
  const [obstacleCountInput, setObstacleCountInput] = useState(obstacleCount);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

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

    // Check if the truck has reached the fire
    checkWinCondition();
  }, [gameState, moveTruck, checkWinCondition]);

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update game settings when inputs change
  useEffect(() => {
    setGridSize(gridSizeInput, gridSizeInput);
  }, [gridSizeInput, setGridSize]);
  
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

  // Calculate cell size based on the grid dimensions
  const cellSize = Math.min(
    Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.6 / gridSize.x),
    50
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      fontFamily: "'Inter', sans-serif",
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      overflow: 'auto',
      height: '100%',
      maxHeight: '100vh',
      backgroundColor: '#e63946' // Red background as requested
    }}>
      {/* Game title */}
      <div style={{
        backgroundColor: "#e86349",
        borderRadius: "8px",
        padding: "20px",
        width: "100%",
        textAlign: "center",
        marginBottom: "20px",
        color: "black",
        fontWeight: "bold",
        fontSize: "24px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
      }}>
        {gameState === "won" ? "You Win! 🎉" : "Rescue Adventure"}
      </div>
      
      {/* Game controls - Moved under title as requested */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "15px",
        width: "100%",
        marginBottom: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        color: "black"
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
            max={Math.min(10, Math.floor(gridSizeInput * gridSizeInput / 3))}
            value={obstacleCountInput}
            onChange={(e) => setObstacleCountInput(parseInt(e.target.value))}
            disabled={gameState === "playing"}
            style={{ width: "50%" }}
          />
          <span>{obstacleCountInput}</span>
        </div>
        
        {/* Sound toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label htmlFor="sound">Sound:</label>
          <button
            onClick={toggleMute}
            style={{
              backgroundColor: isMuted ? "#e0e0e0" : "#4CAF50",
              border: "none",
              color: isMuted ? "black" : "white",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {isMuted ? "Turn On" : "Turn Off"}
          </button>
        </div>
      </div>
      
      {/* Play/stop button - Changed label as requested */}
      <div style={{
        backgroundColor: "#77c3f9",
        borderRadius: "50px",
        padding: "10px 30px",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        color: "black"
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
      
      {/* Game grid - Keep after controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize.x}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${gridSize.y}, ${cellSize}px)`,
        gap: '2px',
        backgroundColor: '#ccc',
        padding: '10px',
        borderRadius: '8px',
        position: 'relative',
        marginBottom: '20px',
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
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
              cellContent = (
                <img 
                  src={fireTruckSvg} 
                  alt="Fire Truck" 
                  style={{ 
                    width: '85%', 
                    height: '85%',
                    animation: gameState === 'won' ? 'spin 1s linear infinite' : 'bob 1s ease-in-out infinite'
                  }} 
                />
              );
            } else if (isFire) {
              cellContent = (
                <img 
                  src={fireSvg} 
                  alt="Fire" 
                  style={{ 
                    width: '85%', 
                    height: '85%',
                    animation: gameState === 'won' ? 'shrink 1s linear forwards' : 'flicker 0.5s ease-in-out infinite'
                  }} 
                />
              );
            } else if (isObstacle) {
              cellContent = (
                <img 
                  src={obstacleSvg} 
                  alt="Obstacle" 
                  style={{ 
                    width: '85%', 
                    height: '85%',
                    animation: gameState === 'playing' ? 'pulse 2s ease-in-out infinite' : 'none'
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
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
        }}>
          Great job! You put out the fire! 🚒
        </div>
      )}
      
      {/* Game instructions when ready */}
      {gameState === "ready" && (
        <div style={{
          maxWidth: "400px",
          textAlign: "center",
          color: "black",
          marginTop: "20px"
        }}>
          <p>Use arrow keys (or WASD) to move the fire truck to the fire!</p>
          <p>Press the Play button to begin.</p>
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
        `}
      </style>
    </div>
  );
};

export default RescueGame;