// LocationTracker.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LocationTrackerProps {
  onLocationUpdate: (position: GeolocationPosition) => void;
  isTracking: boolean;
}

export const LocationTracker = ({ onLocationUpdate, isTracking }: LocationTrackerProps) => {
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (!isTracking) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        onLocationUpdate(position);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to get your location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    setWatchId(id);

    return () => {
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [isTracking, onLocationUpdate]);

  return null;
};
