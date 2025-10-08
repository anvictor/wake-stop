import { useState } from "react";
import { Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface AlarmSettingsProps {
  onAlarmSet: (minutes: number) => void;
  isTracking: boolean;
}

export const AlarmSettings = ({ onAlarmSet, isTracking }: AlarmSettingsProps) => {
  const [minutes, setMinutes] = useState(10);

  const handleSetAlarm = () => {
    onAlarmSet(minutes);
  };

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-medium">Alert Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">{minutes}</span>
            <span className="text-muted-foreground">min</span>
          </div>
        </div>

        <div className="space-y-2">
          <Slider
            value={[minutes]}
            onValueChange={(value) => setMinutes(value[0])}
            min={1}
            max={30}
            step={1}
            disabled={isTracking}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground text-center">
            Wake me {minutes} {minutes === 1 ? "minute" : "minutes"} before arrival
          </p>
        </div>

        <Button
          onClick={handleSetAlarm}
          disabled={isTracking}
          className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Bell className="mr-2 h-5 w-5" />
          Set Alarm
        </Button>
      </div>
    </Card>
  );
};
