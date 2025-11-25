import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, Coffee, Star, Share2 } from "lucide-react";

export function SupportDialog() {
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
            ScriptHighlighter is free and open source. If you find it useful for your production, consider supporting its development.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-3">
            <Button variant="outline" className="h-auto p-4 justify-start gap-4 hover:bg-primary/5 hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Buy me a coffee</div>
                <div className="text-sm text-muted-foreground">One-time donation of $5</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start gap-4 hover:bg-primary/5 hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Become a Sponsor</div>
                <div className="text-sm text-muted-foreground">Monthly support via GitHub/Patreon</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start gap-4 hover:bg-primary/5 hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Share with friends</div>
                <div className="text-sm text-muted-foreground">Help us grow the community</div>
              </div>
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground mt-2">
            Payments are securely processed by Stripe & GitHub.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
