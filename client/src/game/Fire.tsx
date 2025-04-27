import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRescueGame } from "../lib/stores/useRescueGame";

// Create a tropical island with gentle animation
const Island = ({ position }: { position: [number, number, number] }) => {
  const islandRef = useRef<THREE.Group>(null);
  const { gameState } = useRescueGame();

  // Animate the island gently floating
  useFrame((_, delta) => {
    if (!islandRef.current) return;
    
    if (gameState === "won") {
      // Celebratory animation when reached (subtle glow or pulse)
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;
      islandRef.current.scale.set(pulse, pulse, pulse);
    } else {
      // Gentle bobbing animation in the water
      const bobbing = 0.98 + Math.sin(Date.now() * 0.001) * 0.02;
      islandRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.05;
      islandRef.current.scale.set(bobbing, bobbing, bobbing);
    }
  });

  return (
    <group ref={islandRef} position={position}>
      {/* Island base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#e9c46a" /> {/* Sandy beach color */}
      </mesh>
      
      {/* Island vegetation */}
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.3, 0.3, 16]} />
        <meshStandardMaterial color="#2a9d8f" /> {/* Tropical foliage color */}
      </mesh>
      
      {/* Palm tree */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#774936" /> {/* Brown trunk */}
      </mesh>
      
      {/* Palm leaves */}
      <mesh position={[0, 0.5, 0]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.2, 0.2, 5]} />
        <meshStandardMaterial color="#52b788" /> {/* Palm leaf green */}
      </mesh>
      
      {/* Gentle light from the island */}
      <pointLight color="#f8edeb" intensity={0.5} distance={2} />
    </group>
  );
};

export default Island;
