export const COLOR_PALETTE = [
  { name: 'Yellow', value: 'yellow', hex: '#fef08a', border: '#eab308' },
  { name: 'Green', value: 'green', hex: '#86efac', border: '#22c55e' },
  { name: 'Cyan', value: 'cyan', hex: '#67e8f9', border: '#06b6d4' },
  { name: 'Magenta', value: 'magenta', hex: '#f0abfc', border: '#d946ef' },
  { name: 'Gray', value: 'lightGray', hex: '#d1d5db', border: '#6b7280' },
  { name: 'Red', value: 'red', hex: '#fca5a5', border: '#ef4444' },
  { name: 'Blue', value: 'blue', hex: '#93c5fd', border: '#3b82f6' },
  { name: 'Dark Green', value: 'darkGreen', hex: '#6ee7b7', border: '#10b981' },
  { name: 'Dark Yellow', value: 'darkYellow', hex: '#fde047', border: '#eab308' },
  { name: 'Dark Red', value: 'darkRed', hex: '#f87171', border: '#ef4444' },
  { name: 'Dark Blue', value: 'darkBlue', hex: '#60a5fa', border: '#3b82f6' },
  { name: 'Dark Cyan', value: 'darkCyan', hex: '#22d3ee', border: '#06b6d4' }
];

export interface ScriptElement {
  id: string;
  type: 'scene' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';
  content: string;
  originalLine?: number;
  character?: string; // For dialogue, who is speaking
}

export interface CharacterStats {
  name: string;
  lineCount: number;
  color?: string;
  selected: boolean;
}
