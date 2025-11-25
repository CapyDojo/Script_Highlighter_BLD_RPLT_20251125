import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { ScriptElement, CharacterStats } from './constants';

export const generateAndDownloadDocx = async (elements: ScriptElement[], characters: CharacterStats[], filename: string) => {
  const characterColorMap = new Map<string, string>();
  characters.forEach(c => {
    if (c.selected && c.color) {
      characterColorMap.set(c.name, c.color);
    }
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
            margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 2160, // 1.5 inch left margin standard for scripts
            }
        }
      },
      children: elements.map(el => {
        let alignment: any = AlignmentType.LEFT;
        let bold = false;
        let allCaps = false;
        let indentLeft = 0; // Twips
        let spacingBefore = 0; // Twips
        let spacingAfter = 240; // Twips (approx 1 line)

        // Standard Screenplay Formatting (approximate twips)
        // 1 inch = 1440 twips
        // Character: ~2.0 - 2.5 inches from left margin (approx 2800 - 3600 twips indent relative to page, but docx indent is relative to margin)
        // Dialogue: ~1.5 inches from left margin (approx 2100)
        // Parenthetical: ~2.0 inches (approx 2800)

        let shading: { type: any; fill: string; color: string } | undefined = undefined;

        if (el.type === 'scene') {
          bold = true;
          allCaps = true;
          spacingBefore = 480;
          spacingAfter = 240;
        } else if (el.type === 'character') {
          allCaps = true;
          indentLeft = 3000; // Center-ish
          spacingBefore = 240;
          spacingAfter = 0;
        } else if (el.type === 'dialogue') {
          indentLeft = 1500;
          spacingAfter = 240; // Space after dialogue block
          // Check Highlight
           if (el.character && characterColorMap.has(el.character)) {
            const hex = characterColorMap.get(el.character)?.replace('#', '');
            if (hex) {
                shading = {
                    type: ShadingType.CLEAR,
                    fill: hex,
                    color: "auto"
                };
            }
          }
        } else if (el.type === 'parenthetical') {
          indentLeft = 2200;
          spacingAfter = 0;
        } else if (el.type === 'transition') {
          alignment = AlignmentType.RIGHT;
          allCaps = true;
          spacingBefore = 240;
          spacingAfter = 240;
        }

        return new Paragraph({
          alignment: alignment,
          indent: {
            left: indentLeft
          },
          spacing: {
            before: spacingBefore,
            after: spacingAfter
          },
          children: [
            new TextRun({
              text: el.content,
              font: "Courier Prime",
              size: 24, // 12pt
              bold: bold,
              allCaps: allCaps,
              shading: shading
            })
          ]
        });
      })
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `HIGHLIGHTED_${filename.replace(/\.[^/.]+$/, "")}.docx`);
};
