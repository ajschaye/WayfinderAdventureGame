import { create } from "zustand";

// Game configuration constants
export const MAX_OBSTACLE_PERCENTAGE = 0.5; // 50% of grid squares can be obstacles

// Types for positions
interface Position {
  x: number;
  y: number;
}

// Obstacle types
export type ObstacleType = "shark" | "coconut" | "giant-clam";

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
  // Helper function to check if position is part of a giant clam (which takes up 2x2 space)
  const isPartOfGiantClam = (x: number, y: number): boolean => {
    const { obstacles } = get();
    
    // For each giant clam in the obstacles array
    for (const obstacle of obstacles) {
      if (obstacle.type === "giant-clam") {
        // Check if the position is within the 2x2 grid of this clam
        // The obstacle's position is the top-left corner of the 2x2 grid
        if (
          (x === obstacle.x && y === obstacle.y) || // Top-left
          (x === obstacle.x + 1 && y === obstacle.y) || // Top-right
          (x === obstacle.x && y === obstacle.y + 1) || // Bottom-left
          (x === obstacle.x + 1 && y === obstacle.y + 1) // Bottom-right
        ) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Helper function to check if position is valid
  const isValidPosition = (x: number, y: number): boolean => {
    const { gridSize, obstacles } = get();
    
    // Check grid boundaries
    if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
      return false;
    }
    
    // Check for regular obstacles
    if (obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y)) {
      return false;
    }
    
    // Check for giant clams (which take up 2x2 grid space)
    if (isPartOfGiantClam(x, y)) {
      return false;
    }
    
    return true;
  };
  
  // Helper to check if a position is suitable for a giant clam (needs 2x2 space)
  const isPositionSuitableForGiantClam = (x: number, y: number): boolean => {
    const { gridSize, fireTruckPosition, firePosition, obstacles } = get();
    
    // Check if out of bounds
    if (x + 1 >= gridSize.x || y + 1 >= gridSize.y) {
      return false;
    }
    
    // Check if any of the 2x2 positions are occupied
    if (
      // Top-left (the original position)
      (x === fireTruckPosition.x && y === fireTruckPosition.y) ||
      (x === firePosition.x && y === firePosition.y) ||
      obstacles.some(obs => obs.x === x && obs.y === y) ||
      
      // Top-right
      (x + 1 === fireTruckPosition.x && y === fireTruckPosition.y) ||
      (x + 1 === firePosition.x && y === firePosition.y) ||
      obstacles.some(obs => obs.x === x + 1 && obs.y === y) ||
      
      // Bottom-left
      (x === fireTruckPosition.x && y + 1 === fireTruckPosition.y) ||
      (x === firePosition.x && y + 1 === firePosition.y) ||
      obstacles.some(obs => obs.x === x && obs.y === y + 1) ||
      
      // Bottom-right
      (x + 1 === fireTruckPosition.x && y + 1 === fireTruckPosition.y) ||
      (x + 1 === firePosition.x && y + 1 === firePosition.y) ||
      obstacles.some(obs => obs.x === x + 1 && obs.y === y + 1)
    ) {
      return false;
    }
    
    return true;
  };
  
  // Helper to get random position that's not occupied
  const getRandomPosition = (): Position => {
    const { gridSize, fireTruckPosition, firePosition, obstacles } = get();
    
    let x: number, y: number;
    let isOccupied: boolean;
    let nextObstacleType: ObstacleType;
    
    // Pre-determine what type of obstacle will be placed here
    // so we can check for giant clam space requirements
    nextObstacleType = getRandomObstacleType();
    
    do {
      x = Math.floor(Math.random() * gridSize.x);
      y = Math.floor(Math.random() * gridSize.y);
      
      // For giant clams, we need to check a 2x2 grid
      if (nextObstacleType === 'giant-clam') {
        isOccupied = !isPositionSuitableForGiantClam(x, y);
      } else {
        // Regular obstacles only need to check their own position
        isOccupied = (
          (x === fireTruckPosition.x && y === fireTruckPosition.y) || // Fire truck
          (x === firePosition.x && y === firePosition.y) || // Fire
          obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y) || // Obstacles
          isPartOfGiantClam(x, y) // Check if this position is part of a giant clam
        );
      }
    } while (isOccupied);
    
    return { x, y };
  };
  
  // Helper to get a random obstacle type
  const getRandomObstacleType = (): ObstacleType => {
    // Count the number of giant clams in the current obstacles
    const { obstacles } = get();
    const giantClamCount = obstacles.filter(obs => obs.type === "giant-clam").length;
    
    // If we already have 3 giant clams, only return shark or coconut
    if (giantClamCount >= 3) {
      const obstacleTypes: ObstacleType[] = ["shark", "coconut"];
      const randomIndex = Math.floor(Math.random() * obstacleTypes.length);
      return obstacleTypes[randomIndex];
    }
    
    // Otherwise return any obstacle type with equal probability
    const obstacleTypes: ObstacleType[] = ["shark", "coconut", "giant-clam"];    
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
      
      // If it's a giant clam, mark all 4 cells as obstacles (2x2 grid)
      if (obstacle.type === "giant-clam") {
        // Make sure we don't go out of bounds with the 2x2 grid
        if (obstacle.x + 1 < gridSize.x) {
          grid[obstacle.y][obstacle.x + 1] = false; // Top-right
        }
        if (obstacle.y + 1 < gridSize.y) {
          grid[obstacle.y + 1][obstacle.x] = false; // Bottom-left
        }
        if (obstacle.x + 1 < gridSize.x && obstacle.y + 1 < gridSize.y) {
          grid[obstacle.y + 1][obstacle.x + 1] = false; // Bottom-right
        }
      }
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
      
      // Always add at least one giant clam first
      let clamAdded = false;
      while (!clamAdded && attempts < maxAttempts) {
        attempts++;
        
        // Generate a random position away from the truck and fire
        const gridWidth = gridSize.x;
        const gridHeight = gridSize.y;
        
        let clamX, clamY;
        do {
          // Generate random coordinates
          clamX = Math.floor(Math.random() * (gridWidth - 1)); // -1 to ensure there's space for 2nd cell
          clamY = Math.floor(Math.random() * (gridHeight - 1)); // -1 to ensure there's space for 2nd cell
          
          // Ensure the clam isn't too close to the truck or fire
          const minDistanceFromTruck = 2;
          const minDistanceFromFire = 2;
          
          // Check distance from truck and fire
          const distanceFromTruck = Math.abs(clamX - truckX) + Math.abs(clamY - truckY);
          const distanceFromFire = Math.abs(clamX - fireX) + Math.abs(clamY - fireY);
          
          // Continue the loop if the clam is too close
        } while (
          // Make sure there's room for the 2x2 clam
          clamX >= gridWidth - 1 || 
          clamY >= gridHeight - 1 ||
          
          // Make sure it doesn't overlap with the truck
          (clamX <= truckX && truckX <= clamX + 1 && clamY <= truckY && truckY <= clamY + 1) ||
          
          // Make sure it doesn't overlap with the fire
          (clamX <= fireX && fireX <= clamX + 1 && clamY <= fireY && fireY <= clamY + 1)
        );
        
        // Create the clam at this position
        newObstacles.push({ x: clamX, y: clamY, type: "giant-clam" });
          
        // Check if a path still exists with this clam
        if (isPathPossible({ x: truckX, y: truckY }, { x: fireX, y: fireY }, newObstacles)) {
          clamAdded = true;
        } else {
          // If no path, remove the clam and try again
          newObstacles.pop();
        }
        
        // Reset if too many attempts
        if (attempts === maxAttempts - 1) {
          attempts = 0;
          newObstacles.length = 0;
        }
      }
      
      // Generate remaining obstacles and ensure there's always a valid path
      attempts = 0;
      while (newObstacles.length < obstacleCount && attempts < maxAttempts) {
        attempts++;
        
        // Clear obstacles (except the first clam) and try again if too many attempts
        if (attempts === maxAttempts - 1) {
          // Keep the first clam if it exists
          if (newObstacles.length > 0 && newObstacles[0].type === "giant-clam") {
            const firstClam = newObstacles[0];
            newObstacles.length = 0;
            newObstacles.push(firstClam);
          } else {
            newObstacles.length = 0;
          }
          attempts = 0;
        }
        
        // Try adding a new obstacle
        const newPos = getRandomPosition();
        
        // If we already have the first clam, don't try to add more obstacles on top of it
        const isPartOfExistingClam = newObstacles.some(obs => 
          obs.type === 'giant-clam' && (
            (newPos.x === obs.x && newPos.y === obs.y) ||
            (newPos.x === obs.x + 1 && newPos.y === obs.y) ||
            (newPos.x === obs.x && newPos.y === obs.y + 1) ||
            (newPos.x === obs.x + 1 && newPos.y === obs.y + 1)
          )
        );
        
        if (isPartOfExistingClam) {
          // Skip this position if it's part of an existing clam's 2x2 space
          continue;
        }
        
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
