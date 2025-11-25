import { CharacterStats, COLOR_PALETTE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Check, Edit2, User } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';

interface CharacterCardProps {
  character: CharacterStats;
  isSelected: boolean;
  onToggle: (name: string) => void;
  onColorChange: (name: string, color: string) => void;
}

export function CharacterCard({ character, isSelected, onToggle, onColorChange }: CharacterCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none",
        isSelected 
          ? "bg-card border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/20" 
          : "bg-card/40 border-border/40 hover:border-primary/30 hover:bg-card/60"
      )}
      onClick={() => onToggle(character.name)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              "text-black shadow-inner"
            )}
            style={{ backgroundColor: character.color }}
          >
            {character.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-medium text-lg leading-none tracking-tight text-foreground group-hover:text-primary transition-colors">
              {character.name}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-mono">
              {character.lineCount} lines
            </span>
          </div>
        </div>

        <div className={cn(
          "w-5 h-5 rounded border flex items-center justify-center transition-all",
          isSelected 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-muted-foreground/30 group-hover:border-primary/50"
        )}>
          {isSelected && <Check className="w-3 h-3" />}
        </div>
      </div>

      {/* Color Picker Popover - Stop propagation to prevent toggling card selection */}
      <div onClick={(e) => e.stopPropagation()} className="mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs border-border/30 hover:bg-accent/10 hover:text-accent"
            >
              <div 
                className="w-3 h-3 rounded-full mr-2 border border-black/10" 
                style={{ backgroundColor: character.color }}
              />
              Change Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 bg-popover border-border" align="start">
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.name}
                  className={cn(
                    "w-full aspect-square rounded-md border border-transparent hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-popover",
                    character.color === color.hex && "ring-2 ring-primary ring-offset-2 ring-offset-popover"
                  )}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onColorChange(character.name, color.hex)}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
