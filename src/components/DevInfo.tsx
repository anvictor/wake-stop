// DevInfo.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card";

export const DevInfo = ({intervalAPI}: {intervalAPI: number}) => {
console.log(intervalAPI, "intervalAPI");
  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Request Interval</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">{intervalAPI}</span>
            <span className="text-muted-foreground">min</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
