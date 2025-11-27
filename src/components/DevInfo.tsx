// DevInfo.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card";

export const DevInfo = ({ intervalAPI, effectiveSpeed, isMoving }: { intervalAPI: number; effectiveSpeed: number; isMoving: boolean }) => {
  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Request Interval</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{intervalAPI}</span>
            <span className="text-muted-foreground">sec</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Effective Speed</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{(effectiveSpeed * 60).toFixed(1)}</span>
            <span className="text-muted-foreground">km/h</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Motion Status</span>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${isMoving ? "text-green-500" : "text-yellow-500"}`}>
              {isMoving ? "Moving" : "Stationary"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
