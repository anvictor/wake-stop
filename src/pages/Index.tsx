import { useState, useEffect, useCallback } from "react";
import { Navigation } from "lucide-react";
import { LocationTracker } from "@/components/LocationTracker";
import { DestinationInput } from "@/components/DestinationInput";
import { AlarmSettings } from "@/components/AlarmSettings";
import { TrackingStatus } from "@/components/TrackingStatus";
import { calculateDistance, estimateTime } from "@/utils/distanceCalculator";
import { playAlarmSound } from "@/utils/alarmSound";
import { toast } from "sonner";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <LocationTracker
        onLocationUpdate={handleLocationUpdate}
        isTracking={true}
      />

      {/* Header */}
      <div className="bg-gradient-hero text-white p-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Navigation className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">WakeStop</h1>
          </div>
          <p className="text-white/90">Never miss your stop again</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto p-4 space-y-4 mt-4">
        {/* Current Location Card */}
        {currentLocation && (
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-border animate-slide-up">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse-slow" />
              <span className="text-muted-foreground">Current Location:</span>
              <span className="font-mono text-xs">
                {currentLocation.lat.toFixed(4)},{" "}
                {currentLocation.lng.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {/* Destination Input */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <DestinationInput onDestinationSet={handleDestinationSet} />
        </div>

        {/* Alarm Settings */}
        {destination && (
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <AlarmSettings
              onAlarmSet={handleAlarmSet}
              isTracking={isTracking}
            />
          </div>
        )}

        {/* Tracking Status */}
        <TrackingStatus
          isTracking={isTracking}
          destination={destination}
          currentDistance={currentDistance}
          estimatedTime={estimatedTimeMinutes}
          alertTime={alertTime}
          onStopTracking={handleStopTracking}
        />

        {/* Info Footer */}
        {!isTracking && (
          <div className="text-center text-sm text-muted-foreground pt-4 space-y-2">
            <p>🌍 Uses free OpenStreetMap geocoding</p>
            <p>📍 Location checks every 5 minutes</p>
            <p>🔔 Sound & vibration alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
