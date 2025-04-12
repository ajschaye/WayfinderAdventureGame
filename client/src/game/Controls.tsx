import { useState, useEffect } from "react";
import { useRescueGame } from "../lib/stores/useRescueGame";
import { useAudio } from "../lib/stores/useAudio";

// Game controls UI component
const Controls = () => {
  const {
    gridSize,
    obstacleCount,
    gameState,
    setGridSize,
    setObstacleCount,
    startGame,
    stopGame,
    resetGame,
  } = useRescueGame();

  const { toggleMute, isMuted, backgroundMusic } = useAudio();

  // Local state for input values
  const [gridSizeInput, setGridSizeInput] = useState(gridSize.x);
  const [obstacleCountInput, setObstacleCountInput] = useState(obstacleCount);

  // Play background music when game starts
  useEffect(() => {
    if (gameState === "playing" && backgroundMusic && !isMuted) {
      backgroundMusic.play();
    } else if (backgroundMusic) {
      backgroundMusic.pause();
    }
  }, [gameState, backgroundMusic, isMuted]);

  // Update game settings when inputs change
  useEffect(() => {
    setGridSize(gridSizeInput, gridSizeInput);
  }, [gridSizeInput, setGridSize]);

  useEffect(() => {
    setObstacleCount(obstacleCountInput);
  }, [obstacleCountInput, setObstacleCount]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Game title */}
      <div
        style={{
          backgroundColor: "#e86349",
          borderRadius: "8px",
          padding: "20px",
          width: "50%",
          maxWidth: "600px",
          textAlign: "center",
          marginBottom: "20px",
          color: "black",
          fontWeight: "bold",
          fontSize: "24px",
        }}
      >
        Rescue Adventure
      </div>

      {/* Controls container */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "15px",
          width: "50%",
          maxWidth: "600px",
          marginBottom: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 10px 0", textAlign: "center" }}>Controls</h2>

        {/* Grid size control */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
          <span>
            {gridSizeInput} x {gridSizeInput}
          </span>
        </div>

        {/* Obstacle count control */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label htmlFor="obstacles">Number of obstacles:</label>
          <input
            id="obstacles"
            type="range"
            min="0"
            max={Math.min(10, Math.floor((gridSizeInput * gridSizeInput) / 3))}
            value={obstacleCountInput}
            onChange={(e) => setObstacleCountInput(parseInt(e.target.value))}
            disabled={gameState === "playing"}
            style={{ width: "50%" }}
          />
          <span>{obstacleCountInput}</span>
        </div>

        {/* Sound toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label htmlFor="sound">Sound:</label>
          <button
            onClick={toggleMute}
            style={{
              backgroundColor: isMuted ? "#e0e0e0" : "#4CAF50",
              border: "none",
              color: isMuted ? "black" : "white",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isMuted ? "Turn On" : "Turn Off"}
          </button>
        </div>
      </div>

      {/* Start/stop button */}
      <div
        style={{
          backgroundColor: "#ffd166",
          borderRadius: "50px",
          padding: "10px 30px",
          pointerEvents: "auto",
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#d62828",
        }}
        onClick={() => {
          if (gameState === "playing") {
            stopGame();
          } else if (gameState === "ready" || gameState === "stopped") {
            startGame();
          } else if (gameState === "won") {
            resetGame();
          }
        }}
      >
        {gameState === "playing"
          ? "Stop"
          : gameState === "won"
            ? "Play Again"
            : "Start"}
      </div>

      {/* Win message */}
      {gameState === "won" && (
        <div
          style={{
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
          }}
        >
          Great job! 🎊<br />
          You put out the fire!
        </div>
      )}

      {/* Game instructions when ready */}
      {/* Game instructions when ready */}
      {gameState === "ready" && (
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "15px",
          borderRadius: "8px",
          maxWidth: "400px",
          marginTop: "20px",
          textAlign: "center",
          color: "black" 
        }}>
          Use arrow keys (or WASD) to move the fire truck to the fire!
          Press the Play button to begin.
        </div>
      )}
    </div>
  );
};

export default Controls;
