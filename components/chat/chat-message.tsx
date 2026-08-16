"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Volume2, VolumeX } from "lucide-react";

import { submitFeedback, removeFeedback } from "@/lib/actions/feedback";

interface ChatMessageProps {
  id?: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  onRegenerate?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  isStreaming?: boolean;
}

export function ChatMessage({ 
  id,
  role, 
  content, 
  suggestions, 
  onRegenerate, 
  onSuggestionClick,
  isStreaming = false
}: ChatMessageProps) {
  const isAssistant = role === "assistant";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (rating: "like" | "dislike") => {
    if (!id) return; // Cannot give feedback without message ID
    setIsFeedbackLoading(true);
    try {
      if (feedback === rating) {
        // Toggle off
        setFeedback(null);
        await removeFeedback(id);
      } else {
        setFeedback(rating);
        await submitFeedback(id, rating);
      }
    } catch (e) {
      console.error(e);
      // Revert optimistic UI
      setFeedback(feedback);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = content
      .replace(/[#*`_]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || (v.lang === 'en-US' && v.name.includes("Female")));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`py-6 px-4 md:px-8 w-full flex justify-center ${
        isAssistant ? "bg-muted/30 border-y border-border/50" : "bg-background"
      }`}
    >
      <div className="w-full max-w-3xl flex gap-4 md:gap-6">
        <div className="flex-shrink-0 mt-1">
          {isAssistant ? (
            <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-primary/20 shadow-sm bg-background">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs md:text-sm">
                AI
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-border shadow-sm">
              <AvatarImage src="" />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-xs md:text-sm">
                U
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {isAssistant ? "Medical Assistant" : "You"}
            </span>
          </div>
          
          {/* Main Message Content */}
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
            prose-headings:font-semibold prose-headings:tracking-tight 
            prose-a:text-primary hover:prose-a:text-primary/80 
            prose-p:leading-relaxed break-words
            prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-border prose-td:p-2 prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted/50
            prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:rounded-lg
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block w-2 h-4 bg-primary ml-1 align-middle"
              />
            )}
          </div>

          {/* Action Bar (Assistant Only) */}
          {isAssistant && !isStreaming && (
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4 mr-1.5 text-green-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
                <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${isSpeaking ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                onClick={handleSpeak}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 mr-1.5" /> : <Volume2 className="w-4 h-4 mr-1.5" />}
                <span className="text-xs">{isSpeaking ? "Stop" : "Listen"}</span>
              </Button>
              
              {onRegenerate && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={onRegenerate}
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  <span className="text-xs">Regenerate</span>
                </Button>
              )}

              {id && (
                <div className="flex items-center ml-auto border rounded-md p-0.5 bg-background">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={isFeedbackLoading}
                    className={`h-7 w-7 rounded-sm transition-colors ${feedback === "like" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => handleFeedback("like")}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="sr-only">Helpful</span>
                  </Button>
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    disabled={isFeedbackLoading} 
                    className={`h-7 w-7 rounded-sm transition-colors ${feedback === "dislike" ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => handleFeedback("dislike")}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span className="sr-only">Not helpful</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Suggested Follow-ups */}
          {isAssistant && !isStreaming && suggestions && suggestions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs bg-background/50 hover:bg-primary/5 border-primary/20 hover:border-primary/50 hover:text-primary transition-all text-left h-auto py-1.5 px-3 max-w-full"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  <span className="truncate">{suggestion}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
