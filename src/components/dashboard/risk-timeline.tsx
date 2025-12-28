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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Default timeline data for fallback
const defaultTimelineData = [
  { time: "08:00", risk: 15, workHours: 1, nearMiss: 0 },
  { time: "08:30", risk: 18, workHours: 1.5, nearMiss: 0 },
  { time: "09:00", risk: 25, workHours: 2, nearMiss: 1 },
  { time: "09:30", risk: 35, workHours: 3, nearMiss: 1 },
  { time: "10:00", risk: 45, workHours: 4, nearMiss: 2 },
  { time: "10:30", risk: 60, workHours: 6, nearMiss: 3 },
  { time: "11:00", risk: 78, workHours: 8, nearMiss: 4 },
  { time: "11:15", risk: 85, workHours: 15, nearMiss: 8 },
];

type RiskTimelineProps = {
  uploadedData?: any[];
  currentStep?: number;
  liveData?: Array<{time: string, risk: number, workHours: number, nearMiss: number}>;
  isAnalyzing?: boolean;
};

export default function RiskTimeline({ uploadedData = [], currentStep = 0, liveData = [], isAnalyzing = false }: RiskTimelineProps) {
  const [timelineData, setTimelineData] = React.useState(defaultTimelineData);

  React.useEffect(() => {
    if (isAnalyzing && liveData.length > 0) {
      // Use live data during analysis
      setTimelineData(liveData);
    } else if (uploadedData.length > 0) {
      // Convert uploaded CSV data to timeline format
      const convertedData = uploadedData.slice(0, 8).map((row, index) => ({
        time: row.timestamp || `Step ${index + 1}`,
        risk: Math.min(
          15 + 
          (parseFloat(row.continuous_work_hours || '0') * 4) +
          (parseInt(row.near_miss_count || '0') * 8) +
          (row.machine_usage_level === 'high' ? 15 : row.machine_usage_level === 'normal' ? 5 : 0) +
          (row.shift_type === 'night' ? 10 : 0), 
          100
        ),
        workHours: parseFloat(row.continuous_work_hours || '0'),
        nearMiss: parseInt(row.near_miss_count || '0'),
      }));
      setTimelineData(convertedData);
    } else {
      // Use default data
      setTimelineData(defaultTimelineData);
    }
  }, [uploadedData, liveData, isAnalyzing]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          <p className="text-sm">
            <span className="text-blue-500">Risk Score: </span>
            <span className="font-medium">{data.risk}/100</span>
          </p>
          <p className="text-sm">
            <span className="text-orange-500">Work Hours: </span>
            <span className="font-medium">{data.workHours}h</span>
          </p>
          <p className="text-sm">
            <span className="text-red-500">Near Misses: </span>
            <span className="font-medium">{data.nearMiss}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Progression Timeline</CardTitle>
        <CardDescription>
          How operational risk evolved over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timelineData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                domain={[0, 100]} 
              />
              <Tooltip
                content={<CustomTooltip />}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRisk)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded border border-orange-200 dark:border-orange-800">
          <div className="text-sm text-orange-700 dark:text-orange-300">
            <strong>System Analysis:</strong> {
              isAnalyzing 
                ? `Live analysis in progress - ${liveData.length} data points processed`
                : uploadedData.length > 0 
                  ? "Risk progression based on uploaded operational data showing real-time analysis."
                  : "Detected progression from stable operations to critical conditions based on observed operational signals."
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
