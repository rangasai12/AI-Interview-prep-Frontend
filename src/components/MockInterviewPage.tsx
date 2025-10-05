import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, MicOff, Code, Settings, ChevronRight, X, MessageCircle, Clock, Timer, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ConversationDialog } from "./ConversationDialog";
import { jobApiService, InterviewQuestion, InterviewQuestionsResponse } from "../services/jobApi";
import { getStoredResumeSections } from "../lib/resumeStore";

interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  remote: boolean;
  skills: string[];
  description: string;
  matchScore: number;
  applyLink?: string;
  employmentType?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string;
}

interface MockInterviewPageProps {
  jobId: string;
  jobData?: Job;
  onBack: () => void;
  onComplete: (jobId: string) => void;
}

// Helper function to convert resume sections to string
const convertResumeToString = (sections: any[]): string => {
  return sections
    .map(section => `${section.title}\n${section.content}`)
    .join('\n\n');
};

export function MockInterviewPage({ jobId, jobData, onBack, onComplete }: MockInterviewPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [voice, setVoice] = useState("friendly-professional");
  const [mood, setMood] = useState("friendly");
  const [isRecording, setIsRecording] = useState(false);
  const [answer, setAnswer] = useState("");
  const [codeAnswer, setCodeAnswer] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);

  // Audio recording states
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // API data states
  const [interviewData, setInterviewData] = useState<InterviewQuestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer states
  const [totalTime, setTotalTime] = useState(0); // Total interview time in seconds
  const [questionTime, setQuestionTime] = useState(0); // Time spent on current question
  const [interactionTimeout, setInteractionTimeout] = useState(30); // Seconds before auto-skip
  const [hasInteracted, setHasInteracted] = useState(false);

  const totalTimerRef = useRef<NodeJS.Timeout>();
  const questionTimerRef = useRef<NodeJS.Timeout>();
  const interactionTimerRef = useRef<NodeJS.Timeout>();
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsObjectUrlRef = useRef<string | null>(null);

  // Get current question from API data or fallback
  const currentQuestion = interviewData?.questions[currentQuestionIndex] || {
    question_id: "loading",
    kind: "loading",
    text: "Loading question...",
    rationale: "",
    rubric: [],
    user_response: ""
  };

  const progress = interviewData ? ((currentQuestionIndex + 1) / interviewData.questions.length) * 100 : 0;

  // Fetch interview questions when component mounts
  useEffect(() => {
    if (jobData?.description) {
      fetchInterviewQuestions();
    }
  }, [jobData, difficulty]);

  const fetchInterviewQuestions = async () => {
    if (!jobData?.description) return;

    setLoading(true);
    setError(null);

    try {
      // Get resume data from localStorage
      const resumeSections = getStoredResumeSections();
      const resumeString = resumeSections ? convertResumeToString(resumeSections) : "No resume data available";

      const questionsData = await jobApiService.getInterviewQuestions({
        job_description: jobData.description,
        resume: resumeString,
        job_title: jobData.title,
        difficulty: difficulty
      });

      setInterviewData(questionsData);
      setCurrentQuestionIndex(0);
      setAnswer("");
      setCodeAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch interview questions");
      console.error("Error fetching interview questions:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // Cleanup TTS audio on unmount
  useEffect(() => {
    return () => {
      if (ttsAudioRef.current) {
        try { ttsAudioRef.current.pause(); } catch { }
      }
      if (ttsObjectUrlRef.current) {
        URL.revokeObjectURL(ttsObjectUrlRef.current);
      }
    };
  }, []);

  const speakQuestion = async (text: string) => {
    if (!text || text === "Loading question...") return;
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
        // Autoplay might be blocked until user interaction
        console.warn('Unable to autoplay TTS. User interaction may be required.', err);
      });
    } catch (e) {
      console.error('Error speaking question:', e);
    }
  };

  // Read the question aloud when a new question is shown
  useEffect(() => {
    if (currentQuestion && currentQuestion.text) {
      speakQuestion(currentQuestion.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, interviewData?.questions]);

  // Cleanup audio recording on unmount
  useEffect(() => {
    return () => {
      if (isRecordingAudio && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecordingAudio]);

  useEffect(() => {
    if (currentQuestion.kind === "coding" && currentQuestion.coding) {
      // Set a basic starter template for coding questions
      const starter = `// ${currentQuestion.coding.target_language} solution\nfunction solution() {\n  // Your code here\n  \n}`;
      setCodeAnswer(starter);
    } else {
      setCodeAnswer("");
    }
  }, [currentQuestionIndex, currentQuestion]);

  const handleNext = () => {
    // Stop any ongoing recording
    if (isRecordingAudio) {
      stopAudioRecording();
    }
    // Persist user's response for the current question
    persistCurrentUserResponse();

    if (interviewData && currentQuestionIndex < interviewData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
      setCodeAnswer("");
      setTranscribedText("");
    } else {
      // Submit scores payload before completing
      submitScores().finally(() => onComplete(jobId));
    }
  };

  const handleSkip = () => {
    // On skip, clear the current question response then move next
    persistCurrentUserResponse(true);

    if (interviewData && currentQuestionIndex < interviewData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
      setCodeAnswer("");
      setTranscribedText("");
    } else {
      submitScores().finally(() => onComplete(jobId));
    }
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

  // Audio recording functions
  const startAudioRecording = async () => {
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

      if (!hasInteracted) {
        setHasInteracted(true);
        if (interactionTimerRef.current) {
          clearInterval(interactionTimerRef.current);
        }
      }
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

  const transcribeAudio = async (audioBlob: Blob) => {
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
      // Append transcribed text to the answer
      setAnswer(prev => prev + (prev ? '\n\n' : '') + transcription);

      console.log('Transcription result:', result);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Persist the user's response into interviewData for the current question
  const persistCurrentUserResponse = (isSkip: boolean = false) => {
    setInterviewData(prev => {
      if (!prev) return prev;
      const questionsCopy = [...prev.questions];
      const q = { ...questionsCopy[currentQuestionIndex] };
      if (isSkip) {
        q.user_response = "";
      } else {
        q.user_response = q.kind === "coding" ? codeAnswer : answer;
      }
      questionsCopy[currentQuestionIndex] = q;
      return { ...prev, questions: questionsCopy };
    });
  };

  // Submit the full question set with user responses to scoring API
  const submitScores = async () => {
    if (!interviewData) return;
    try {
      const payload = {
        question_set: {
          job_title: interviewData.job_title,
          summary: interviewData.summary,
          questions: interviewData.questions.map(q => ({
            question_id: q.question_id,
            kind: q.kind,
            text: q.text,
            rationale: q.rationale,
            rubric: q.rubric,
            coding: q.coding,
            user_response: q.user_response || ""
          }))
        }
      };

      const res = await fetch('http://127.0.0.1:8000/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.error('Scores API error', res.status);
        return;
      }

      // Read scores response
      const scoresResponse = await res.json().catch(() => null);
      if (scoresResponse) {
        try {
          // Persist for later pages
          localStorage.setItem('lastScoresResponse', JSON.stringify(scoresResponse));

          // Build learning request payload from scores and interview data
          const items = Array.isArray(scoresResponse.items) ? scoresResponse.items : [];
          // Build a quick lookup to fetch original question text by id
          const idToQuestionText: Record<string, string> = {};
          interviewData.questions.forEach(q => { idToQuestionText[q.question_id] = q.text; });

          const learningItems = items.map((it: any) => {
            const bullet = Array.isArray(it.bullet_evals) ? it.bullet_evals : [];
            const rawScore = bullet.reduce((sum: number, b: any) => sum + (typeof b?.score === 'number' ? b.score : 0), 0);
            const maxScore = bullet.length * 10.0;
            const percent = maxScore > 0 ? (rawScore / maxScore) * 100.0 : 0.0;
            const weight = 1.0;
            return {
              question_id: it.question_id,
              kind: it.kind,
              text: idToQuestionText[it.question_id] || '',
              verdict: it.verdict || '',
              raw_score: rawScore,
              max_score: maxScore,
              percent,
              weight,
              weighted_raw: rawScore * weight,
              weighted_max: maxScore * weight,
              bullet_evals: bullet,
              feedback: it.feedback || '',
              coding_review: it.coding_review || undefined
            };
          });

          const totalRaw = learningItems.reduce((s, it) => s + (it.weighted_raw || 0), 0);
          const totalMax = learningItems.reduce((s, it) => s + (it.weighted_max || 0), 0);
          const overallPercent = totalMax > 0 ? (totalRaw / totalMax) * 100.0 : 0.0;

          const learningRequest = {
            scored_report: {
              job_title: scoresResponse.job_title || interviewData.job_title,
              overall: {
                total_score: totalRaw,
                total_max: totalMax,
                percent: overallPercent
              },
              items: learningItems
            },
            threshold: 70.0,
            budget_hours: 20.0,
            max_resources: 6
          };

          const learnRes = await fetch('http://127.0.0.1:8000/learning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(learningRequest)
          });
          if (!learnRes.ok) {
            console.error('Learning API error', learnRes.status);
            return;
          }
          const learningPlan = await learnRes.json().catch(() => null);
          if (learningPlan) {
            localStorage.setItem('lastLearningPlan', JSON.stringify(learningPlan));
            localStorage.setItem('lastLearningScores', JSON.stringify(learningRequest.scored_report));
          }
        } catch (e) {
          console.error('Failed to prepare/send learning request:', e);
        }
      }
    } catch (e) {
      console.error('Failed to submit scores:', e);
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
                  Question {currentQuestionIndex + 1} of {interviewData?.questions.length || 0}
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
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating Interview Questions</h3>
            <p className="text-muted-foreground text-center max-w-md">
              We're analyzing the job description and your resume to create personalized interview questions...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Failed to Load Questions</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchInterviewQuestions} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* No Job Data Warning */}
        {!jobData && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
              <h3 className="text-lg font-semibold mb-2">Job Data Not Available</h3>
              <p className="text-muted-foreground mb-4">
                Please go back to the job details page and start the interview from there.
              </p>
              <Button onClick={onBack} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        )}

        {/* Main Interview Content */}
        {!loading && !error && jobData && interviewData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Question Display */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={currentQuestion.kind === "coding" ? "default" : "secondary"}>
                    {currentQuestion.kind}
                  </Badge>
                  <Badge className={`${getDifficultyColor(currentQuestion.coding?.difficulty || difficulty)} text-white`}>
                    {currentQuestion.coding?.difficulty || difficulty}
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
                  <div className={`rounded-lg p-3 ${interactionTimeout <= 5 ? 'bg-destructive/10 border border-destructive/20' : 'bg-orange-500/10 border border-orange-500/20'
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
                  {currentQuestion.text}
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

                {currentQuestion.kind === "coding" && (
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
                {currentQuestion.kind === "coding" ? (
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
                        variant={isRecordingAudio ? "destructive" : "default"}
                        onMouseDown={startAudioRecording}
                        onMouseUp={stopAudioRecording}
                        onMouseLeave={stopAudioRecording}
                        onTouchStart={startAudioRecording}
                        onTouchEnd={stopAudioRecording}
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
                    <div className="relative">
                      <Textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="min-h-[250px]"
                        placeholder="Hold the microphone button to record your answer, or type here..."
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hold the microphone button to record your answer, or type your response. The transcribed text will be automatically added to your answer.
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={handleSkip} className="flex-1">
                    Skip
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    {interviewData && currentQuestionIndex < interviewData.questions.length - 1 ? (
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
        )}
      </div>

      {/* Conversation Dialog */}
      <ConversationDialog
        open={conversationOpen}
        onOpenChange={setConversationOpen}
        question={currentQuestion.text}
      />
    </div>
  );
}
