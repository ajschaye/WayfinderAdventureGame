import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRescueGame } from "../lib/stores/useRescueGame";
import { Grid } from "@react-three/drei";

const GameGrid = () => {
  const { gridSize, gameState } = useRescueGame();
  const gridRef = useRef<THREE.Group>(null);
  
  // Animation for grid based on game state
  useFrame((state, delta) => {
    if (!gridRef.current) return;
    
    if (gameState === "playing") {
      // Subtle animation during gameplay
      gridRef.current.rotation.y += delta * 0.05;
    } else if (gameState === "won") {
      // Celebratory animation when won
      gridRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={gridRef}>
      {/* Base grid plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <planeGeometry 
          args={[gridSize.x, gridSize.y]} 
        />
        <meshStandardMaterial 
          color="#eeeeee" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Use drei's Grid component instead of custom grid lines */}
      <Grid 
        cellSize={1}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#aaaaaa"
        fadeDistance={gridSize.x * 2}
        infiniteGrid
      />
    </group>
  );
};

export default GameGrid;
