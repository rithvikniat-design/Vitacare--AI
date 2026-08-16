"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, MessageSquare, Settings } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getConversations } from "@/lib/actions/chat";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

export function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chatId");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      // Load user email
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }

      // Load conversations
      const data = await getConversations();
      setConversations(data.map(c => ({
        id: c.id,
        title: c.title,
        updated_at: c.updated_at
      })));
    }
    loadData();
  }, [currentChatId]); // Refresh when chat changes (e.g., new chat created)

  const handleNewChat = () => {
    router.push("/");
  };

  const handleSelectChat = (id: string) => {
    router.push(`/?chatId=${id}`);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayConversations = conversations.filter(c => new Date(c.updated_at) >= today);
  const previousConversations = conversations.filter(c => new Date(c.updated_at) < today);

  return (
    <div className="w-64 h-full bg-muted/30 border-r flex flex-col">
      <div className="p-4 border-b">
        <Button 
          className="w-full justify-start gap-2" 
          variant="default"
          onClick={handleNewChat}
        >
          <PlusCircle className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {todayConversations.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Today</h3>
              <div className="space-y-1">
                {todayConversations.map(conv => (
                  <Button 
                    key={conv.id}
                    variant={currentChatId === conv.id ? "secondary" : "ghost"} 
                    className="w-full justify-start font-normal text-sm h-9 px-2"
                    onClick={() => handleSelectChat(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{conv.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {previousConversations.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Previous</h3>
              <div className="space-y-1">
                {previousConversations.map(conv => (
                  <Button 
                    key={conv.id}
                    variant={currentChatId === conv.id ? "secondary" : "ghost"} 
                    className="w-full justify-start font-normal text-sm h-9 px-2"
                    onClick={() => handleSelectChat(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{conv.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => router.push('/profile')}>
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{userEmail || "Guest User"}</span>
              <span className="text-xs text-muted-foreground truncate">Medical Plan</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => router.push('/profile')}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
