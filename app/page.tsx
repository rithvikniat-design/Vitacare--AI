"use client";

import React, { useRef, useEffect, Suspense, useState } from "react";
import { ChatLayout } from "@/components/layout/chat-layout";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageSkeleton } from "@/components/chat/message-skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { createConversation, saveMessage, getMessages } from "@/lib/actions/chat";
import { useChat } from "@ai-sdk/react";

import { AttachedFile } from "@/components/chat/chat-input";
import { MedicalAnalysisCard, AnalysisResult } from "@/components/chat/medical-analysis-card";

function isAnalysisResult(content: string): AnalysisResult | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && 'title' in parsed && 'summary' in parsed && 'keyFindings' in parsed) {
      return parsed as AnalysisResult;
    }
  } catch (e) {
    // Not JSON
  }
  return null;
}

function ChatInterface() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get("chatId");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // separate state for manual fetch

  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit: handleFormSubmit,
    isLoading: isStreamLoading,
    reload
  } = useChat({
    api: "/api/chat",
    id: activeChatId || "new",
    onFinish: async (message) => {
      if (activeChatId) {
        try {
          await saveMessage(activeChatId, "assistant", message.content);
        } catch (error) {
          console.error("Failed to save AI message:", error);
        }
      }
    },
    onError: (error) => {
      console.error("Chat API Error:", error);
      if (error.message.includes("401")) {
        router.push("/login");
      } else {
        alert(error.message || "An error occurred while communicating with the AI.");
      }
    }
  });

  const isLoading = isStreamLoading || isAnalyzing;

  // Load chat history if chatId is present
  useEffect(() => {
    setActiveChatId(chatId);
    async function loadChat() {
      if (chatId) {
        setIsInitializing(true);
        try {
          const dbMessages = await getMessages(chatId);
          setMessages(dbMessages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })));
        } catch (error) {
          console.error("Failed to load chat history", error);
        } finally {
          setIsInitializing(false);
        }
      } else {
        setMessages([]);
        setIsInitializing(false);
      }
    }
    loadChat();
  }, [chatId, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isInitializing]);

  const customHandleSubmit = async (file?: AttachedFile) => {
    if ((!input.trim() && !file) || isLoading) return;

    let currentChatId = activeChatId;
    const currentInput = input;
    
    // Create local conversation if none
    if (!currentChatId) {
      const title = file ? `Analysis of ${file.name}` : currentInput.split(" ").slice(0, 5).join(" ") + "...";
      const conversation = await createConversation(title);
      currentChatId = conversation.id;
      setActiveChatId(currentChatId);
      router.push(`/?chatId=${currentChatId}`, { scroll: false });
    }

    if (file) {
      // HANDLE FILE ANALYSIS
      setIsAnalyzing(true);
      setInput(""); // clear input
      
      const userMessageContent = `Uploaded file: ${file.name}\n${currentInput ? `\nNote: ${currentInput}` : ''}`;
      
      // Opt-in UI update and DB save for User message
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMessageContent }]);
      if (currentChatId) {
        await saveMessage(currentChatId, "user", userMessageContent);
      }

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: file.url,
            type: file.type,
            name: file.name,
            inputPrompt: currentInput
          })
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
          }
          let errMessage = "Unknown server error occurred.";
          try {
            const errData = await response.json();
            if (errData.error) errMessage = errData.error;
          } catch(e) {}
          throw new Error(errMessage);
        }
        
        const data = await response.json();
        const jsonContent = JSON.stringify(data);
        
        // Opt-in UI update and DB save for Assistant message
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: jsonContent }]);
        if (currentChatId) {
          await saveMessage(currentChatId, "assistant", jsonContent);
        }

      } catch (error: any) {
        console.error("Error analyzing file:", error);
        alert(error.message || "An error occurred during analysis.");
      } finally {
        setIsAnalyzing(false);
      }
      
    } else {
      // NORMAL CHAT
      try {
        if (currentChatId) {
          await saveMessage(currentChatId, "user", currentInput);
        }

        const fakeEvent = new Event("submit") as any;
        handleFormSubmit(fakeEvent, { data: { chatId: currentChatId }});
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleRegenerate = () => {
    reload();
  };

  return (
    <div className="flex flex-col h-full relative">
      <ScrollArea className="flex-1 pb-32">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center h-full pt-32">
            <Activity className="w-8 h-8 text-primary animate-pulse" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground pt-32">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">How can I help you today?</h2>
            <p className="text-sm max-w-md text-center">
              I can explain medical reports, clarify prescriptions, or provide general health information.
            </p>
          </div>
        ) : (
          <div className="pb-4">
            {messages.map((msg) => {
              const analysisData = isAnalysisResult(msg.content);
              
              if (analysisData) {
                return (
                  <div key={msg.id} className="w-full flex justify-center px-4">
                    <MedicalAnalysisCard analysis={analysisData} />
                  </div>
                );
              }

              return (
                <ChatMessage 
                  key={msg.id} 
                  id={msg.id}
                  role={msg.role as "user"|"assistant"} 
                  content={msg.content} 
                  isStreaming={isLoading && msg.role === "assistant" && msg.id === messages[messages.length - 1].id}
                  onRegenerate={msg.role === "assistant" && msg.id === messages[messages.length - 1].id ? handleRegenerate : undefined}
                />
              );
            })}
            
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <MessageSkeleton />
            )}
            
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={customHandleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ChatLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <Activity className="w-8 h-8 text-primary animate-pulse" />
        </div>
      }>
        <ChatInterface />
      </Suspense>
    </ChatLayout>
  );
}
