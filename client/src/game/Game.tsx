import { Suspense, useState } from "react";
import { OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRescueGame } from "../lib/stores/useRescueGame";
import GameGrid from "./GameGrid";
import FireTruck from "./FireTruck";
import Fire from "./Fire";
import Obstacle from "./Obstacle";
import Controls from "./Controls";
import * as THREE from "three";

const Game = () => {
  const { 
    gridSize, 
    obstacleCount, 
    fireTruckPosition, 
    firePosition, 
    obstacles, 
    gameState
  } = useRescueGame();
  
  // Create a camera that shows the entire grid
  const cameraDistance = Math.max(gridSize.x, gridSize.y) * 0.7;

  return (
    <>
      {/* Canvas overlay for UI controls */}
      <div style={{ 
        position: "absolute", 
        width: "100%", 
        height: "100%", 
        zIndex: 10, 
        pointerEvents: "none" 
      }}>
        <Controls />
      </div>

      {/* Using Canvas component from App.tsx */}
      <OrthographicCamera 
        makeDefault 
        position={[0, cameraDistance, cameraDistance]} 
        zoom={10}
        near={0.1}
        far={1000}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position-x={10} position-y={10} position-z={5} intensity={1} />

      <Suspense fallback={null}>
        {/* Game Grid */}
        <GameGrid />

        {/* Fire Truck */}
        <FireTruck 
          position={[
            fireTruckPosition.x - (gridSize.x - 1) / 2, 
            0.1, 
            fireTruckPosition.y - (gridSize.y - 1) / 2
          ]} 
        />

        {/* Fire */}
        <Fire 
          position={[
            firePosition.x - (gridSize.x - 1) / 2, 
            0.1, 
            firePosition.y - (gridSize.y - 1) / 2
          ]} 
        />

        {/* Obstacles */}
        {obstacles.map((obstacle, index) => (
          <Obstacle 
            key={index} 
            position={[
              obstacle.x - (gridSize.x - 1) / 2, 
              0.1, 
              obstacle.y - (gridSize.y - 1) / 2
            ]} 
          />
        ))}
      </Suspense>
    </>
  );
};

export default Game;
