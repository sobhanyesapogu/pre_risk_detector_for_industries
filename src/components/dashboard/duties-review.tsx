"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Users } from "lucide-react";

type DutiesReviewProps = {
  isVisible: boolean;
};

export default function DutiesReview({ isVisible }: DutiesReviewProps) {
  const [operationType, setOperationType] = React.useState("routine");
  const [workforceStatus, setWorkforceStatus] = React.useState("reduced");

  if (!isVisible) return null;

  const getContextualGuidance = () => {
    if (operationType === "overtime" && workforceStatus === "fatigued") {
      return {
        message: "High-risk combination detected: Overtime operations with fatigued workforce",
        recommendation: "Consider postponing non-essential overtime tasks",
        severity: "high"
      };
    } else if (operationType === "high-load" && workforceStatus === "reduced") {
      return {
        message: "Moderate risk: High-load production with reduced staffing",
        recommendation: "Implement additional safety checks and slower production pace",
        severity: "medium"
      };
    } else if (workforceStatus === "fatigued") {
      return {
        message: "Workforce fatigue detected during routine operations",
        recommendation: "Prioritize rest breaks and rotation of critical positions",
        severity: "medium"
      };
    } else {
      return {
        message: "Standard operational context identified",
        recommendation: "Continue with recommended preventive actions above",
        severity: "low"
      };
    }
  };

  const guidance = getContextualGuidance();
  const severityColors = {
    high: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300",
    medium: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300",
    low: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          <CardTitle>Review Upcoming Duties</CardTitle>
        </div>
        <CardDescription>
          Contextualize preventive actions based on planned operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="operation-type">Upcoming Operation Type</Label>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger id="operation-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine Production</SelectItem>
                <SelectItem value="overtime">Overtime Operation</SelectItem>
                <SelectItem value="maintenance">Maintenance Activity</SelectItem>
                <SelectItem value="high-load">High-Load Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="workforce-status">Workforce Availability</Label>
            <Select value={workforceStatus} onValueChange={setWorkforceStatus}>
              <SelectTrigger id="workforce-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fully-staffed">Fully Staffed</SelectItem>
                <SelectItem value="reduced">Reduced Staff</SelectItem>
                <SelectItem value="fatigued">Fatigued Workforce</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${severityColors[guidance.severity as keyof typeof severityColors]}`}>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{guidance.message}</p>
              <p className="text-xs">{guidance.recommendation}</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
          <strong>Purpose:</strong> These selections help the system provide more targeted preventive guidance. 
          They do not control risk levels but contextualize recommended actions.
        </div>
      </CardContent>
    </Card>
  );
}