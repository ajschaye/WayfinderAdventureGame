import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useRescueGame } from "../lib/stores/useRescueGame";
import { useAudio } from "../lib/stores/useAudio";

// Create a simple 3D representation of a fire truck
const FireTruck = ({ position }: { position: [number, number, number] }) => {
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
      
      // Check if the truck has reached the fire
      checkWinCondition();
    }
    
    // Animate fire truck (bobbing up and down)
    if (gameState === "playing") {
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.05;
    } else if (gameState === "won") {
      // Celebratory spinning animation when game is won
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
        {/* Truck body */}
        <boxGeometry args={[1, 1, 1.5]} />
        <meshStandardMaterial color="red" />
        
        {/* Truck cab */}
        <mesh position={[0, 0.5, 0.4]}>
          <boxGeometry args={[0.8, 0.5, 0.7]} />
          <meshStandardMaterial color="#880000" />
        </mesh>
        
        {/* Wheels */}
        <group position={[0.3, -0.5, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="black" />
        </group>
        
        <group position={[-0.3, -0.5, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="black" />
        </group>
        
        <group position={[0.3, -0.5, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="black" />
        </group>
        
        <group position={[-0.3, -0.5, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="black" />
        </group>
        
        {/* Ladder */}
        <mesh position={[0, 0.6, -0.2]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="gray" />
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
            Use arrow keys to move me!
          </div>
        </Html>
      )}
    </group>
  );
};

export default FireTruck;
