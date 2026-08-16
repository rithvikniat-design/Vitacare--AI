"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TypingIndicator() {
  return (
    <div className="py-6 px-4 md:px-8 w-full flex justify-center bg-muted/50">
      <div className="w-full max-w-3xl flex gap-4 md:gap-6">
        <div className="flex-shrink-0 mt-1">
          <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-primary/20 shadow-sm">
            <AvatarImage src="/bot-avatar.png" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
              AI
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Medical Assistant</span>
          </div>
          <div className="flex items-center space-x-1 h-6">
            <motion.div
              className="w-1.5 h-1.5 bg-primary/60 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-primary/60 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-primary/60 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
