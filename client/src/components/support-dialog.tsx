import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, Coffee, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SupportDialog() {
  const [selectedAmount, setSelectedAmount] = useState<number>(5);

  const amounts = [
    { value: 2, label: "Tiny Coffee" },
    { value: 5, label: "Coffee" },
    { value: 10, label: "Lunch" },
    { value: 25, label: "Dinner" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary">
          <Heart className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">Support Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            Support Development
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            ScriptHighlighter is free and open source. Your support helps keep the servers running and coffee brewing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Select contribution amount</div>
            <div className="grid grid-cols-4 gap-2">
              {amounts.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedAmount(option.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200",
                    selectedAmount === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <span className="text-lg font-bold">${option.value}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <Button className="w-full py-6 text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              <Coffee className="w-5 h-5 mr-2" />
              Donate ${selectedAmount}
            </Button>

            <Button variant="outline" className="w-full gap-2 border-dashed">
              <Share2 className="w-4 h-4" />
              Share with friends instead
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Payments are securely processed by Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
