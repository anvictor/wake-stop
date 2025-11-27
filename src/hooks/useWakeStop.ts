import { useState, useCallback, useEffect, useRef } from "react";
import { calculateDistance, estimateTime } from "@/utils/distanceCalculator";
import { playAlarmSound } from "@/utils/alarmSound";
import { toast } from "sonner";
import { useMotionDetection } from "./useMotionDetection";

// Initial assumed speed (5 km/h ~= 0.083 km/min)
const INITIAL_SPEED_KM_MIN = 5 / 60;

export const useWakeStop = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // User-defined alert time (minutes before arrival to trigger alarm)
  const [alertTime, setAlertTime] = useState(10);

  // Geographical distance in km (for frontend display)
  const [currentDistance, setCurrentDistance] = useState(0);

  // Estimated time in minutes (legacy value, kept for compatibility)
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(0);

  // New: current time distance to destination (minutes)
  const [currentTimeDistance, setCurrentTimeDistance] = useState(0);

  // New: effective speed (km/min)
  const [effectiveSpeed, setEffectiveSpeed] = useState<number>(INITIAL_SPEED_KM_MIN);

  // New: interval between API requests (seconds) - kept for display, but logic is dynamic now
  const [intervalAPI, setIntervalAPI] = useState(60);

  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [hasAlerted, setHasAlerted] = useState(false);

  // Motion detection
  const { isMoving, requestPermission: requestMotionPermission, permissionGranted: motionPermissionGranted } = useMotionDetection();
  const wasMovingRef = useRef(isMoving);

  // Ref to track latest state for the interval loop
  const stateRef = useRef({
    effectiveSpeed,
    currentTimeDistance,
    isTracking,
    destination,
    lastCheckTime,
    intervalAPI,
    currentLocation // We need this to check distance moved
  });

  // Ref to store the location of the LAST successful check to calculate "distance moved"
  const lastCheckLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    stateRef.current = {
      effectiveSpeed,
      currentTimeDistance,
      isTracking,
      destination,
      lastCheckTime,
      intervalAPI,
      currentLocation
    };
  }, [effectiveSpeed, currentTimeDistance, isTracking, destination, lastCheckTime, intervalAPI, currentLocation]);

  // Effect: Theoretical speed approximation loop (runs every second)
  useEffect(() => {
    if (!isTracking) return;

    const timer = setInterval(() => {
      const { effectiveSpeed, currentTimeDistance } = stateRef.current;
      
      // If we have a speed, decrement the time distance theoretically
      if (effectiveSpeed > 0 && currentTimeDistance > 0) {
        // Decrement by 1 second (1/60 minutes)
        const newTimeDistance = Math.max(0, currentTimeDistance - (1 / 60));
        setCurrentTimeDistance(newTimeDistance);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking]);

  // Effect: Trigger immediate check if motion state changes significantly (e.g. starts moving)
  // This is supplementary to the 50m/60s rule. If we start moving, we might want to check immediately.
  useEffect(() => {
    if (!isTracking) return;
    if (isMoving && !wasMovingRef.current) {
        // Optional: Force check logic could go here, but the 50m rule usually covers it 
        // if the GPS updates.
    }
    wasMovingRef.current = isMoving;
  }, [isMoving, isTracking]);


  const handleLocationUpdate = useCallback(
    (position: GeolocationPosition) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentLocation(newLocation);

      if (destination && isTracking) {
        const now = Date.now();
        const { lastCheckTime } = stateRef.current;
        const lastCheckLoc = lastCheckLocationRef.current;

        // Calculate distance moved since last check (km)
        let distanceMoved = 0;
        if (lastCheckLoc) {
            distanceMoved = calculateDistance(
                newLocation.lat,
                newLocation.lng,
                lastCheckLoc.lat,
                lastCheckLoc.lng
            );
        }

        // Trigger Logic:
        // 1. Time elapsed >= 60 seconds
        // 2. Distance moved >= 0.05 km (50 meters)
        // 3. First check (lastCheckTime === 0)
        const timeElapsed = now - lastCheckTime;
        const shouldUpdate = 
            lastCheckTime === 0 || 
            timeElapsed >= 60000 || 
            distanceMoved >= 0.05;

        if (shouldUpdate) {
          const distance = calculateDistance(
            newLocation.lat,
            newLocation.lng,
            destination.lat,
            destination.lng
          ); // km
          
          // Update geographical distance
          setCurrentDistance(distance);

          // Update Speed from GPS if available
          let currentEffectiveSpeed = stateRef.current.effectiveSpeed;
          
          if (position.coords.speed !== null && position.coords.speed >= 0) {
              // GPS speed is in m/s. Convert to km/min.
              // m/s * 60 = m/min. / 1000 = km/min.
              // So: speed * 0.06
              currentEffectiveSpeed = position.coords.speed * 0.06;
          } else {
              // Fallback: Calculate from distance/time if GPS speed missing?
              // Or just keep previous? Let's keep previous or use simple calc if needed.
              // For now, let's trust the previous or initial if GPS is null (common in some emulators/browsers without movement).
          }
          
          // Ensure we don't get stuck with 0 speed if we need to calculate time
          if (currentEffectiveSpeed < 0.001) currentEffectiveSpeed = 0;

          // Update State
          setEffectiveSpeed(currentEffectiveSpeed);
          
          // Calculate Time Distance
          // If speed is 0, time is infinite? Or keep last known?
          // If speed is 0, we can't divide.
          let timeDistance = stateRef.current.currentTimeDistance;
          if (currentEffectiveSpeed > 0.001) {
              timeDistance = distance / currentEffectiveSpeed;
          } else {
              // If stationary, maybe use 5km/h as a fallback for "ETA if I started walking now"?
              // Or just keep it as is?
              // Let's use the INITIAL_SPEED as a fallback for "walking speed" ETA.
              timeDistance = distance / INITIAL_SPEED_KM_MIN;
          }
          
          setCurrentTimeDistance(timeDistance);
          setEstimatedTimeMinutes(timeDistance); // Sync legacy

          // Update Check Refs
          setLastCheckTime(now);
          lastCheckLocationRef.current = newLocation;

          // Alarm Logic
          if (
              timeDistance <= alertTime &&
              !hasAlerted &&
              currentEffectiveSpeed > 0.1 // Moving threshold (> 6 km/h? No. 0.1 km/min = 6 km/h). 
              // Wait, 0.1 km/min = 6 km/h. Walking is ~5km/h (0.083).
              // So 0.1 is actually quite fast (jogging/bus).
              // If I am walking (0.083), alarm won't trigger?
              // Let's lower the threshold to 0.05 km/min (3 km/h).
          ) {
              playAlarmSound();
              setHasAlerted(true);
              toast.success("Wake up! You're approaching your stop!", { duration: 10000 });
          }
        }
      }
    },
    [destination, isTracking, alertTime, hasAlerted] 
  );
  
  // Wrapper for handleLocationUpdate
  const handleLocationUpdateWrapper = useCallback((position: GeolocationPosition) => {
      handleLocationUpdate(position);
  }, [handleLocationUpdate]);


  const handleDestinationSet = (lat: number, lng: number, name: string) => {
    setDestination({ lat, lng, name });
    toast.success("Destination set!");
  };

  const handleAlarmSet = (minutes: number) => {
    if (!destination) {
      toast.error("Please set a destination first!");
      return;
    }
    if (!currentLocation) {
      toast.error("Getting your location ...");
      return;
    }

    setAlertTime(minutes);
    setIsTracking(true);
    setHasAlerted(false);
    setLastCheckTime(0);
    lastCheckLocationRef.current = null;
    setEffectiveSpeed(INITIAL_SPEED_KM_MIN); // Reset speed to 5km/h

    // Initial distance calculation
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.lat,
      destination.lng
    );
    
    setCurrentDistance(distance);
    
    // Initial time based on 5km/h
    const time = distance / INITIAL_SPEED_KM_MIN;
    setCurrentTimeDistance(time);
    setEstimatedTimeMinutes(time);

    toast.success(`Tracking started! You'll be alerted ${minutes} minutes before arrival.`, {
      duration: 5000,
    });
    
    // Request motion permission if needed
    requestMotionPermission();
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setHasAlerted(false);
    toast.info("Tracking stopped");
  };

  return {
    currentLocation,
    destination,
    isTracking,
    alertTime,
    currentDistance,
    estimatedTimeMinutes,
    currentTimeDistance,
    effectiveSpeed,
    intervalAPI,
    isMoving, // Export for UI
    handleLocationUpdate: handleLocationUpdateWrapper,
    handleDestinationSet,
    handleAlarmSet,
    handleStopTracking,
  };
};
