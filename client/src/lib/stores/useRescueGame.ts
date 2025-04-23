import { create } from "zustand";

// Game configuration constants
export const MAX_OBSTACLE_PERCENTAGE = 0.5; // 50% of grid squares can be obstacles

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
  visitsCount: number;       // Track total visits to the game
  gamesPlayedCount: number;  // Track how many games have been played
  gamesWonCount: number;     // Track how many games have been won
  
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

// Ensure these properties are typed correctly
type StoreApi = {
  (partial: RescueGameState | Partial<RescueGameState> | ((state: RescueGameState) => RescueGameState | Partial<RescueGameState>), replace?: false | undefined): void;
  (state: RescueGameState | ((state: RescueGameState) => RescueGameState), replace: true): void;
};

// Create the store
export const useRescueGame = create<RescueGameState>((set: StoreApi, get) => {
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
  
  // Helper to check if there is a path from truck to fire
  const isPathPossible = (truckPos: Position, firePos: Position, obstacleArray: Obstacle[]): boolean => {
    // Create a grid representation for pathfinding
    const { gridSize } = get();
    const grid: boolean[][] = Array(gridSize.y).fill(null).map(() => Array(gridSize.x).fill(true));
    
    // Mark obstacles on the grid
    for (const obstacle of obstacleArray) {
      grid[obstacle.y][obstacle.x] = false;
    }
    
    // BFS queue
    const queue: Position[] = [truckPos];
    // Visited locations
    const visited: boolean[][] = Array(gridSize.y).fill(null).map(() => Array(gridSize.x).fill(false));
    visited[truckPos.y][truckPos.x] = true;
    
    // Directions (up, right, down, left)
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // If we've reached the fire, a path exists
      if (current.x === firePos.x && current.y === firePos.y) {
        return true;
      }
      
      // Try all four directions
      for (let i = 0; i < 4; i++) {
        const newX = current.x + dx[i];
        const newY = current.y + dy[i];
        
        // Check if within grid boundaries
        if (newX < 0 || newX >= gridSize.x || newY < 0 || newY >= gridSize.y) {
          continue;
        }
        
        // Check if not an obstacle and not visited
        if (grid[newY][newX] && !visited[newY][newX]) {
          visited[newY][newX] = true;
          queue.push({ x: newX, y: newY });
        }
      }
    }
    
    // If we exhaust the queue without finding the fire, no path exists
    return false;
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
      
      // Maximum attempts to create valid obstacle configuration
      const maxAttempts = 100;
      let attempts = 0;
      
      // Generate obstacles and ensure there's always a valid path
      while (newObstacles.length < obstacleCount && attempts < maxAttempts) {
        attempts++;
        
        // Clear obstacles and try again if too many attempts
        if (attempts === maxAttempts - 1) {
          newObstacles.length = 0;
          attempts = 0;
        }
        
        // Try adding a new obstacle
        const newPos = getRandomPosition();
        const obstacleType = getRandomObstacleType();
        
        // Temporarily add the obstacle
        newObstacles.push({ ...newPos, type: obstacleType });
        
        // Check if a path still exists with this new obstacle
        if (!isPathPossible(
          { x: truckX, y: truckY }, 
          { x: fireX, y: fireY }, 
          newObstacles
        )) {
          // If no path, remove the last obstacle
          newObstacles.pop();
        }
      }
      
      // Make sure to keep counters when resetting
      const { visitsCount, gamesPlayedCount, gamesWonCount } = get();
      
      return {
        ...state,
        obstacles: newObstacles,
        gameState: "ready",
        visitsCount,
        gamesPlayedCount,
        gamesWonCount
      };
    });
  };

  // Calculate max obstacles based on the initial grid size
  const initialGridSize = 10;
  const maxObstacles = Math.floor(initialGridSize * initialGridSize * MAX_OBSTACLE_PERCENTAGE);

  // Try to load counters from localStorage if available
  let initialVisits = 0;
  let initialGamesPlayed = 0;
  let initialGamesWon = 0;
  
  // Only run this if we're in a browser environment
  if (typeof window !== 'undefined') {
    try {
      const savedVisits = localStorage.getItem('fireRescueVisits');
      const savedGamesPlayed = localStorage.getItem('fireRescueGamesPlayed');
      const savedGamesWon = localStorage.getItem('fireRescueGamesWon');
      
      if (savedVisits) initialVisits = parseInt(savedVisits, 10);
      if (savedGamesPlayed) initialGamesPlayed = parseInt(savedGamesPlayed, 10);
      if (savedGamesWon) initialGamesWon = parseInt(savedGamesWon, 10);
      
      // Increment visits on page load
      initialVisits++;
      localStorage.setItem('fireRescueVisits', initialVisits.toString());
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }

  return {
    // State
    gridSize: { x: initialGridSize, y: initialGridSize },
    obstacleCount: maxObstacles, // Start with maximum obstacles
    gameState: "ready" as GameState,
    fireTruckPosition: { x: Math.floor(initialGridSize / 2), y: initialGridSize - 1 },  // Default position at bottom center
    firePosition: { x: Math.floor(initialGridSize / 2), y: 0 },  // Default position at top center (within top third)
    obstacles: [] as Obstacle[],
    moveCooldown: false,
    visitsCount: initialVisits,
    gamesPlayedCount: initialGamesPlayed,
    gamesWonCount: initialGamesWon,
    
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
      const { fireTruckPosition, firePosition, gamesWonCount } = get();
      
      if (
        fireTruckPosition.x === firePosition.x &&
        fireTruckPosition.y === firePosition.y
      ) {
        // Player wins!
        const newGamesWon = gamesWonCount + 1;
        set({ 
          gameState: "won",
          gamesWonCount: newGamesWon
        });
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('fireRescueGamesWon', newGamesWon.toString());
          } catch (error) {
            console.error("Error saving to localStorage:", error);
          }
        }
        
        // Sound will be played in component
      }
    },
    
    // Start game
    startGame: () => {
      const { gamesPlayedCount } = get();
      const newGamesPlayed = gamesPlayedCount + 1;
      
      set({ 
        gameState: "playing",
        gamesPlayedCount: newGamesPlayed
      });
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fireRescueGamesPlayed', newGamesPlayed.toString());
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
      }
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
