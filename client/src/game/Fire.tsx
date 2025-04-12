import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRescueGame } from "../lib/stores/useRescueGame";

// Create a fire with animated flames
const Fire = ({ position }: { position: [number, number, number] }) => {
  const fireRef = useRef<THREE.Group>(null);
  const { gameState } = useRescueGame();

  // Animate the fire
  useFrame((_, delta) => {
    if (!fireRef.current) return;
    
    if (gameState === "won") {
      // Extinguish the fire when won (scale down)
      fireRef.current.scale.x = Math.max(0, fireRef.current.scale.x - delta * 2);
      fireRef.current.scale.y = Math.max(0, fireRef.current.scale.y - delta * 2);
      fireRef.current.scale.z = Math.max(0, fireRef.current.scale.z - delta * 2);
    } else {
      // Animate fire flicker
      const flicker = 0.95 + Math.sin(Date.now() * 0.01) * 0.05;
      fireRef.current.scale.set(flicker, flicker + Math.sin(Date.now() * 0.02) * 0.1, flicker);
    }
  });

  return (
    <group ref={fireRef} position={position}>
      {/* Base fire */}
      <mesh position={[0, 0.2, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Middle flame */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Top flame */}
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.1, 0.4, 8]} />
        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Light from the fire */}
      <pointLight color="orange" intensity={1} distance={3} />
    </group>
  );
};

export default Fire;
