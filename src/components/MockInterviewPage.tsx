import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, MicOff, Code, Settings, ChevronRight, X, MessageCircle, Clock, Timer } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ConversationDialog } from "./ConversationDialog";

interface MockInterviewPageProps {
  jobId: string;
  onBack: () => void;
  onComplete: (jobId: string) => void;
}

const interviewQuestions = [
  {
    id: 1,
    type: "behavioral",
    question: "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
    difficulty: "medium"
  },
  {
    id: 2,
    type: "technical",
    question: "Explain the difference between useMemo and useCallback in React. When would you use each?",
    difficulty: "medium"
  },
  {
    id: 3,
    type: "coding",
    question: "Write a function that debounces another function. The debounced function should only execute after it hasn't been called for N milliseconds.",
    difficulty: "hard",
    starter: `function debounce(func, delay) {\n  // Your code here\n  \n}`
  },
  {
    id: 4,
    type: "technical",
    question: "How would you optimize the performance of a React application that renders a large list of items?",
    difficulty: "medium"
  },
  {
    id: 5,
    type: "behavioral",
    question: "Describe a project you're most proud of. What was your role and what impact did it have?",
    difficulty: "easy"
  }
];

export function MockInterviewPage({ jobId, onBack, onComplete }: MockInterviewPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [voice, setVoice] = useState("friendly-professional");
  const [mood, setMood] = useState("friendly");
  const [isRecording, setIsRecording] = useState(false);
  const [answer, setAnswer] = useState("");
  const [codeAnswer, setCodeAnswer] = useState(interviewQuestions[0].starter || "");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  
  // Timer states
  const [totalTime, setTotalTime] = useState(0); // Total interview time in seconds
  const [questionTime, setQuestionTime] = useState(0); // Time spent on current question
  const [interactionTimeout, setInteractionTimeout] = useState(30); // Seconds before auto-skip
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const totalTimerRef = useRef<NodeJS.Timeout>();
  const questionTimerRef = useRef<NodeJS.Timeout>();
  const interactionTimerRef = useRef<NodeJS.Timeout>();

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interviewQuestions.length) * 100;

  // Total interview timer
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
    };
  }, []);

  // Per-question timer and interaction timeout
  useEffect(() => {
    // Reset question timer and interaction state
    setQuestionTime(0);
    setInteractionTimeout(30);
    setHasInteracted(false);
    
    // Start question timer
    questionTimerRef.current = setInterval(() => {
      setQuestionTime(prev => prev + 1);
    }, 1000);

    // Start interaction timeout
    interactionTimerRef.current = setInterval(() => {
      setInteractionTimeout(prev => {
        if (prev <= 1 && !hasInteracted) {
          // Auto-skip if no interaction
          handleSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
      if (interactionTimerRef.current) {
        clearInterval(interactionTimerRef.current);
      }
    };
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (currentQuestion.starter) {
      setCodeAnswer(currentQuestion.starter);
    }
  }, [currentQuestionIndex]);

  const handleNext = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
      setCodeAnswer("");
    } else {
      onComplete(jobId);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!hasInteracted) {
      setHasInteracted(true);
      // Stop the interaction timeout countdown
      if (interactionTimerRef.current) {
        clearInterval(interactionTimerRef.current);
      }
    }
  };

  const handleConverse = () => {
    setConversationOpen(true);
    if (!hasInteracted) {
      setHasInteracted(true);
      // Stop the interaction timeout countdown
      if (interactionTimerRef.current) {
        clearInterval(interactionTimerRef.current);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-orange-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Interview
            </Button>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Timers */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formatTime(totalTime)}</span>
                </div>
                <div className="hidden sm:block text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {interviewQuestions.length}
                </div>
              </div>
              <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Interview Settings</SheetTitle>
                    <SheetDescription>
                      Customize your interview experience
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm">Difficulty Level</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Interviewer Voice</label>
                      <Select value={voice} onValueChange={setVoice}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly-professional">Friendly Professional</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Interviewer Mood</label>
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="strict">Strict</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Question Display */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={currentQuestion.type === "coding" ? "default" : "secondary"}>
                  {currentQuestion.type}
                </Badge>
                <Badge className={`${getDifficultyColor(currentQuestion.difficulty)} text-white`}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{formatTime(questionTime)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Interaction Timeout Warning */}
              {!hasInteracted && interactionTimeout <= 10 && (
                <div className={`rounded-lg p-3 ${
                  interactionTimeout <= 5 ? 'bg-destructive/10 border border-destructive/20' : 'bg-orange-500/10 border border-orange-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${interactionTimeout <= 5 ? 'text-destructive' : 'text-orange-600'}`} />
                    <span className="text-sm">
                      {interactionTimeout <= 5 ? 'Auto-skipping in' : 'Interact in'} {interactionTimeout}s
                    </span>
                  </div>
                </div>
              )}
              
              <p className="text-lg leading-relaxed">
                {currentQuestion.question}
              </p>
              
              {/* Converse Button */}
              <Button 
                variant="outline" 
                onClick={handleConverse}
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask Follow-up Questions
              </Button>
              
              {currentQuestion.type === "coding" && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Code className="w-4 h-4" />
                    <span>Coding Challenge</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Write your solution in the editor on the right. Your code will be evaluated in real-time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Answer Input */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.type === "coding" ? (
                <div className="space-y-2">
                  <div className="bg-slate-900 rounded-lg p-4">
                    <Textarea
                      value={codeAnswer}
                      onChange={(e) => setCodeAnswer(e.target.value)}
                      className="min-h-[300px] font-mono text-sm bg-transparent border-none text-green-400 focus-visible:ring-0 resize-none"
                      placeholder="// Write your code here..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your code will be evaluated for correctness and efficiency
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      onClick={toggleRecording}
                      className="flex-1"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-2 bg-destructive/10 rounded-lg p-3">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      <span className="text-sm">Recording in progress...</span>
                    </div>
                  )}
                  <div className="relative">
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="min-h-[250px]"
                      placeholder="Or type your answer here..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use voice recording or type your answer. AI will analyze your response.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  {currentQuestionIndex < interviewQuestions.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Finish Interview"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversation Dialog */}
      <ConversationDialog
        open={conversationOpen}
        onOpenChange={setConversationOpen}
        question={currentQuestion.question}
      />
    </div>
  );
}
