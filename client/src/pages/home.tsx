import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { CharacterList } from '@/components/script/character-list';
import { ScriptPreview } from '@/components/script/script-preview';
import { parseScript, extractCharacters } from '@/lib/script-parser';
import { generateAndDownloadDocx } from '@/lib/docx-generator';
import { ScriptElement, CharacterStats } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Sparkles } from 'lucide-react';
import mammoth from 'mammoth';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'editor'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptElements, setScriptElements] = useState<ScriptElement[]>([]);
  const [characters, setCharacters] = useState<CharacterStats[]>([]);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
         // Basic PDF text extraction (might be messy but fits MVP)
         const arrayBuffer = await file.arrayBuffer();
         
         // Use unpkg for the worker source to match version
         pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
         
         const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
         let fullText = '';
         
         for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            
            // Improved PDF text extraction
            // Group items by Y position (lines)
            // content.items has 'transform' [scaleX, skewY, skewX, scaleY, x, y]
            // We sort by Y (descending) then X (ascending)
            
            const items = content.items as any[];
            if (items.length === 0) continue;
            
            // Sort items top-to-bottom, left-to-right
            // Note: PDF Y coordinates start from bottom-left usually, so higher Y is higher on page.
            items.sort((a, b) => {
                const yDiff = b.transform[5] - a.transform[5];
                if (Math.abs(yDiff) > 5) return yDiff; // Significant Y difference
                return a.transform[4] - b.transform[4]; // Sort by X
            });

            let pageText = '';
            let lastY = items[0].transform[5];

            for (const item of items) {
                const y = item.transform[5];
                // If Y changed significantly, add newline
                if (Math.abs(y - lastY) > 5) {
                    pageText += '\n';
                    lastY = y;
                }
                pageText += item.str;
            }
            
            fullText += pageText + '\n';
         }
         text = fullText;
         
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        // Text file
        text = await file.text();
      }

      const elements = parseScript(text);
      const extractedChars = extractCharacters(elements);
      
      if (extractedChars.length === 0) {
        toast({
            variant: "destructive",
            title: "No characters found",
            description: "Could not detect characters. Ensure standard screenplay format.",
        });
      }

      setScriptElements(elements);
      setCharacters(extractedChars);
      setStep('editor');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error parsing file",
        description: "Could not read the file. Please try a different file.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCharacter = (name: string) => {
    setCharacters(prev => prev.map(c => 
      c.name === name ? { ...c, selected: !c.selected } : c
    ));
  };

  const toggleAll = (select: boolean) => {
    setCharacters(prev => prev.map(c => ({ ...c, selected: select })));
  };

  const changeColor = (name: string, color: string) => {
    setCharacters(prev => prev.map(c => 
      c.name === name ? { ...c, color } : c
    ));
  };

  const handleDownload = () => {
    generateAndDownloadDocx(scriptElements, characters, fileName);
    toast({
        title: "Download Started",
        description: "Your highlighted script is being generated.",
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
               <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">
              Script<span className="text-primary">Highlighter</span>
            </h1>
          </div>
          
          {step === 'editor' && (
             <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setStep('upload')} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Upload New
                </Button>
                <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                    <Download className="w-4 h-4 mr-2" />
                    Download Script
                </Button>
             </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {step === 'upload' ? (
          <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-foreground">
                    Highlight dialogue in <br/>
                    <span className="text-primary">seconds.</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Automatically parse screenplays, select characters, and export a perfectly highlighted script for your cast and crew.
                </p>
             </div>
             
             <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-muted-foreground pt-8">
                <div className="p-4 rounded-xl bg-card/30 border border-border/20">
                    <strong className="block text-foreground font-serif text-lg mb-2">Auto-Detect</strong>
                    Instantly finds character names and counts their lines.
                </div>
                <div className="p-4 rounded-xl bg-card/30 border border-border/20">
                    <strong className="block text-foreground font-serif text-lg mb-2">Color Code</strong>
                    Assign unique colors to every role with one click.
                </div>
                <div className="p-4 rounded-xl bg-card/30 border border-border/20">
                    <strong className="block text-foreground font-serif text-lg mb-2">Export .DOCX</strong>
                    Download a production-ready file with your highlights.
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-20">
            {/* Top Section: Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex-none">
                    <h2 className="font-serif text-2xl font-bold mb-1">Characters</h2>
                    <p className="text-muted-foreground text-sm">Select characters to highlight dialogue.</p>
                </div>
                
                <div className="w-full">
                    <CharacterList 
                        characters={characters} 
                        onToggle={toggleCharacter}
                        onToggleAll={toggleAll}
                        onColorChange={changeColor}
                    />
                </div>
            </div>

            {/* Bottom Section: Preview */}
            <div className="w-full h-[800px] animate-in slide-in-from-bottom-8 duration-700 border-t border-border/40 pt-8">
               <div className="flex items-center justify-between mb-4">
                   <h2 className="font-serif text-2xl font-bold">Script Preview</h2>
                   <span className="text-sm text-muted-foreground">Scroll to preview highlights</span>
               </div>
               <ScriptPreview elements={scriptElements} characters={characters} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
