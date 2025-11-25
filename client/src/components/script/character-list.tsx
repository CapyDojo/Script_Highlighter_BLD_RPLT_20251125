import { CharacterStats } from '@/lib/constants';
import { CharacterCard } from './character-card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List as ListIcon, Search, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { COLOR_PALETTE } from '@/lib/constants';

interface CharacterListProps {
  characters: CharacterStats[];
  onToggle: (name: string) => void;
  onToggleAll: (select: boolean) => void;
  onColorChange: (name: string, color: string) => void;
}

export function CharacterList({ characters, onToggle, onToggleAll, onColorChange }: CharacterListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = useMemo(() => {
    return characters.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [characters, searchQuery]);

  const allSelected = filteredCharacters.length > 0 && filteredCharacters.every(c => c.selected);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/30 p-4 rounded-xl border border-border/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search characters..."
              className="pl-9 bg-background/50 border-border/40 focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 border-r border-border/40 pr-3 mr-1">
             <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary"
              onClick={() => onToggleAll(!allSelected)}
            >
              {allSelected ? <Square className="w-4 h-4 mr-1" /> : <CheckSquare className="w-4 h-4 mr-1" />}
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="flex bg-background/50 p-1 rounded-lg border border-border/40">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/10'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/10'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No characters found matching "{searchQuery}"
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCharacters.map((char) => (
                <CharacterCard
                  key={char.name}
                  character={char}
                  isSelected={char.selected}
                  onToggle={onToggle}
                  onColorChange={onColorChange}
                />
              ))}
            </div>
          ) : (
            <div className="border border-border/40 rounded-xl overflow-hidden bg-card/30">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Lines</TableHead>
                    <TableHead>Color</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCharacters.map((char) => (
                    <TableRow 
                      key={char.name} 
                      className={`hover:bg-card/50 transition-colors cursor-pointer border-border/40 ${char.selected ? 'bg-primary/5' : ''}`}
                      onClick={() => onToggle(char.name)}
                    >
                      <TableCell>
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${char.selected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                          {char.selected && <CheckSquare className="w-3 h-3" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium font-serif text-lg">{char.name}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{char.lineCount}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                         <Select 
                            value={char.color} 
                            onValueChange={(val) => onColorChange(char.name, val)}
                         >
                          <SelectTrigger className="w-[140px] h-8 bg-background/50 border-border/40">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: char.color }} />
                                <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {COLOR_PALETTE.map((c) => (
                                <SelectItem key={c.name} value={c.hex}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                                        {c.name}
                                    </div>
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
