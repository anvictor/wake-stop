// useWakeStop.ts
import { useState, useCallback } from "react";
import { calculateDistance, estimateTime } from "@/utils/distanceCalculator";
import { playAlarmSound } from "@/utils/alarmSound";
import { toast } from "sonner";

// Minimum possible interval between API requests (30 seconds)
const MIN_INTERVAL = 30; // seconds

export const useWakeStop = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // User-defined alert time (minutes before arrival to trigger alarm)
  const [alertTime, setAlertTime] = useState(10);

  // Geographical distance in km (kept for frontend display)
  const [currentDistance, setCurrentDistance] = useState(0);

  // Estimated time in minutes (legacy value, kept for compatibility)
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(0);

  // New: current time distance to destination (minutes)
  const [currentTimeDistance, setCurrentTimeDistance] = useState(0);

  // New: interval between API requests (seconds)
  const [intervalAPI, setIntervalAPI] = useState(alertTime * 60);

  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [hasAlerted, setHasAlerted] = useState(false);

  const handleLocationUpdate = useCallback(
    (position: GeolocationPosition) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentLocation(newLocation);

      if (destination && isTracking) {
        const now = Date.now();

        // Check only if enough time passed since last API call
        if (now - lastCheckTime >= intervalAPI * 1000 || lastCheckTime === 0) {
          const distance = calculateDistance(
            newLocation.lat,
            newLocation.lng,
            destination.lat,
            destination.lng
          );
          const time = estimateTime(distance); // result in minutes

          // Update both distance and time
          setCurrentDistance(distance); // km for frontend
          setEstimatedTimeMinutes(time); // legacy
          setCurrentTimeDistance(time); // minutes for alarm logic
          setLastCheckTime(now);

          // 1. Alarm logic: trigger when current time distance <= alertTime
          if (time <= alertTime && !hasAlerted) {
            playAlarmSound();
            setHasAlerted(true);
            toast.success("Wake up! You're approaching your stop!", { duration: 10000 });
          }

          // 2. Adaptive intervalAPI logic
          if (time > 3 * alertTime) {
            // Far from destination → interval = currentTimeDistance / 3 (converted to seconds)
            setIntervalAPI(Math.floor((time / 3) * 60));
          } else {
            // Closer to destination → reduce interval by factor of 3, but not below MIN_INTERVAL
            const newInterval = Math.max(Math.floor(intervalAPI / 3), MIN_INTERVAL);
            setIntervalAPI(newInterval);
          }
        }
      }
    },
    [destination, isTracking, lastCheckTime, intervalAPI, alertTime, hasAlerted]
  );

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

    // Initial distance calculation
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.lat,
      destination.lng
    );
    const time = estimateTime(distance);
    setCurrentDistance(distance); // km
    setEstimatedTimeMinutes(time); // minutes
    setCurrentTimeDistance(time); // minutes

    // Initial interval = alertTime (converted to seconds)
    setIntervalAPI(minutes * 60);

    toast.success(`Tracking started! You'll be alerted ${minutes} minutes before arrival.`, {
      duration: 5000,
    });
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
    currentDistance,          // km for frontend
    estimatedTimeMinutes,     // legacy minutes
    currentTimeDistance,      // new: minutes for alarm logic
    intervalAPI,              // new: adaptive API interval
    handleLocationUpdate,
    handleDestinationSet,
    handleAlarmSet,
    handleStopTracking,
  };
};
