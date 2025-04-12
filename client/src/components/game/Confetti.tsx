import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  active: boolean;
  duration?: number; // Duration in milliseconds
}

export const Confetti: React.FC<ConfettiProps> = ({ active, duration = 5000 }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    // Update window dimensions when window is resized
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (active) {
      setShowConfetti(true);
      
      // Hide confetti after specified duration
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      setShowConfetti(false);
    }
  }, [active, duration]);

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
    </>
  );
};