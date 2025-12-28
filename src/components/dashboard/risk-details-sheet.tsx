"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type RiskDetailsSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const highRiskWindows = [
  { time: "02:00 - 03:30", date: "Today", reason: "Night Shift, High Machinery Load" },
  { time: "14:00 - 15:00", date: "Yesterday", reason: "Shift Changeover, New Part Introduction" },
  { time: "23:00 - 00:30", date: "2 days ago", reason: "Maintenance Overrun, Operator Fatigue" },
  { time: "09:00 - 10:00", date: "3 days ago", reason: "Unexpected Material Shortage" },
];

export default function RiskDetailsSheet({
  isOpen,
  onOpenChange,
}: RiskDetailsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Risk Details & Historical Patterns</SheetTitle>
          <SheetDescription>
            These risk windows are predicted based on historical patterns and recent signals.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <h3 className="mb-4 text-lg font-semibold">Recent High-Risk Time Windows</h3>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time Window</TableHead>
                  <TableHead>Primary Factors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskWindows.map((window, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={index === 0 ? "destructive" : "secondary"}>{window.date}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{window.time}</TableCell>
                    <TableCell>{window.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <p className="mt-4 text-xs text-muted-foreground">
            This is a list of recently identified periods with elevated risk scores. Analyzing these patterns helps in proactive safety management.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
