import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface MotionState {
  acceleration: { x: number; y: number; z: number } | null;
  isMoving: boolean;
}

// Threshold for significant motion (m/s^2)
// Adjust based on testing. 1.5 is a reasonable starting point for walking/transit.
const MOTION_THRESHOLD = 1.5;

export const useMotionDetection = () => {
  const [motionState, setMotionState] = useState<MotionState>({
    acceleration: null,
    isMoving: false,
  });

  const [permissionGranted, setPermissionGranted] = useState(false);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
    
    if (x === null || y === null || z === null) return;

    // Simple magnitude calculation (removing gravity roughly if needed, 
    // but accelerationIncludingGravity is often easier to detect raw movement changes)
    // For "isMoving", we look for variance or spikes. 
    // Here we just check if magnitude deviates significantly from 1G (approx 9.8) 
    // OR if we use acceleration (without gravity) if available.
    
    // Let's use acceleration (without gravity) if available, falling back to with gravity.
    const acc = event.acceleration;
    const hasLinearAcc = acc && acc.x !== null;
    
    let magnitude = 0;
    
    if (hasLinearAcc && acc.x !== null && acc.y !== null && acc.z !== null) {
       magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    } else {
       // Fallback: subtract rough gravity (9.8) from magnitude
       const rawMag = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
       magnitude = Math.abs(rawMag - 9.8);
    }

    const isMoving = magnitude > MOTION_THRESHOLD;

    setMotionState(prev => {
        // Only update if state changes to avoid re-renders, 
        // or update acceleration for debug every time? 
        // Let's update acceleration always for debug, but isMoving is the key.
        return {
            acceleration: { x, y, z },
            isMoving
        };
    });
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('devicemotion', handleMotion);
          toast.success("Motion sensors enabled!");
        } else {
          toast.error("Motion permission denied.");
        }
      } catch (e) {
        console.error(e);
        toast.error("Error requesting motion permission.");
      }
    } else {
      // Non-iOS 13+ devices
      setPermissionGranted(true);
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);

  return {
    ...motionState,
    requestPermission,
    permissionGranted
  };
};
