import { ScriptElement, CharacterStats, COLOR_PALETTE } from './constants';

export function parseScript(text: string): ScriptElement[] {
  const lines = text.split(/\r?\n/);
  const elements: ScriptElement[] = [];
  
  let lastType: ScriptElement['type'] = 'action';
  let lastCharacter = '';
  
  // Simple heuristic parser
  // 1. Scene Headings: INT. EXT. I/E.
  // 2. Characters: Uppercase, usually centered (but we might lose indentation), followed by dialogue
  // 3. Dialogue: Follows character
  // 4. Parenthetical: Starts with (
  // 5. Transitions: CUT TO:, FADE OUT. (Uppercase, ends with TO: or IN: or OUT.)
  
  lines.forEach((line, index) => {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    const id = `line-${index}`;
    
    // Scene Heading
    if (/^(INT\.|EXT\.|I\/E|INT\/EXT|EST\.)/i.test(cleanLine)) {
      elements.push({ id, type: 'scene', content: cleanLine.toUpperCase(), originalLine: index });
      lastType = 'scene';
      lastCharacter = '';
      return;
    }

    // Parenthetical
    if (/^\(.*\)$/.test(cleanLine)) {
      elements.push({ 
        id, 
        type: 'parenthetical', 
        content: cleanLine, 
        originalLine: index,
        character: lastCharacter 
      });
      lastType = 'parenthetical';
      return;
    }

    // Character Name (Heuristic: All CAPS, not a transition, not a scene)
    // Also checking if next line is likely dialogue (not empty, not another character)
    const isAllUpper = cleanLine === cleanLine.toUpperCase() && cleanLine.length > 1 && /[A-Z]/.test(cleanLine);
    const isTransition = /^(CUT TO:|FADE|DISSOLVE|SMASH CUT)/.test(cleanLine);
    
    if (isAllUpper && !isTransition) {
      // This is likely a character
      lastCharacter = cleanLine.replace(/\s*\(CONT'D\)$/, '').trim(); // Clean (CONT'D)
      elements.push({ id, type: 'character', content: cleanLine, originalLine: index });
      lastType = 'character';
      return;
    }

    // Transition
    if (isTransition) {
      elements.push({ id, type: 'transition', content: cleanLine, originalLine: index });
      lastType = 'transition';
      lastCharacter = '';
      return;
    }

    // Dialogue (Must follow Character or Parenthetical)
    if (lastType === 'character' || lastType === 'parenthetical') {
      elements.push({ 
        id, 
        type: 'dialogue', 
        content: cleanLine, 
        originalLine: index, 
        character: lastCharacter 
      });
      // We stay in dialogue mode implicitly, but next line logic handles it
      // Actually, strict screenplay format: Dialogue blocks continue until double newline.
      // But here we are line-by-line.
      // If we are in dialogue flow, subsequent lines might be dialogue too?
      // For simple parser, let's assume dialogue is one block or we treat subsequent lines as action if they break flow?
      // No, dialogue can be multi-line. 
      // But standard parsers usually treat next non-empty line as dialogue if previous was dialogue.
      lastType = 'dialogue';
      return;
    }
    
    // Continuation of dialogue?
    if (lastType === 'dialogue') {
         elements.push({ 
        id, 
        type: 'dialogue', 
        content: cleanLine, 
        originalLine: index, 
        character: lastCharacter 
      });
      return;
    }

    // Default to Action
    elements.push({ id, type: 'action', content: cleanLine, originalLine: index });
    lastType = 'action';
    lastCharacter = '';
  });

  return elements;
}

export function extractCharacters(elements: ScriptElement[]): CharacterStats[] {
  const statsMap = new Map<string, number>();

  elements.forEach(el => {
    if (el.type === 'character') {
      // Clean up character name (remove (V.O.), (O.S.), etc for grouping)
      const rawName = el.content;
      const cleanName = rawName
        .replace(/\s*\((V\.O\.|O\.S\.|CONT'D)\)/g, '')
        .trim();
      
      if (cleanName) {
        statsMap.set(cleanName, (statsMap.get(cleanName) || 0) + 1);
      }
    }
  });

  const sortedChars = Array.from(statsMap.entries())
    .map(([name, count], index) => ({
      name,
      lineCount: count,
      selected: false,
      // Auto assign colors round-robin
      color: COLOR_PALETTE[index % COLOR_PALETTE.length].hex
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return sortedChars;
}
