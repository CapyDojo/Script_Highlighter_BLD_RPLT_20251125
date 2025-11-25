import { ScriptElement, CharacterStats, COLOR_PALETTE } from './constants';

function normalizeCharacterName(rawName: string): string {
  let name = rawName.trim();
  // Remove common screenplay extensions in parentheses
  // Covers (V.O.), (O.S.), (CONT'D), (CONT’D), (on phone), etc.
  // We replace any parenthetical at the end of the string if it looks like a modifier
  // Standard modifiers often used: V.O., O.S., CONT'D, CONTINUED, PRE-LAP, INTO DEVICE, ON PHONE, FILTERED
  // Simple heuristic: any parenthetical at the end of the line.
  name = name.replace(/\s*\([^)]+\)$/, '');
  
  // Remove trailing colon (for transcript style)
  name = name.replace(/:$/, '');
  
  return name.trim();
}

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
      const charName = normalizeCharacterName(cleanLine);
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
              // Reclassify as Action
              elements[i].type = 'action';
          }
      }
  }

  return elements;
}

export function extractCharacters(elements: ScriptElement[]): CharacterStats[] {
  const statsMap = new Map<string, number>();

  elements.forEach(el => {
    if (el.type === 'character') {
      const cleanName = normalizeCharacterName(el.content);
      
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
