"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  Coffee, 
  Settings, 
  Eye, 
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { soundManager } from "@/lib/sounds";

const preventiveActions = [
  {
    icon: RotateCcw,
    action: "Rotate operator duties on affected lines",
    priority: "High",
    timeframe: "Immediate",
    description: "Move fatigued operators to less critical positions"
  },
  {
    icon: Coffee,
    action: "Schedule a short safety break",
    priority: "High", 
    timeframe: "Next 10 minutes",
    description: "15-minute mandatory rest for extended-shift workers"
  },
  {
    icon: Settings,
    action: "Reduce machine load temporarily",
    priority: "Medium",
    timeframe: "Next 15 minutes", 
    description: "Lower production speed by 20% until risk subsides"
  },
  {
    icon: Eye,
    action: "Perform a quick manual inspection",
    priority: "Medium",
    timeframe: "Next 20 minutes",
    description: "Visual check of high-stress equipment and safety systems"
  },
  {
    icon: Clock,
    action: "Delay non-critical tasks",
    priority: "Low",
    timeframe: "Next 30 minutes",
    description: "Postpone maintenance and cleaning activities"
  }
];

const priorityColors = {
  High: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  Medium: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800", 
  Low: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
};

type PreventiveActionsProps = {
  isVisible: boolean;
  riskScore: number;
};

export default function PreventiveActions({ isVisible, riskScore }: PreventiveActionsProps) {
  if (!isVisible) return null;

  const handleActionAcknowledge = (action: string) => {
    soundManager.buttonClick();
    // In a real system, this would log the action taken
    console.log(`Action acknowledged: ${action}`);
  };

  return (
    <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-orange-800 dark:text-orange-200">
            Recommended Preventive Actions
          </CardTitle>
        </div>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Immediate steps to prevent accident during high-risk window (Risk: {riskScore}/100)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {preventiveActions.map((item, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <item.icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{item.action}</p>
                  <div className="flex gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${priorityColors[item.priority as keyof typeof priorityColors]}`}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    {item.timeframe}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleActionAcknowledge(item.action)}
                    className="h-7 text-xs"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Acknowledge
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900 rounded border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-300">
            <strong>System Guidance:</strong> Actions are suggested based on observed risk patterns. 
            Supervisor discretion is advised for implementation timing and priority.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}