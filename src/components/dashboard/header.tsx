"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { soundManager } from "@/lib/sounds";

export default function Header() {
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const toggleSound = () => {
    soundManager.toggleSound();
    setSoundEnabled(soundManager.soundEnabled);
  };

  const testSound = async () => {
    try {
      await soundManager.initialize();
      soundManager.buttonClick();
    } catch (error) {
      console.error('Test sound failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 md:gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        <div>
          <h1 className="text-sm md:text-lg font-bold tracking-tight text-primary">
            ProSentry
          </h1>
          <p className="hidden sm:block text-xs text-muted-foreground">
            Safety Intelligence & Prevention Guidance
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={testSound}
          className="hidden sm:flex h-8 px-2 text-xs"
          title="Test sound system"
        >
          Test
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSound}
          className="h-8 w-8 p-0"
          title={soundEnabled ? "Disable sounds" : "Enable sounds"}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
            <span className="relative mr-1 md:mr-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="hidden sm:inline">System </span>Active
          </Badge>
        </div>
      </div>
    </header>
  );
}
