import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

const LaptopModel = ({ isDarkMode, trigger, onCompleteHinge, scaleVal }) => {
  const lidRef = useRef();
  const screenRef = useRef();
  const baseRef = useRef();
  const laptopGroupRef = useRef();
  const [hingeFinished, setHingeFinished] = useState(false);

  // Mouse interactive parallax
  useFrame((state, delta) => {
    // Slowly rotate group based on mouse
    if (laptopGroupRef.current) {
      const mouseX = state.mouse.x * 0.25;
      const mouseY = state.mouse.y * 0.15;
      laptopGroupRef.current.rotation.y += (mouseX - laptopGroupRef.current.rotation.y) * 0.1;
      laptopGroupRef.current.rotation.x += (mouseY + 0.3 - laptopGroupRef.current.rotation.x) * 0.1;
    }

    // Animate lid opening
    if (lidRef.current && trigger) {
      // 0.38 * Math.PI is open position, Math.PI is closed flat
      const targetRot = Math.PI * 0.38;
      
      if (!hingeFinished) {
        // Lerp open
        lidRef.current.rotation.x += (targetRot - lidRef.current.rotation.x) * 0.08;
        
        // Screen emissive glow ramp up
        if (screenRef.current) {
          screenRef.current.material.emissiveIntensity += delta * 15;
        }

        if (Math.abs(lidRef.current.rotation.x - targetRot) < 0.05) {
          setHingeFinished(true);
          onCompleteHinge();
        }
      }
    }
  });

  return (
    <group 
      ref={laptopGroupRef} 
      position={[0, -0.4, 3.5]} 
      scale={[scaleVal * 0.85, scaleVal * 0.85, scaleVal * 0.85]}
    >
      {/* Base of laptop */}
      <mesh ref={baseRef} position={[0, -0.05, 0]}>
        <boxGeometry args={[3, 0.08, 2]} />
        <meshStandardMaterial color={isDarkMode ? "#0f172a" : "#e2e8f0"} metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Keyboard area grid */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.7, 1.7]} />
        <meshStandardMaterial color={isDarkMode ? "#020617" : "#cbd5e1"} roughness={0.8} />
      </mesh>

      {/* Hinge & Lid Group */}
      <group ref={lidRef} position={[0, 0, -1]} rotation={[Math.PI, 0, 0]}>
        {/* Hinge Cylinder */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 2.7, 16]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        {/* Lid cover */}
        <group position={[0, 0.9, 0]}>
          <mesh>
            <boxGeometry args={[2.8, 1.8, 0.06]} />
            <meshStandardMaterial color={isDarkMode ? "#0f172a" : "#e2e8f0"} metalness={0.8} roughness={0.15} />
          </mesh>
          {/* Screen display (flashes white or dark blue) */}
          <mesh ref={screenRef} position={[0, 0, 0.031]}>
            <planeGeometry args={[2.7, 1.7]} />
            <meshStandardMaterial 
              color={isDarkMode ? "#ffffff" : "#1e1b4b"} 
              emissive={isDarkMode ? "#e0f2fe" : "#3b0764"} 
              emissiveIntensity={0.2} 
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const ExpandingSun = ({ trigger, onCoverScreen, isDarkMode }) => {
  const meshRef = useRef();
  const matRef = useRef();

  useFrame((state, delta) => {
    if (trigger && meshRef.current) {
      // Exponential growth from screen position
      meshRef.current.scale.multiplyScalar(1 + delta * 14);
      
      if (matRef.current) {
         matRef.current.emissiveIntensity += delta * 15;
      }

      if (meshRef.current.scale.x > 90) {
        onCoverScreen();
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.08, 32, 32]} position={[0, 0.5, 2.5]}>
      <meshStandardMaterial 
        ref={matRef}
        color={isDarkMode ? "#ffffff" : "#060814"} 
        emissive={isDarkMode ? "#ffffff" : "#090d1f"} 
        emissiveIntensity={1} 
      />
    </Sphere>
  );
};

const ThemeTransition = ({ isTransitioning, isDarkMode, onToggleTheme, onComplete }) => {
  const [renderCanvas, setRenderCanvas] = useState(false);
  const [triggerExplosion, setTriggerExplosion] = useState(false);
  const [triggerLaptop, setTriggerLaptop] = useState(false);
  const [scaleVal, setScaleVal] = useState(0);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(0);

  useEffect(() => {
    if (isTransitioning) {
      setRenderCanvas(true);
      setTriggerLaptop(true);
      setBgOpacity(1);
      setScaleVal(0);
      
      // Animate scale up
      let start = null;
      const animateScale = (timestamp) => {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / 400; // 400ms scale up
        if (progress < 1) {
          // Bounce out ease
          const bounce = 1 + 2.70158 * Math.pow(progress - 1, 3) + 1.70158 * Math.pow(progress - 1, 2);
          setScaleVal(Math.min(1.1, bounce));
          requestAnimationFrame(animateScale);
        } else {
          setScaleVal(1);
        }
      };
      requestAnimationFrame(animateScale);
    }
  }, [isTransitioning]);

  const handleLaptopOpen = () => {
    // Once open, trigger explosion
    setTriggerExplosion(true);
  };

  const handleCoverScreen = () => {
    if (triggerExplosion) {
      setTriggerExplosion(false);
      setFlashOpacity(1); // Screen flashes the new color
      onToggleTheme(); 

      // Fade out flash and laptop scale down
      setTimeout(() => {
        setFlashOpacity(0);
        setBgOpacity(0);
        
        // Scale down laptop
        let start = null;
        const animateScaleDown = (timestamp) => {
          if (!start) start = timestamp;
          const progress = (timestamp - start) / 300;
          if (progress < 1) {
            setScaleVal(1 - progress);
            requestAnimationFrame(animateScaleDown);
          } else {
            setScaleVal(0);
            setRenderCanvas(false);
            onComplete();
          }
        };
        requestAnimationFrame(animateScaleDown);
      }, 350);
    }
  };

  if (!renderCanvas) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">
       {/* Dark Blur overlay background */}
       <div 
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-700 ease-out z-[9997]" 
          style={{ opacity: bgOpacity }}
       />

       {/* Flash element */}
       <div 
          className="absolute inset-0 transition-opacity duration-500 ease-out z-[10000]" 
          style={{ opacity: flashOpacity, backgroundColor: isDarkMode ? '#faf7f2' : '#060814' }}
       />
       
       <Canvas style={{ position: 'absolute', inset: 0, zIndex: 9998 }}>
         <ambientLight intensity={1.5} />
         <directionalLight position={[5, 10, 5]} intensity={1.5} />
         <pointLight position={[-5, 5, -5]} intensity={1.0} />
         
         <LaptopModel 
            isDarkMode={isDarkMode} 
            trigger={triggerLaptop}
            onCompleteHinge={handleLaptopOpen}
            scaleVal={scaleVal}
         />

         {triggerExplosion && (
           <ExpandingSun 
              trigger={triggerExplosion} 
              onCoverScreen={handleCoverScreen} 
              isDarkMode={isDarkMode}
           />
         )}
       </Canvas>
    </div>
  );
};

export default ThemeTransition;
