import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useRescueGame } from "../lib/stores/useRescueGame";
import { useAudio } from "../lib/stores/useAudio";

// Create a simple 3D representation of a sailboat
const Sailboat = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { 
    gameState, 
    moveTruck, 
    checkWinCondition,
    fireTruckPosition
  } = useRescueGame();
  
  // Get audio controls
  const { playHit, playSuccess } = useAudio();
  
  // Local state to track previous position for collision detection
  const [prevPosition, setPrevPosition] = useState({ x: fireTruckPosition.x, y: fireTruckPosition.y });
  
  // Local state to track key presses
  const [isMoving, setIsMoving] = useState({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Get keyboard controls state without causing re-renders
  const [_, getControls] = useKeyboardControls();
  
  // Track wins for sound effects
  useEffect(() => {
    if (gameState === "won") {
      playSuccess();
    }
  }, [gameState, playSuccess]);
  
  // Track collisions for sound effects
  useEffect(() => {
    // If position hasn't changed but we tried to move (keys were pressed),
    // then we likely hit an obstacle or boundary
    if (
      (prevPosition.x === fireTruckPosition.x && prevPosition.y === fireTruckPosition.y) &&
      (isMoving.up || isMoving.down || isMoving.left || isMoving.right)
    ) {
      playHit();
    }
    
    // Update previous position
    setPrevPosition({ x: fireTruckPosition.x, y: fireTruckPosition.y });
    
    // Reset movement flags
    setIsMoving({ up: false, down: false, left: false, right: false });
  }, [fireTruckPosition, prevPosition, isMoving, playHit]);

  // Animation and movement updates
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Only allow movement when game is playing
    if (gameState === "playing") {
      const controls = getControls();
      
      // Handle keyboard controls and set movement flags
      if (controls.up) {
        moveTruck(0, -1);
        setIsMoving(prev => ({ ...prev, up: true }));
      } else if (controls.down) {
        moveTruck(0, 1);
        setIsMoving(prev => ({ ...prev, down: true }));
      } else if (controls.left) {
        moveTruck(-1, 0);
        setIsMoving(prev => ({ ...prev, left: true }));
      } else if (controls.right) {
        moveTruck(1, 0);
        setIsMoving(prev => ({ ...prev, right: true }));
      }
      
      // Check if the boat has reached the island
      checkWinCondition();
    }
    
    // Animate sailboat (bobbing on the water)
    if (gameState === "playing") {
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.05;
      // Add gentle rocking motion
      meshRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
    } else if (gameState === "won") {
      // Celebratory animation when game is won
      meshRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <group>
      <mesh 
        ref={meshRef}
        position={position}
        scale={[0.4, 0.2, 0.3]}
      >
        {/* Boat hull */}
        <boxGeometry args={[1, 0.4, 1.5]} />
        <meshStandardMaterial color="#d8e2dc" /> {/* Light colored hull */}
        
        {/* Boat deck */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.9, 0.1, 1.4]} />
          <meshStandardMaterial color="#ffe6a7" /> {/* Wooden deck */}
        </mesh>
        
        {/* Mast */}
        <mesh position={[0, 0.9, 0.2]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.3, 8]} />
          <meshStandardMaterial color="#774936" /> {/* Wooden mast */}
        </mesh>
        
        {/* Sail */}
        <mesh position={[0.2, 0.9, 0.2]} rotation={[0, 0, Math.PI / 8]}>
          <boxGeometry args={[0.05, 0.8, 0.6]} />
          <meshStandardMaterial color="white" />
        </mesh>
        
        {/* Secondary sail */}
        <mesh position={[0, 0.6, -0.3]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.05]} />
          <meshStandardMaterial color="#e9edc9" /> {/* Off-white sail */}
        </mesh>
      </mesh>
      
      {/* Show a "Move me with arrow keys" label when game starts */}
      {gameState === "ready" && (
        <Html position={[position[0], position[1] + 0.7, position[2]]}>
          <div style={{ 
            backgroundColor: "rgba(0,0,0,0.7)", 
            color: "white", 
            padding: "5px", 
            borderRadius: "5px", 
            fontSize: "12px",
            whiteSpace: "nowrap"
          }}>
            Use arrow keys to navigate!
          </div>
        </Html>
      )}
    </group>
  );
};

export default Sailboat;
