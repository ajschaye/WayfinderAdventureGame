import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRescueGame } from "../lib/stores/useRescueGame";

// Create a simple obstacle that blocks the fire truck
const Obstacle = ({ position }: { position: [number, number, number] }) => {
  const obstacleRef = useRef<THREE.Mesh>(null);
  const { gameState } = useRescueGame();
  
  // Animate the obstacle
  useFrame((_, delta) => {
    if (!obstacleRef.current) return;
    
    if (gameState === "playing") {
      // Subtle rotation for visual interest
      obstacleRef.current.rotation.y += delta * 0.5;
    } else if (gameState === "won") {
      // Celebratory animation when game is won
      obstacleRef.current.rotation.y += delta * 1;
      obstacleRef.current.rotation.x += delta * 0.5;
    }
  });

  return (
    <mesh 
      ref={obstacleRef} 
      position={position}
      scale={[0.4, 0.4, 0.4]}
    >
      {/* Obstacle shape */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#4287f5" 
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
  );
};

export default Obstacle;
