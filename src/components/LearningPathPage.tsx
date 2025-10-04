import { ArrowLeft, BookOpen, Video, FileText, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface LearningPathPageProps {
  jobId: string;
  onBack: () => void;
  onRetakeInterview: (jobId: string) => void;
}

const feedbackData = {
  overallScore: 78,
  strengths: [
    "Strong understanding of React fundamentals",
    "Good communication skills",
    "Clear problem-solving approach"
  ],
  improvements: [
    "TypeScript advanced patterns",
    "System design principles",
    "Performance optimization techniques"
  ],
  resources: [
    {
      id: 1,
      type: "video",
      title: "Advanced TypeScript Patterns",
      description: "Learn advanced TypeScript patterns including generics, conditional types, and utility types.",
      link: "#",
      duration: "2h 30m",
      difficulty: "Advanced"
    },
    {
      id: 2,
      type: "article",
      title: "React Performance Optimization",
      description: "Comprehensive guide to optimizing React applications for production.",
      link: "#",
      duration: "15 min read",
      difficulty: "Intermediate"
    },
    {
      id: 3,
      type: "course",
      title: "System Design Interview Prep",
      description: "Master system design concepts with real-world examples and practice problems.",
      link: "#",
      duration: "8 hours",
      difficulty: "Advanced"
    },
    {
      id: 4,
      type: "video",
      title: "Behavioral Interview Masterclass",
      description: "Learn how to structure compelling answers using the STAR method.",
      link: "#",
      duration: "1h 45m",
      difficulty: "Beginner"
    },
    {
      id: 5,
      type: "article",
      title: "Code Review Best Practices",
      description: "Essential skills for reviewing code and collaborating with teams effectively.",
      link: "#",
      duration: "10 min read",
      difficulty: "Intermediate"
    }
  ]
};

export function LearningPathPage({ jobId, onBack, onRetakeInterview }: LearningPathPageProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "article": return <FileText className="w-4 h-4" />;
      case "course": return <BookOpen className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Intermediate": return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
      case "Advanced": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2">Your Learning Path</h1>
          <p className="text-muted-foreground">
            Based on your interview performance, here's a personalized roadmap to help you improve
          </p>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interview Performance</CardTitle>
            <CardDescription>Overall assessment based on all questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">
                  <span className={feedbackData.overallScore >= 70 ? "text-green-600" : "text-orange-600"}>
                    {feedbackData.overallScore}%
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Good performance!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You're on the right track. Focus on the areas below to improve further.
                  </p>
                </div>
              </div>
            </div>
            <Progress value={feedbackData.overallScore} className="h-2" />
          </CardContent>
        </Card>

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <CardTitle>Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedbackData.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <CardTitle>Areas to Improve</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedbackData.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="text-orange-600 mt-1">→</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Learning Resources */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="mb-1">Recommended Resources</h2>
            <p className="text-muted-foreground">
              Curated content to help you master the skills you need
            </p>
          </div>

          <div className="space-y-4">
            {feedbackData.resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="break-words">{resource.title}</h3>
                        <Badge className={getDifficultyColor(resource.difficulty)}>
                          {resource.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline" className="capitalize">
                            {resource.type}
                          </Badge>
                          <span>{resource.duration}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          View Resource
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="mb-1">Want to improve your score?</h3>
                <p className="text-sm text-muted-foreground">
                  Retake the interview after reviewing the resources
                </p>
              </div>
              <Button onClick={() => onRetakeInterview(jobId)}>
                Retake Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
