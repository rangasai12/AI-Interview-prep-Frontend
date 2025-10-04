import { ArrowLeft, MapPin, Briefcase, FileText, Mic } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface JobDetailPageProps {
  jobId: string;
  onBack: () => void;
  onStartInterview: (jobId: string) => void;
  onTailorResume: (jobId: string) => void;
}

const jobDetails: Record<string, any> = {
  "1": {
    title: "Senior Frontend Developer",
    company: "TechCorp Inc",
    logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop",
    location: "San Francisco, CA",
    remote: true,
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Redux"],
    description: "We're looking for a Senior Frontend Developer to join our innovative team. You'll be responsible for building next-generation web applications that serve millions of users worldwide. The ideal candidate has a strong background in React and TypeScript, with a passion for creating beautiful, performant user interfaces.\n\nYou'll work closely with our design team to implement pixel-perfect UIs, collaborate with backend engineers to build robust APIs, and mentor junior developers. We value clean code, testing, and continuous improvement.",
    requirements: [
      "5+ years of experience in frontend development",
      "Expert knowledge of React and TypeScript",
      "Experience with modern build tools and CI/CD",
      "Strong understanding of web performance optimization",
      "Excellent communication skills"
    ],
    matchScore: 92
  },
  "2": {
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    location: "New York, NY",
    remote: false,
    skills: ["Node.js", "React", "PostgreSQL", "AWS", "Docker"],
    description: "Join a fast-growing startup revolutionizing the finance industry. As a Full Stack Engineer, you'll own features from conception to deployment.",
    requirements: [
      "3+ years of full stack development",
      "Proficiency in Node.js and React",
      "Database design experience",
      "Cloud infrastructure knowledge"
    ],
    matchScore: 85
  }
};

export function JobDetailPage({ jobId, onBack, onStartInterview, onTailorResume }: JobDetailPageProps) {
  const job = jobDetails[jobId] || jobDetails["1"];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img 
                    src={job.logo} 
                    alt={job.company}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="mb-2">{job.title}</CardTitle>
                    <CardDescription className="mb-3">{job.company}</CardDescription>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                      {job.remote && (
                        <Badge variant="secondary">Remote</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-line text-muted-foreground">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Resume Score */}
            <Card>
              <CardHeader>
                <CardTitle>Resume Match</CardTitle>
                <CardDescription>How well your resume matches this job</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    <span className={job.matchScore >= 85 ? "text-green-600" : "text-orange-600"}>
                      {job.matchScore}%
                    </span>
                  </div>
                  <Progress value={job.matchScore} className="h-2" />
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => onTailorResume(jobId)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Tailor Resume
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Customize your resume for this specific role
                </p>
              </CardContent>
            </Card>

            {/* Mock Interview */}
            <Card>
              <CardHeader>
                <CardTitle>AI Mock Interview</CardTitle>
                <CardDescription>Practice this role with AI-driven interviews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Mic className="w-4 h-4 mt-1 text-primary" />
                    <div className="text-sm text-muted-foreground">
                      Get real-time feedback on your answers, technical skills, and communication style.
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onStartInterview(jobId)}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Start Mock Interview
                </Button>
              </CardContent>
            </Card>

            {/* Quick Apply */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to Apply?</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="default">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
