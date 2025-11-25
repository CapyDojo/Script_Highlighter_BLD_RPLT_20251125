import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndUpload(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/pdf',
      'text/plain'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a .docx, .pdf, or .txt file.",
      });
      return;
    }

    onFileUpload(file);
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group",
        isDragging 
          ? "border-primary bg-primary/5 scale-[1.01] shadow-2xl shadow-primary/10" 
          : "border-border/40 hover:border-primary/50 hover:bg-card/50 bg-card/30",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".docx,.pdf,.txt"
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "p-4 rounded-full bg-card border border-border transition-transform duration-500",
          isDragging ? "scale-110 rotate-12 border-primary" : "group-hover:scale-105 group-hover:border-primary/50"
        )}>
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-primary" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-medium text-foreground">
            {isLoading ? "Parsing Script..." : "Upload Screenplay"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Drag and drop your .docx or .pdf file here, or click to browse.
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <span className="px-2 py-1 rounded text-xs font-medium bg-card border border-border text-muted-foreground">.DOCX</span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-card border border-border text-muted-foreground">.PDF</span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-card border border-border text-muted-foreground">.TXT</span>
        </div>
      </div>
    </div>
  );
}
