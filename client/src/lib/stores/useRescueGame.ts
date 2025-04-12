import { create } from "zustand";

// Types for positions
interface Position {
  x: number;
  y: number;
}

// Obstacle types
export type ObstacleType = "puddle" | "fallen-tree" | "traffic-cone" | "bouncing-ball" | "goose";

// Obstacle with position and type
export interface Obstacle {
  x: number;
  y: number;
  type: ObstacleType;
}

// Game states
type GameState = "ready" | "playing" | "stopped" | "won";

// Interface for the game store
interface RescueGameState {
  // State
  gridSize: Position;
  obstacleCount: number;
  gameState: GameState;
  fireTruckPosition: Position;
  firePosition: Position;
  obstacles: Obstacle[];
  moveCooldown: boolean;
  
  // Actions
  setGridSize: (x: number, y: number) => void;
  setObstacleCount: (count: number) => void;
  moveTruck: (dx: number, dy: number) => void;
  checkWinCondition: () => void;
  startGame: () => void;
  stopGame: () => void;
  resetGame: () => void;
  getRandomPosition: () => Position;
  getRandomObstacleType: () => ObstacleType;
}

// Create the store
export const useRescueGame = create<RescueGameState>((set, get) => {
  // Helper function to check if position is valid
  const isValidPosition = (x: number, y: number): boolean => {
    const { gridSize, obstacles } = get();
    
    // Check grid boundaries
    if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
      return false;
    }
    
    // Check for obstacles
    return !obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y);
  };
  
  // Helper to get random position that's not occupied
  const getRandomPosition = (): Position => {
    const { gridSize, fireTruckPosition, firePosition, obstacles } = get();
    
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
  };
  
  // Helper to get a random obstacle type
  const getRandomObstacleType = (): ObstacleType => {
    const obstacleTypes: ObstacleType[] = [
      "puddle",
      "fallen-tree",
      "traffic-cone",
      "bouncing-ball",
      "goose"
    ];
    
    const randomIndex = Math.floor(Math.random() * obstacleTypes.length);
    return obstacleTypes[randomIndex];
  };
  
  // Initialize or reset the game
  const initializeGame = () => {
    const { gridSize, obstacleCount } = get();
    
    // Place fire truck at bottom
    const truckX = Math.floor(gridSize.x / 2);
    const truckY = gridSize.y - 1;
    
    // Generate random fire position in the top third of the grid
    let fireX: number, fireY: number;
    do {
      fireX = Math.floor(Math.random() * gridSize.x);
      // Calculate the top third of the grid (floor of gridSize.y / 3)
      const topThirdMax = Math.floor(gridSize.y / 3);
      // Place fire in the top third (0 to topThirdMax - 1)
      fireY = Math.floor(Math.random() * topThirdMax);
    } while (fireX === truckX && fireY === truckY);
    
    // Generate obstacles
    const newObstacles: Obstacle[] = [];
    
    // Create a reference to current state for getRandomPosition
    set(state => {
      // Update state with truck and fire positions
      state = {
        ...state,
        fireTruckPosition: { x: truckX, y: truckY },
        firePosition: { x: fireX, y: fireY }
      };
      
      // Generate obstacles
      for (let i = 0; i < obstacleCount; i++) {
        if (i >= gridSize.x * gridSize.y - 2) break; // Safety check
        
        const newPos = getRandomPosition();
        const obstacleType = getRandomObstacleType();
        newObstacles.push({ ...newPos, type: obstacleType });
      }
      
      return {
        ...state,
        obstacles: newObstacles,
        gameState: "ready"
      };
    });
  };

  return {
    // State
    gridSize: { x: 5, y: 5 },
    obstacleCount: 0,
    gameState: "ready" as GameState,
    fireTruckPosition: { x: 2, y: 4 },  // Default position at bottom center of 5x5 grid
    firePosition: { x: 2, y: 0 },       // Default position at top center of 5x5 grid (within top third)
    obstacles: [] as Obstacle[],
    moveCooldown: false,
    
    // Methods
    getRandomPosition,
    getRandomObstacleType,
    
    // Set grid size
    setGridSize: (x: number, y: number) => {
      set({ gridSize: { x, y } });
      get().resetGame();
    },
    
    // Set obstacle count
    setObstacleCount: (count: number) => {
      set({ obstacleCount: count });
      get().resetGame();
    },
    
    // Move truck
    moveTruck: (dx: number, dy: number) => {
      const { gameState, fireTruckPosition, firePosition, moveCooldown } = get();
      
      if (gameState !== "playing" || moveCooldown) return;
      
      set({ moveCooldown: true });
      
      // Cooldown to prevent rapid movement
      setTimeout(() => set({ moveCooldown: false }), 150);
      
      const newX = fireTruckPosition.x + dx;
      const newY = fireTruckPosition.y + dy;
      
      // Check if the new position is the fire (always valid to move to)
      const isFirePosition = newX === firePosition.x && newY === firePosition.y;
      
      if (isFirePosition || isValidPosition(newX, newY)) {
        set({ fireTruckPosition: { x: newX, y: newY } });
      } else {
        // Could play collision sound here if implemented
        // Using audio API from a store is tricky, we'll handle it in the component
      }
    },
    
    // Check win condition
    checkWinCondition: () => {
      const { fireTruckPosition, firePosition } = get();
      
      if (
        fireTruckPosition.x === firePosition.x &&
        fireTruckPosition.y === firePosition.y
      ) {
        // Player wins!
        set({ gameState: "won" });
        // Sound will be played in component
      }
    },
    
    // Start game
    startGame: () => {
      set({ gameState: "playing" });
    },
    
    // Stop game
    stopGame: () => {
      set({ gameState: "stopped" });
    },
    
    // Reset game
    resetGame: () => {
      initializeGame();
    }
  };
});
