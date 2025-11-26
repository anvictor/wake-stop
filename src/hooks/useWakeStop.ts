import { useState, useCallback } from "react";
import { calculateDistance, estimateTime } from "@/utils/distanceCalculator";
import { playAlarmSound } from "@/utils/alarmSound";
import { toast } from "sonner";

export const useWakeStop = () => {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [alertTime, setAlertTime] = useState(10);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(0);
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
        // Check every 5 minutes (300000 ms) or on first update
        if (now - lastCheckTime >= 300000 || lastCheckTime === 0) {
          const distance = calculateDistance(
            newLocation.lat,
            newLocation.lng,
            destination.lat,
            destination.lng
          );
          const time = estimateTime(distance);

          setCurrentDistance(distance);
          setEstimatedTimeMinutes(time);
          setLastCheckTime(now);

          // Trigger alarm if estimated time is less than or equal to alert time
          if (time <= alertTime && !hasAlerted) {
            playAlarmSound();
            setHasAlerted(true);
            toast.success("Wake up! You're approaching your stop!", {
              duration: 10000,
            });
          }
        }
      }
    },
    [destination, isTracking, lastCheckTime, alertTime, hasAlerted]
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

    // Calculate initial distance
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.lat,
      destination.lng
    );
    const time = estimateTime(distance);
    setCurrentDistance(distance);
    setEstimatedTimeMinutes(time);

    toast.success(
      `Tracking started! You'll be alerted ${minutes} minutes before arrival.`,
      { duration: 5000 }
    );
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
    handleLocationUpdate,
    handleDestinationSet,
    handleAlarmSet,
    handleStopTracking,
  };
};
