import { useState, useEffect, useCallback } from "react";
import { useAudio } from "../lib/stores/useAudio";

// Types for positions
interface Position {
  x: number;
  y: number;
}

// Game states
type GameState = "ready" | "playing" | "stopped" | "won";

// Hook for game logic
export const useGameLogic = () => {
  // Game settings
  const [gridSize, setGridSize] = useState<Position>({ x: 5, y: 5 });
  const [obstacleCount, setObstacleCount] = useState<number>(0);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>("ready");
  const [fireTruckPosition, setFireTruckPosition] = useState<Position>({ x: 0, y: 0 });
  const [firePosition, setFirePosition] = useState<Position>({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState<Position[]>([]);
  
  // Get audio controls
  const { playHit, playSuccess } = useAudio();
  
  // Cooldown to prevent rapid movement
  const [moveCooldown, setMoveCooldown] = useState<boolean>(false);
  
  // Check if the new position is valid
  const isValidPosition = useCallback(
    (x: number, y: number): boolean => {
      // Check grid boundaries
      if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
        return false;
      }
      
      // Check for obstacles
      return !obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y);
    },
    [gridSize, obstacles]
  );
  
  // Move the fire truck
  const moveTruck = useCallback(
    (dx: number, dy: number) => {
      if (gameState !== "playing" || moveCooldown) return;
      
      setMoveCooldown(true);
      setTimeout(() => setMoveCooldown(false), 150); // Cooldown to prevent rapid movement
      
      const newX = fireTruckPosition.x + dx;
      const newY = fireTruckPosition.y + dy;
      
      if (isValidPosition(newX, newY)) {
        setFireTruckPosition({ x: newX, y: newY });
      } else {
        // Play collision sound
        playHit();
      }
    },
    [fireTruckPosition, gameState, isValidPosition, moveCooldown, playHit]
  );
  
  // Check if the fire truck has reached the fire
  const checkWinCondition = useCallback(() => {
    if (
      fireTruckPosition.x === firePosition.x &&
      fireTruckPosition.y === firePosition.y
    ) {
      // Player wins!
      setGameState("won");
      playSuccess();
    }
  }, [fireTruckPosition, firePosition, playSuccess]);
  
  // Generate random position that's not occupied
  const getRandomPosition = useCallback((): Position => {
    let x: number, y: number;
    let isOccupied: boolean;
    
    do {
      x = Math.floor(Math.random() * gridSize.x);
      y = Math.floor(Math.random() * gridSize.y);
      
      // Check if position is already occupied
      isOccupied = (
        (x === fireTruckPosition.x && y === fireTruckPosition.y) || // Fire truck
        (x === firePosition.x && y === firePosition.y) || // Fire
        obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y) // Obstacles
      );
    } while (isOccupied);
    
    return { x, y };
  }, [fireTruckPosition, firePosition, gridSize, obstacles]);
  
  // Initialize or reset the game
  const initializeGame = useCallback(() => {
    // Place fire truck at bottom
    const truckX = Math.floor(gridSize.x / 2);
    const truckY = gridSize.y - 1;
    setFireTruckPosition({ x: truckX, y: truckY });
    
    // Generate random fire position (not where the truck is)
    let fireX: number, fireY: number;
    do {
      fireX = Math.floor(Math.random() * gridSize.x);
      fireY = Math.floor(Math.random() * (gridSize.y - 2)); // Keep away from bottom row
    } while (fireX === truckX && fireY === truckY);
    
    setFirePosition({ x: fireX, y: fireY });
    
    // Generate obstacles
    const newObstacles: Position[] = [];
    for (let i = 0; i < obstacleCount; i++) {
      if (i >= gridSize.x * gridSize.y - 2) break; // Safety check
      
      const newPos = getRandomPosition();
      newObstacles.push(newPos);
    }
    
    setObstacles(newObstacles);
    setGameState("ready");
  }, [gridSize, obstacleCount, getRandomPosition]);
  
  // Initialize game when settings change
  useEffect(() => {
    initializeGame();
  }, [gridSize, obstacleCount, initializeGame]);
  
  // Game control functions
  const startGame = useCallback(() => {
    if (gameState !== "playing") {
      setGameState("playing");
    }
  }, [gameState]);
  
  const stopGame = useCallback(() => {
    if (gameState === "playing") {
      setGameState("stopped");
    }
  }, [gameState]);
  
  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);
  
  // Update grid size
  const updateGridSize = useCallback((x: number, y: number) => {
    setGridSize({ x, y });
  }, []);
  
  // Update obstacle count
  const updateObstacleCount = useCallback((count: number) => {
    setObstacleCount(count);
  }, []);
  
  return {
    // State
    gridSize,
    obstacleCount,
    gameState,
    fireTruckPosition,
    firePosition,
    obstacles,
    
    // Actions
    setGridSize: updateGridSize,
    setObstacleCount: updateObstacleCount,
    moveTruck,
    checkWinCondition,
    startGame,
    stopGame,
    resetGame
  };
};
