import React, { useState, useEffect } from "react";

interface NumberShufflerProps {
  value: string;
  duration?: number;
}

export function NumberShuffler({ value, duration = 1500 }: NumberShufflerProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;
    
    setIsAnimating(true);
    
    // Generate random intermediate values for the animation
    const startTime = Date.now();
    const initialValue = displayValue;
    const targetValue = value;
    
    // Extract numeric and non-numeric parts
    const numericRegex = /(\d+)/g;
    const numericParts = initialValue.match(numericRegex) || [];
    const targetNumericParts = targetValue.match(numericRegex) || [];
    
    // If formats don't match, just set the value directly
    if (numericParts.length !== targetNumericParts.length) {
      setDisplayValue(targetValue);
      setIsAnimating(false);
      return;
    }
    
    // Create animation frames
    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress >= 1) {
        clearInterval(animationInterval);
        setDisplayValue(targetValue);
        setIsAnimating(false);
        return;
      }
      
      // Create an intermediate value with random digits that gradually
      // transform from initial to target
      let result = targetValue;
      
      // Replace each numeric part with a shuffled version
      targetNumericParts.forEach((targetPart, index) => {
        const initialPart = numericParts[index] || targetPart;
        
        // Generate a random number that's closer to the target as progress increases
        const initialNum = parseInt(initialPart);
        const targetNum = parseInt(targetPart);
        
        if (isNaN(initialNum) || isNaN(targetNum)) {
          return;
        }
        
        // As progress increases, the random range decreases
        const randomRange = Math.max(0, 1 - progress) * Math.abs(targetNum - initialNum);
        const randomOffset = Math.floor(Math.random() * randomRange);
        
        // Closer to target as progress increases
        let intermediateValue: number;
        if (initialNum < targetNum) {
          intermediateValue = Math.min(targetNum, initialNum + (targetNum - initialNum) * progress + randomOffset);
        } else {
          intermediateValue = Math.max(targetNum, initialNum - (initialNum - targetNum) * progress - randomOffset);
        }
        
        // Format the intermediate value to match the target's format (same number of digits)
        const formattedValue = intermediateValue.toString().padStart(targetPart.length, '0');
        
        // Replace in the result
        result = result.replace(targetPart, formattedValue);
      });
      
      setDisplayValue(result);
    }, 50);
    
    return () => clearInterval(animationInterval);
  }, [value, displayValue, duration]);

  return <span className={isAnimating ? "number-shuffling" : ""}>{displayValue}</span>;
} 