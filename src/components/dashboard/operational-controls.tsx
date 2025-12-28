"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Play, Square, Loader2, Upload, CheckCircle2, Database, ExternalLink } from "lucide-react";
import { soundManager } from "@/lib/sounds";

type OperationalControlsProps = {
  onStartAnalysis: () => void;
  onStopAnalysis: () => void;
  isAnalyzing: boolean;
  onDataUpload?: (file: File) => void;
};

export default function OperationalControls({
  onStartAnalysis,
  onStopAnalysis,
  isAnalyzing,
  onDataUpload,
}: OperationalControlsProps) {
  const [isDataConnected, setIsDataConnected] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      soundManager.buttonClick();
      setIsDataConnected(true);
      setUploadedFileName(file.name);
      onDataUpload?.(file);
    } else {
      alert("Please upload a valid CSV file");
    }
  };

  const handleConnectData = () => {
    soundManager.buttonClick();
    fileInputRef.current?.click();
  };

  const handleSampleData = () => {
    soundManager.buttonClick();
    window.open("https://drive.google.com/drive/folders/13_i0tnrXlRHTJhmeesK_3FeJfSXVSorT", "_blank");
  };
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Operational Monitoring Controls</CardTitle>
        <CardDescription>
          Control live risk analysis and monitoring systems.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Data Connection Section */}
        <div className="space-y-3">
          <Label>Operational Data Source</Label>
          
          {/* Sample Data Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSampleData}
              className="flex-1 justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
              disabled={isAnalyzing}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Sample Data (Google Drive)
            </Button>
            <span className="text-green-600 text-sm font-medium animate-pulse">
              Click Here
            </span>
          </div>
          
          {!isDataConnected ? (
            <Button
              variant="outline"
              onClick={handleConnectData}
              className="w-full justify-start"
              disabled={isAnalyzing}
            >
              <Database className="mr-2 h-4 w-4" />
              Connect Operational Data
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Data Connected
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {uploadedFileName}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="shift-type">Current Shift Context</Label>
            <Select defaultValue="night" disabled={isAnalyzing}>
              <SelectTrigger id="shift-type">
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day Shift</SelectItem>
                <SelectItem value="night">Night Shift</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isAnalyzing ? (
          <div className="text-center">
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => {
                soundManager.buttonClick();
                onStartAnalysis();
              }}
              disabled={!isDataConnected}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Live Risk Analysis
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              {isDataConnected 
                ? "System will begin monitoring operational signals." 
                : "Connect operational data first to start analysis."
              }
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => {
                soundManager.buttonClick();
                onStopAnalysis();
              }}
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Analysis
            </Button>
            <div className="mt-2 flex items-center justify-center text-xs text-primary">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              <p>Analysis active... monitoring operational signals</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
