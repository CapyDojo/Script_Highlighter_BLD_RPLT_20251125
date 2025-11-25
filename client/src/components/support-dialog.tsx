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
import { Heart, Coffee, Share2, Star, Github } from "lucide-react";
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
          {/* One-time Donation Section */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">One-time donation</div>
            <div className="grid grid-cols-4 gap-2">
              {amounts.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedAmount(option.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 relative overflow-hidden",
                    selectedAmount === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
                    option.value === 25 && selectedAmount !== 25 && "border-amber-200/50 bg-amber-50/30 hover:bg-amber-100/50 hover:border-amber-300/50",
                    option.value === 25 && selectedAmount === 25 && "border-amber-500 bg-amber-100/20 text-amber-600 ring-2 ring-amber-500/20 ring-offset-2"
                  )}
                >
                  {option.value === 25 && (
                    <div className="absolute -top-1 -right-1 text-xs animate-bounce">👑</div>
                  )}
                  <span className="text-lg font-bold flex items-center gap-1">
                    ${option.value}
                  </span>
                </button>
              ))}
            </div>
            <Button
              className={cn(
                "w-full py-6 text-lg shadow-lg hover:scale-[1.02] transition-transform",
                selectedAmount === 25 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 border-0" 
                  : "shadow-primary/20"
              )}
            >
              {selectedAmount === 25 ? <Star className="w-5 h-5 mr-2 fill-current" /> : <Coffee className="w-5 h-5 mr-2" />}
              Donate ${selectedAmount}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or become a member</span>
            </div>
          </div>

          {/* Recurring Support Options */}
          <div className="grid gap-3">
            <Button variant="outline" className="h-auto p-3 justify-start gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all group">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground flex items-center justify-center group-hover:scale-110 transition-transform border border-border">
                <Github className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">GitHub Sponsors</div>
                <div className="text-xs text-muted-foreground">Best for developers</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-3 justify-start gap-4 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all group">
               {/* Simple Patreon Icon Placeholder using Lucide */}
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-3 h-3 bg-current rounded-full -ml-1" />
                <div className="w-1 h-4 bg-current rounded-sm -mr-1" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Patreon</div>
                <div className="text-xs text-muted-foreground">Get exclusive updates & perks</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-3 justify-start gap-4 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-all group">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Ko-fi</div>
                <div className="text-xs text-muted-foreground">Monthly gold membership</div>
              </div>
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground mt-2">
            <Share2 className="w-4 h-4" />
            Share with friends
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
