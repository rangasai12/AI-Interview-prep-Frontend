import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Badge } from "./ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isVoice?: boolean;
}

interface ConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
}

const mockResponses = [
  "That's a great question! Let me clarify: ",
  "To elaborate on that point: ",
  "Here's what I mean by that: ",
  "Let me give you an example: ",
  "Think of it this way: "
];

export function ConversationDialog({ open, onOpenChange, question }: ConversationDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `I'm here to help clarify the question: "${question}". What would you like to know more about?`,
      isVoice: false
    }
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = (isVoiceMessage = false) => {
    if (!input.trim() && !isVoiceMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: isVoiceMessage ? "[Voice message recorded]" : input,
      isVoice: isVoiceMessage
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse + "This would typically provide context or examples to help you better understand what's being asked. Feel free to ask more follow-up questions!",
        isVoice: true // AI responses include voice
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }, 800);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and send
      setIsRecording(false);
      handleSend(true);
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  const togglePlayVoice = (messageId: string) => {
    if (isPlayingVoice === messageId) {
      // Stop playing
      setIsPlayingVoice(null);
    } else {
      // Start playing (simulate)
      setIsPlayingVoice(messageId);
      setTimeout(() => {
        setIsPlayingVoice(null);
      }, 3000); // Simulate 3 second voice message
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ask Follow-up Questions</DialogTitle>
          <DialogDescription>
            Get clarification on the interview question using voice or text
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="space-y-2">
                    <p className="text-sm">{message.content}</p>
                    {message.isVoice && message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePlayVoice(message.id)}
                        className="h-7 px-2 -ml-2"
                      >
                        {isPlayingVoice === message.id ? (
                          <>
                            <VolumeX className="w-3 h-3 mr-1" />
                            <span className="text-xs">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 mr-1" />
                            <span className="text-xs">Play Voice</span>
                          </>
                        )}
                      </Button>
                    )}
                    {message.isVoice && message.role === "user" && (
                      <Badge variant="secondary" className="text-xs">
                        Voice
                      </Badge>
                    )}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {isRecording && (
          <div className="flex items-center gap-2 bg-destructive/10 rounded-lg p-3 border border-destructive/20">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm">Recording your question...</span>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={toggleRecording}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop & Send
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Question
                </>
              )}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Or type your question..."
              className="flex-1"
              disabled={isRecording}
            />
            <Button onClick={() => handleSend(false)} size="icon" disabled={isRecording || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
