import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Using framer-motion for precise control

export function IntroAnimation({ onComplete }: { onComplete: () => void }) { // Renamed from IntroAnimationLinearApp
  const [overallPhase, setOverallPhase] = useState(0); // Manages the main animation phases
  const [showLeafPop, setShowLeafPop] = useState(false); // State to control leaf pop animation

  useEffect(() => {
    // Phase 1: "Dexian" text starts its reveal (0.3s)
    const timer1 = setTimeout(() => setOverallPhase(1), 300); 

    // Phase 2: Slogan begins to appear (2.0s)
    const timer2 = setTimeout(() => setOverallPhase(2), 2000); 
    
    // Leaf Pop: Trigger leaf pop animation after "Dexian" is visible (2.5s)
    const timerLeafPop = setTimeout(() => setShowLeafPop(true), 2500);

    // Phase 3: Loading dots appear (3.5s)
    const timer3 = setTimeout(() => setOverallPhase(3), 3500); 

    // Phase 4: Animation complete, trigger onComplete (5.0s)
    const timer4 = setTimeout(() => onComplete(), 5000); 

    // Cleanup function to clear all timers if the component unmounts prematurely
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timerLeafPop); // Clear the new leaf timer
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  // Framer Motion variants for the "Dexian" text reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    // Controls the overall animation of children (words/characters)
    visible: { 
      opacity: 1, 
      transition: {
        staggerChildren: 0.08, // Stagger delay for each child (e.g., each letter)
        delayChildren: 0.2, // Delay before children animations start
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: "0.5em" }, // Start slightly below and invisible
    visible: { 
      opacity: 1, 
      y: "0em", // Slide up to original position
      transition: {
        duration: 0.7, // Smooth transition duration
        ease: [0.25, 0.4, 0.25, 1], // Custom easing for a crisp feel
      }
    }
  };

  // Variants for the slogan reveal
  const sloganVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: 0.2, duration: 0.6, ease: "easeOut" } 
    }
  };

  // Variants for the loading dots
  const dotVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.3, duration: 0.5 } }
  };

  // Variants for the leaf pop animation
  const leafPopVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 0, rotate: 0 }, // Starts small, invisible, no rotation
    visible: { 
      opacity: 1, 
      scale: [1.2, 1], // Pops to 120% size, then settles to 100%
      y: [-10, 0], // Pops up slightly (-10px), then settles back
      rotate: [0, 15], // Rotates 15 degrees during the pop
      transition: { 
        duration: 0.8, 
        ease: "spring", // Spring easing for a bouncy pop
        stiffness: 200, // Makes the spring more stiff (faster initial pop)
        damping: 10, // Controls the oscillation (less damping means more bounce)
      } 
    },
    // Optional: make it subtly float after popping
    float: {
        y: [0, -5, 0], // Subtle vertical float
        rotate: [15, 12, 15], // Subtle rotation while floating
        transition: { 
            duration: 5, // Long duration for a gentle float
            repeat: Infinity, // Repeats infinitely
            repeatType: "reverse", // Floats up and then down smoothly
            ease: "easeInOut" // Smooth start/end of each float cycle
        }
    }
  };


  // Split "Dexian" into individual characters to apply staggered animation
  // The 'n' character needs special handling to host the leaf
  // The 'x' character needs special handling if it had unique styling (removed now)
  const dexianLetters = "Dexian".split("").map((letter, index) => {
    const isN = letter === "n";

    return (
      <motion.span 
        key={index} 
        variants={childVariants} 
        className="inline-block relative font-sans" // Using font-sans. For "Cairoli Now Extended Regular", you would typically import it via @font-face in a global CSS file or through a font loader.
        style={{
          color: 'black', // Black color for the text
          // Emulate "Extended Regular" by slightly increasing letter spacing
          letterSpacing: '0.05em', // Adjust this value to control 'extended' look
          fontWeight: 800 // Make it extra bold, similar to the image
        }}
      >
        {letter === " " ? "\u00A0" : letter} {/* Handles spaces */}

        {/* Leaf element for 'n' */}
        {isN && showLeafPop && (
          <motion.span
            className="absolute text-3xl" // Adjust emoji size as needed
            variants={leafPopVariants}
            initial="hidden"
            animate={["visible", "float"]} // Play pop then continuous float
            style={{
              right: '-0.4em', // Adjust horizontally (negative for left, positive for right)
              top: '-0.7em', // Adjust vertically (negative for up, positive for down)
              transform: 'translate(-50%, -50%)', // Ensures the leaf's center is at the specified top/right point
              color: '#34D399' // Green color for the leaf emoji
            }}
          >
            🍃 {/* Leaf emoji */}
          </motion.span>
        )}
      </motion.span>
    );
  });


  return (
    // Fixed container spanning the entire viewport with a pure white background
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center overflow-hidden">
      {/* Main Content (Logo and Slogan) */}
      <div className="relative z-10 text-center">
        {/* Dexian Logo */}
        <motion.h1
          className="text-5xl md:text-8xl font-extrabold text-black mb-4 leading-none" // Black text for Dexian, font styles applied via dexianLetters map
          variants={containerVariants}
          initial="hidden"
          animate={overallPhase >= 1 ? "visible" : "hidden"}
        >
          {dexianLetters} {/* Render the mapped letters including the special 'n' */}
        </motion.h1>

        {/* Slogan */}
        <motion.h2
          className="text-xl md:text-3xl mt-4 font-light tracking-wide" // Font thickness set to light, tracking wide
          variants={sloganVariants}
          initial="hidden"
          animate={overallPhase >= 2 ? "visible" : "hidden"}
          style={{
            color: '#34D399', // Color of the leaf icon
          }}
        >
          Agriculture Delivery Optimization
        </motion.h2>

        {/* Loading Dots */}
        <motion.div
          className="flex justify-center space-x-2 mt-8"
          variants={dotVariants}
          initial="hidden"
          animate={overallPhase >= 3 ? "visible" : "hidden"}
        >
          {/* Pulsing dots with agriculture-600 green color */}
          <div className="w-3 h-3 bg-agriculture-600 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-agriculture-600 rounded-full animate-pulse delay-150"></div>
          <div className="w-3 h-3 bg-agriculture-600 rounded-full animate-pulse delay-300"></div>
        </motion.div>
      </div>
    </div>
  );
}

export default IntroAnimation; // Renamed default export
