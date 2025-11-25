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
    
    // Heuristic for Play Script / Transcript format: "Name:" (e.g. "Jenny:", "Alan:")
    // It must end with a colon, have at least one letter, and be relatively short (< 40 chars).
    // It does NOT need to be all uppercase.
    const isColonName = /^[A-Za-z\s]+:$/.test(cleanLine) && cleanLine.length < 40 && cleanLine.length > 2;

    if ((isAllUpper || isColonName) && !isTransition) {
      // This is likely a character
      let charName = cleanLine.replace(/\s*\(CONT'D\)$/, '').trim(); // Clean (CONT'D)
      if (isColonName) {
          charName = charName.replace(/:$/, ''); // Remove colon for stats
      }
      lastCharacter = charName;
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

  // Post-processing: Validate characters
  // A Character element MUST be followed by Dialogue or Parenthetical.
  // If it is followed by Action, Scene, or another Character (without dialogue in between), it was likely a false positive (e.g. Title).
  // However, we need to be careful about "dual dialogue" or strange formatting.
  // But generally: Character -> Dialogue is the rule.
  
  // We iterate and check.
  for (let i = 0; i < elements.length; i++) {
      if (elements[i].type === 'character') {
          let nextIndex = i + 1;
          // Skip parentheticals to find dialogue
          let hasDialogue = false;
          
          while (nextIndex < elements.length) {
             const nextType = elements[nextIndex].type;
             if (nextType === 'parenthetical') {
                 nextIndex++;
                 continue;
             }
             if (nextType === 'dialogue') {
                 hasDialogue = true;
                 break;
             }
             // If we hit anything else (Action, Scene, Transition, or another Character), then this character has no dialogue.
             break;
          }

          if (!hasDialogue) {
              // Reclassify as Action (or Scene if it looks like one, but we already checked Scene)
              elements[i].type = 'action';
              // Also need to clear 'character' property from any subsequent lines that might have been falsely attributed (though our parser logic above attributes based on lastType, so if we change this to action, the *next* lines were already parsed as Action probably, unless they were parsed as Dialogue because of this character).
              // Wait, if we reclassify this as Action, then the *next* lines which were parsed as 'Dialogue' (because lastType was character) should ALSO be reclassified as Action.
              
              // Let's fix the subsequent dialogue lines if they exist (which they shouldn't if hasDialogue is false, but wait...)
              // If hasDialogue is FALSE, it means the next element is NOT dialogue.
              // So we don't need to fix subsequent lines, because they aren't dialogue.
              // EXCEPT: if the parser was greedy and marked the next lines as dialogue?
              // In our main loop:
              // if (lastType === 'character') -> next line is 'dialogue'.
              // So if the next line IS 'dialogue', then hasDialogue would be TRUE.
              // So if hasDialogue is FALSE, it means the next line was ALREADY parsed as something else (Action, Scene, etc).
              // So we are safe just changing this element.
          }
      }
  }

  return elements;
}

export function extractCharacters(elements: ScriptElement[]): CharacterStats[] {
  const statsMap = new Map<string, number>();

  elements.forEach(el => {
    if (el.type === 'character') {
      // Clean up character name (remove (V.O.), (O.S.), etc for grouping)
      const rawName = el.content;
      // Also remove trailing colon if present (for "Jenny:" case)
      let cleanName = rawName
        .replace(/\s*\((V\.O\.|O\.S\.|CONT'D)\)/g, '')
        .trim();
        
      if (cleanName.endsWith(':')) {
          cleanName = cleanName.slice(0, -1).trim();
      }
      
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
