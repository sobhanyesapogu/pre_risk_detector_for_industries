"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { ListChecks } from "lucide-react";
import { soundManager } from "@/lib/sounds";

type RiskOverviewProps = {
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number;
  onViewDetails: () => void;
};

const riskConfig = {
  Low: { color: "hsl(142.1 76.2% 36.3%)", label: "Low" },
  Medium: { color: "hsl(47.9 95.8% 53.1%)", label: "Medium" },
  High: { color: "hsl(var(--accent))", label: "High" },
};

const riskFactors = {
  High: [
    "Extended continuous work duration detected",
    "Night shift operational pattern observed",
    "Recent near-miss event logged",
  ],
  Medium: [
    "Moderate increase in machine idle time",
    "Slight deviation in safety protocol adherence",
    "Upcoming shift changeover",
  ],
  Low: [
    "Standard operational deviations logged",
    "Nominal equipment wear and tear",
    "All safety checks passed",
  ]
}

export default function RiskOverview({
  riskLevel,
  riskScore,
  onViewDetails,
}: RiskOverviewProps) {
  const data = [{ name: "Risk", value: riskScore, fill: riskConfig[riskLevel].color }];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Current Risk Level</CardTitle>
        <CardDescription>
          Live operational risk status
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
          <div className="relative mx-auto h-52 w-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="80%"
                outerRadius="100%"
                barSize={12}
                data={data}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: "hsl(var(--muted))" }}
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-5xl font-bold"
                style={{ color: riskConfig[riskLevel].color }}
              >
                {riskScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <p className="text-2xl font-bold" style={{ color: riskConfig[riskLevel].color }}>
              {riskConfig[riskLevel].label} Risk
            </p>
            {riskLevel === "Low" ? (
              <p className="text-sm text-muted-foreground">
                Signals detected, but below critical threshold.
              </p>
            ) : riskLevel === "High" ? (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    ⏰ Critical Window: Next 20-30 minutes
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Preventive intervention is recommended
                  </p>
                </div>
                <Card className="bg-muted/50 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <ListChecks className="h-4 w-4"/>
                    Risk Factors Contributing
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                    {riskFactors[riskLevel].map((factor, i) => <li key={i}>{factor}</li>)}
                  </ul>
                </Card>
              </div>
            ) : (
             <Card className="bg-muted/50 p-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <ListChecks className="h-4 w-4"/>
                  Risk Factors Contributing
                  </h4>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                  {riskFactors[riskLevel].map((factor, i) => <li key={i}>{factor}</li>)}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full md:w-auto" 
          onClick={() => {
            soundManager.buttonClick();
            onViewDetails();
          }}
        >
          View Risk Details
        </Button>
      </CardFooter>
    </Card>
  );
}
