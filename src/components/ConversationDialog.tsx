import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio recording states
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFetchingGuide, setIsFetchingGuide] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsObjectUrlRef = useRef<string | null>(null);

  // Seed initial assistant message with the latest question when dialog opens
  useEffect(() => {
    if (open) {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `${question}`,
          isVoice: false
        }
      ]);
    }
  }, [open, question]);

  // Cleanup audio recording when dialog closes
  useEffect(() => {
    if (!open && isRecordingAudio && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      setTranscribedText("");
    }
  }, [open, isRecordingAudio]);

  // Cleanup any TTS audio on close/unmount
  useEffect(() => {
    return () => {
      if (ttsAudioRef.current) {
        try { ttsAudioRef.current.pause(); } catch { }
        ttsAudioRef.current = null;
      }
      if (ttsObjectUrlRef.current) {
        URL.revokeObjectURL(ttsObjectUrlRef.current);
        ttsObjectUrlRef.current = null;
      }
    };
  }, []);

  const speakText = async (text: string) => {
    if (!text || !open) return;
    // Stop any existing playback and cleanup
    if (ttsAudioRef.current) {
      try { ttsAudioRef.current.pause(); } catch { }
      ttsAudioRef.current = null;
    }
    if (ttsObjectUrlRef.current) {
      URL.revokeObjectURL(ttsObjectUrlRef.current);
      ttsObjectUrlRef.current = null;
    }

    try {
      const response = await fetch('http://localhost:8000/tts/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`TTS HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      const objectUrl = URL.createObjectURL(audioBlob);
      ttsObjectUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      ttsAudioRef.current = audio;
      audio.play().catch((err) => {
        console.warn('Unable to autoplay TTS. User interaction may be required.', err);
      });
    } catch (e) {
      console.error('Error speaking assistant message:', e);
    }
  };

  const buildHistoryString = (allMessages: Message[]): string => {
    // Exclude the initial assistant message (seed) from history
    const conversational = allMessages.slice(1);
    const parts = conversational.map(m => {
      const speaker = m.role === 'assistant' ? 'interviewer' : 'candidate';
      const safe = m.content.replace(/\"/g, '“').replace(/"/g, '“');
      return `${speaker}: "${safe}"`;
    });
    return `[${parts.join(' ')}]`;
  };

  const callGuideApi = async (mainQuestion: string, historyStr: string, newUserQuery: string): Promise<string> => {
    const response = await fetch('http://127.0.0.1:8000/coach/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ main_question: mainQuestion, history_str: historyStr, new_user_query: newUserQuery }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      // Try common keys (including 'guidance' from your API)
      const value =
        data.guidance ||
        data.answer ||
        data.response ||
        data.text ||
        data.result ||
        data.message ||
        data.guide ||
        data.content || '';
      return value != null ? String(value) : '';
    }
    // Fallback to raw text
    const text = await response.text();
    return text || '';
  };

  const handleSend = async (isVoiceMessage = false) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      isVoice: isVoiceMessage
    };

    // Push user message immediately
    setMessages(prev => [...prev, userMessage]);

    try {
      setIsFetchingGuide(true);
      const seeded = messages.length ? messages : [{ id: 'seed', role: 'assistant', content: question, isVoice: false } as Message];
      const all = [...seeded, userMessage];
      const historyStr = buildHistoryString(all);
      const guide = await callGuideApi(question, historyStr, input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: (guide && guide.trim().length > 0)
          ? guide
          : (mockResponses[Math.floor(Math.random() * mockResponses.length)] + " I'm here to help with details."),
        isVoice: true,
      };
      setMessages(prev => [...prev, assistantMessage]);
      // Speak the assistant guidance using TTS
      if (assistantMessage.content) {
        speakText(assistantMessage.content);
      }
    } catch (err) {
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I could not fetch guidance right now. Please try again.',
        isVoice: false,
      };
      setMessages(prev => [...prev, assistantMessage]);
      console.error('Guide API error:', err);
    } finally {
      setIsFetchingGuide(false);
      // Auto-scroll to bottom after response
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }

    setInput("");
    setTranscribedText("");
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(false);
    }
  };


  // Audio recording functions
  const startAudioRecording = async () => {
    // Prevent multiple simultaneous recordings
    if (isRecordingAudio || isTranscribing) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      recordingStartTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  // Use global listeners so slight pointer movement inside the dialog doesn't prematurely stop recording
  const handleGlobalMouseUp = () => {
    handlePressEnd();
  };

  const handleGlobalTouchEnd = () => {
    handlePressEnd();
  };

  const handlePressStart = async () => {
    // Attach global listeners to reliably detect release
    window.addEventListener('mouseup', handleGlobalMouseUp, { once: true });
    window.addEventListener('touchend', handleGlobalTouchEnd, { once: true });
    await startAudioRecording();
  };

  const handlePressEnd = () => {
    stopAudioRecording();
    window.removeEventListener('mouseup', handleGlobalMouseUp);
    window.removeEventListener('touchend', handleGlobalTouchEnd);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    // Check if we have audio data
    if (audioBlob.size === 0) {
      console.log('No audio data to transcribe');
      setIsTranscribing(false);
      return;
    }

    // Check if recording was too short (less than 0.5 seconds)
    const recordingDuration = Date.now() - recordingStartTimeRef.current;
    if (recordingDuration < 500) {
      console.log('Recording too short, skipping transcription');
      setIsTranscribing(false);
      return;
    }

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch('http://127.0.0.1:8000/tts/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const transcription = result.transcription || '';

      setTranscribedText(transcription);
      // Append transcribed text to the input
      setInput(prev => prev + (prev ? '\n\n' : '') + transcription);

      console.log('Transcription result:', result);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden min-h-0">
        <DialogHeader>
          <DialogTitle>Ask Follow-up Questions</DialogTitle>
          <DialogDescription>
            Get clarification on the interview question using voice or text
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto pr-4 -mr-4" ref={scrollRef}>
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
                  className={`rounded-lg p-3 max-w-[80%] ${message.role === "user"
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

        {isRecordingAudio && (
          <div className="flex items-center gap-2 bg-destructive/10 rounded-lg p-3">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm">Recording in progress... Release to stop</span>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center gap-2 bg-blue-500/10 rounded-lg p-3">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-600">Transcribing your speech...</span>
          </div>
        )}

        {transcribedText && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-700">Transcribed Text:</span>
            </div>
            <p className="text-sm text-green-800">{transcribedText}</p>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isRecordingAudio ? "destructive" : "default"}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              className="flex-1"
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transcribing...
                </>
              ) : isRecordingAudio ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Release to Stop
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Hold to Record
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hold the microphone button to record your question, or type here..."
              className="flex-1"
              disabled={isRecordingAudio || isTranscribing}
            />
            <Button onClick={() => handleSend(false)} size="icon" disabled={isRecordingAudio || isTranscribing || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Hold the microphone button to record your question, or type your response. The transcribed text will be automatically added to your input.
          </p>
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
