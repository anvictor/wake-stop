// Index.tsx
import { Navigation as NavigationSign } from "lucide-react";
import { LocationTracker } from "@/components/LocationTracker";
import { DestinationInput } from "@/components/DestinationInput";
import { AlarmSettings } from "@/components/AlarmSettings";
import { TrackingStatus } from "@/components/TrackingStatus";
import { useWakeStop } from "@/hooks/useWakeStop";
import { DevInfo } from "@/components/DevInfo";

const Index = () => {
  const {
    destination,
    isTracking,
    alertTime,
    currentDistance,
    estimatedTimeMinutes,
    intervalAPI,
    effectiveSpeed,
    currentTimeDistance,
    isMoving,
    handleLocationUpdate,
    handleDestinationSet,
    handleAlarmSet,
    handleStopTracking,
  } = useWakeStop();
 // New: interval between API requests (seconds)
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
              <NavigationSign className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">WakeStop</h1>
          </div>
          <p className="text-white/90">Never miss your stop again</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto p-4 space-y-4 mt-4">
       

        {/* Destination Input */}
        {!isTracking && <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <DestinationInput onDestinationSet={handleDestinationSet} />
        </div>}

        {/* Alarm Settings */}
        {destination && !isTracking && (
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
          estimatedTime={currentTimeDistance} // Use new dynamic time
          alertTime={alertTime}
          speed={effectiveSpeed} // Pass speed
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
         {/* Info dev */}
        {isTracking && (
          <div className="text-center text-sm text-muted-foreground pt-4 space-y-2">
            <DevInfo
              intervalAPI={intervalAPI}
              effectiveSpeed={effectiveSpeed}
              isMoving={isMoving}
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
