import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Siren, Check, CheckCheck } from "lucide-react";
import { soundManager } from "@/lib/sounds";

type AlertCardProps = {
  title: string;
  message: string;
  onAcknowledge: () => void;
  onReviewed: () => void;
};

export default function AlertCard({
  title,
  message,
  onAcknowledge,
  onReviewed,
}: AlertCardProps) {
  return (
    <Card className="border-2 border-accent bg-accent/10 shadow-lg shadow-accent/20">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent">
          <Siren className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <CardTitle className="text-accent">{title}</CardTitle>
          <p className="mt-1 text-sm text-foreground/80">{message}</p>
        </div>
      </CardHeader>
      <CardFooter className="justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            soundManager.buttonClick();
            onAcknowledge();
          }}
        >
          <Check className="mr-2 h-4 w-4" />
          Acknowledge Alert
        </Button>
        <Button 
          className="bg-accent hover:bg-accent/90 text-accent-foreground" 
          onClick={() => {
            soundManager.buttonClick();
            onReviewed();
          }}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark as Reviewed
        </Button>
      </CardFooter>
    </Card>
  );
}
