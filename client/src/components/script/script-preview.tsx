import { ScriptElement, CharacterStats } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';

interface ScriptPreviewProps {
  elements: ScriptElement[];
  characters: CharacterStats[];
}

export function ScriptPreview({ elements, characters }: ScriptPreviewProps) {
  // Create a map for fast color lookup
  const characterColorMap = useMemo(() => {
    const map = new Map<string, string>();
    characters.forEach(c => {
      if (c.selected && c.color) {
        map.set(c.name, c.color);
      }
    });
    return map;
  }, [characters]);

  return (
    <div className="h-full flex flex-col bg-white text-black rounded-xl overflow-hidden shadow-2xl border border-border/20 relative">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2 z-10">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-4 text-xs font-mono text-gray-500">Preview Mode</span>
        </div>
      <ScrollArea className="flex-1 h-[600px] w-full bg-white p-8 md:p-16 font-mono text-sm md:text-base mt-8">
        <div className="max-w-3xl mx-auto space-y-4 min-h-full pb-20">
          {elements.map((el) => {
            // Determine styles based on type
            let className = "whitespace-pre-wrap";
            let style: React.CSSProperties = {};

            if (el.type === 'scene') {
              className += " font-bold uppercase mt-8 mb-4";
            } else if (el.type === 'character') {
              className += " font-bold uppercase text-center mt-6 mb-0 w-1/2 mx-auto";
            } else if (el.type === 'dialogue') {
              className += " text-center w-3/4 mx-auto mb-4";
              // Check for highlight
              if (el.character && characterColorMap.has(el.character)) {
                style.backgroundColor = characterColorMap.get(el.character);
                style.boxShadow = `0 0 0 4px ${characterColorMap.get(el.character)}`; // Extend highlight slightly
                style.borderRadius = '4px';
              }
            } else if (el.type === 'parenthetical') {
              className += " text-center w-1/2 mx-auto -mt-2 mb-2 italic text-gray-600";
            } else if (el.type === 'transition') {
              className += " text-right uppercase font-bold mt-6 mb-6";
            } else {
              // Action
              className += " mb-4";
            }

            return (
              <div key={el.id} className={className} style={style}>
                {el.content}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
