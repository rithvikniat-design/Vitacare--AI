"use client";

import React, { useRef, useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Paperclip, Mic, ArrowUp, X } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

export interface AttachedFile {
  url: string;
  path: string;
  name: string;
  type: string;
}

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (file?: AttachedFile) => void;
  isLoading: boolean;
  specialist?: string;
  setSpecialist?: (value: string) => void;
}

const SPECIALISTS = [
  { id: "General", icon: "✨", label: "General" },
  { id: "Orthopedics", icon: "🦴", label: "Orthopedics" },
  { id: "Cardiology", icon: "🫀", label: "Cardiology" },
  { id: "Dermatology", icon: "🩺", label: "Dermatology" },
  { id: "Neurology", icon: "🧠", label: "Neurology" }
];

export function ChatInput({ input, setInput, onSubmit, isLoading, specialist = "General", setSpecialist }: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef(input);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput((inputRef.current ? inputRef.current + " " : "") + currentTranscript.trim());
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Note: omitting `input` from deps to prevent recreating the recognition object constantly

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
      setInput(input + (input ? " " : "")); // Add space if there's already text
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && ((input || "").trim() || attachedFile)) {
        onSubmit(attachedFile || undefined);
        setAttachedFile(null);
        setShowUpload(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!isLoading && ((input || "").trim() || attachedFile)) {
      onSubmit(attachedFile || undefined);
      setAttachedFile(null);
      setShowUpload(false);
    }
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-md border-t flex flex-col items-center">
      <div className="w-full max-w-3xl relative">
        
        {/* Specialist Selector */}
        {setSpecialist && (
          <div className="flex flex-wrap items-center gap-2 mb-3 pb-2 overflow-x-auto scrollbar-none">
            {SPECIALISTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSpecialist(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  specialist === s.id 
                    ? 'bg-blue-500 text-white shadow-sm scale-105' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}
        
        {/* Upload Dropzone Area */}
        {showUpload && !attachedFile && (
          <div className="mb-4 animate-in fade-in slide-in-from-bottom-2">
            <FileUpload 
              onUploadComplete={(fileData) => {
                setAttachedFile(fileData);
                setShowUpload(false); // Hide dropzone after upload
              }}
              onUploadError={(err) => alert(err.message)}
            />
          </div>
        )}

        {/* Attached File Preview */}
        {attachedFile && (
          <div className="mb-3 flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-primary/10 rounded text-primary">
                <Paperclip className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium truncate">{attachedFile.name}</p>
                <p className="text-xs text-muted-foreground">{attachedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setAttachedFile(null)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className={`relative flex items-end gap-2 bg-muted/50 border shadow-sm rounded-2xl p-2 transition-all ${isListening ? 'ring-2 ring-red-500/50 border-red-500/50' : 'border-border focus-within:ring-2 focus-within:ring-blue-500/40'}`}
        >
          <div className="flex items-center gap-1 self-end pb-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowUpload(!showUpload)}
                    className={`h-8 w-8 rounded-full transition-colors ${showUpload ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach medical report or image</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleListening}
                    className={`h-8 w-8 rounded-full transition-colors ${isListening ? 'bg-red-500/10 text-red-500 hover:text-red-600 hover:bg-red-500/20' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                    <span className="sr-only">{isListening ? 'Stop listening' : 'Voice input'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isListening ? 'Stop recording' : 'Voice input (Speech to Text)'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TextareaAutosize
            value={input || ""}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachedFile ? "Add a message about this file..." : "Describe your symptoms or ask a medical question..."}
            className="flex-1 max-h-60 resize-none bg-transparent py-2.5 px-2 text-sm focus:outline-none disabled:opacity-50"
            minRows={1}
            maxRows={6}
            disabled={isLoading}
          />

          <div className="self-end pb-1 pr-1">
            <Button
              type="submit"
              size="icon"
              disabled={(!(input || "").trim() && !attachedFile) || isLoading}
              className="h-8 w-8 rounded-full transition-all duration-200"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>

        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-muted-foreground/60">
            Medical AI can make mistakes. Please verify important information with a real doctor.
          </p>
        </div>
      </div>
    </div>
  );
}
