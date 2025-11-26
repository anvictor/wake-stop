// TrackingStatus.tsx
import { AlertCircle, MapPin, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TrackingStatusProps {
  isTracking: boolean;
  destination: { lat: number; lng: number; name: string } | null;
  currentDistance: number;
  estimatedTime: number;
  alertTime: number;
  onStopTracking: () => void;
}

export const TrackingStatus = ({
  isTracking,
  destination,
  currentDistance,
  estimatedTime,
  alertTime,
  onStopTracking,
}: TrackingStatusProps) => {
  if (!isTracking || !destination) return null;

  const progress = Math.max(0, Math.min(100, ((alertTime - estimatedTime) / alertTime) * 100));
  const isAlertTime = estimatedTime <= alertTime;

  return (
    <Card
      className={`p-6 backdrop-blur-sm shadow-lg transition-all duration-500 ${
        isAlertTime
          ? "bg-gradient-alert animate-scale-pulse"
          : "bg-card/95"
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className={`h-5 w-5 ${isAlertTime ? "text-white" : "text-primary"}`} />
              <span className={`font-medium ${isAlertTime ? "text-white" : ""}`}>
                Destination
              </span>
            </div>
            <p className={`text-sm ${isAlertTime ? "text-white/90" : "text-muted-foreground"} line-clamp-2`}>
              {destination.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className={`text-sm ${isAlertTime ? "text-white/80" : "text-muted-foreground"}`}>
              Distance
            </p>
            <p className={`text-2xl font-bold ${isAlertTime ? "text-white" : "text-foreground"}`}>
              {currentDistance.toFixed(1)} km
            </p>
          </div>
          <div className="space-y-1">
            <p className={`text-sm ${isAlertTime ? "text-white/80" : "text-muted-foreground"}`}>
              Est. Time
            </p>
            <p className={`text-2xl font-bold ${isAlertTime ? "text-white" : "text-foreground"}`}>
              {estimatedTime} min
            </p>
          </div>
        </div>

        {isAlertTime && (
          <div className="flex items-center gap-2 p-3 bg-white/20 rounded-lg animate-pulse-slow">
            <AlertCircle className="h-5 w-5 text-white" />
            <span className="text-white font-semibold">Wake Up! Approaching Your Stop!</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={isAlertTime ? "text-white/80" : "text-muted-foreground"}>Progress</span>
            <span className={`font-medium ${isAlertTime ? "text-white" : "text-foreground"}`}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Button
          onClick={onStopTracking}
          variant="secondary"
          className="w-full h-12 font-semibold"
        >
          <Navigation className="mr-2 h-5 w-5" />
          Stop Tracking
        </Button>
      </div>
    </Card>
  );
};
