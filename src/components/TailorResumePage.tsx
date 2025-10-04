import { useState } from "react";
import { ArrowLeft, Download, Sparkles, Briefcase, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ResumeEditor, ResumeSection } from "./ResumeEditor";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface TailorResumePageProps {
  jobId: string;
  onBack: () => void;
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
  }
};

const initialSections: ResumeSection[] = [
  {
    id: "summary",
    title: "Professional Summary",
    content: "Software Engineer with 5+ years of experience in web development. Passionate about creating user-friendly applications."
  },
  {
    id: "experience",
    title: "Work Experience",
    content: "Software Engineer at TechCo (2020-Present)\n• Built responsive web applications using React and TypeScript\n• Collaborated with cross-functional teams to deliver features\n• Implemented UI components following design specifications"
  },
  {
    id: "skills",
    title: "Skills",
    content: "React, JavaScript, TypeScript, CSS, HTML, Git, Node.js"
  },
  {
    id: "education",
    title: "Education",
    content: "Bachelor of Science in Computer Science\nUniversity of Technology (2015-2019)"
  }
];

export function TailorResumePage({ jobId, onBack }: TailorResumePageProps) {
  const job = jobDetails[jobId] || jobDetails["1"];
  const [sections, setSections] = useState<ResumeSection[]>(initialSections);
  const [isTailoring, setIsTailoring] = useState(false);

  const handleAutoTailor = () => {
    setIsTailoring(true);
    
    // Simulate AI tailoring all sections
    setTimeout(() => {
      const tailoredSections: ResumeSection[] = [
        {
          id: "summary",
          title: "Professional Summary",
          content: `Senior Software Engineer with 5+ years of expertise in modern web development, specifically aligned with ${job.title} requirements at ${job.company}. Proven track record of building scalable React applications serving 1M+ users. Specialized in ${job.skills.slice(0, 3).join(", ")} with a passion for creating intuitive, high-performance user experiences. Ready to contribute immediately to ${job.company}'s mission.`
        },
        {
          id: "experience",
          title: "Work Experience",
          content: `Senior Software Engineer | TechCo | 2020-Present\n• Architected and developed 15+ responsive web applications using ${job.skills[0]} and ${job.skills[1]}, improving user engagement by 40%\n• Led cross-functional agile teams of 5-8 members to deliver mission-critical features matching ${job.title} requirements\n• Implemented reusable UI component library using ${job.skills[2] || "modern CSS"}, reducing development time by 30%\n• Mentored 3 junior developers and established coding best practices\n• Optimized web performance achieving 90+ Lighthouse scores, directly applicable to ${job.company}'s needs\n\nFrontend Developer | WebSolutions | 2018-2020\n• Built and maintained client-facing applications using ${job.skills[0]} ecosystem\n• Collaborated with UX designers to implement pixel-perfect interfaces\n• Integrated ${job.skills.includes("Redux") ? "Redux" : "state management"} for complex application state`
        },
        {
          id: "skills",
          title: "Technical Skills",
          content: `Core Technologies: ${job.skills.join(", ")}\nFrontend: React (Expert), TypeScript (Advanced), JavaScript (ES6+), HTML5, CSS3\nFrameworks & Libraries: ${job.skills.filter(s => s !== "React" && s !== "TypeScript").join(", ")}, Jest, React Testing Library\nTools & Practices: Git, CI/CD, Agile/Scrum, Web Performance Optimization, Responsive Design\nAdditional: RESTful APIs, Webpack, Babel, npm/yarn`
        },
        {
          id: "education",
          title: "Education & Certifications",
          content: "Bachelor of Science in Computer Science | GPA: 3.8/4.0\nUniversity of Technology | 2015-2019\nRelevant Coursework: Data Structures, Algorithms, Web Development, Database Systems, Software Engineering\n\nCertifications:\n• Advanced React Patterns (2023)\n• TypeScript Deep Dive (2022)"
        }
      ];
      
      setSections(tailoredSections);
      setIsTailoring(false);
    }, 2500);
  };

  const handleDownload = () => {
    const resumeText = sections
      .map(section => `${section.title.toUpperCase()}\n${section.content}`)
      .join('\n\n');
    
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${job.company.replace(/\s+/g, '-').toLowerCase()}-${job.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job
            </Button>
            <div className="flex gap-2">
              <Button 
                onClick={handleAutoTailor}
                disabled={isTailoring}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isTailoring ? "Tailoring..." : "Auto-Tailor All Sections"}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Reference */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <h2 className="mb-2">Tailoring Resume For</h2>
                <p className="text-sm text-muted-foreground">
                  Use the job details below as reference while editing
                </p>
              </div>

              {/* Job Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <img 
                      src={job.logo} 
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="mb-1">{job.title}</CardTitle>
                      <CardDescription>{job.company}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  {job.remote && (
                    <Badge variant="secondary">Remote</Badge>
                  )}
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {job.description}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Required Skills */}
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
          </div>

          {/* Right Column - Resume Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="mb-2">Your Tailored Resume</h2>
              <p className="text-sm text-muted-foreground">
                Edit each section manually or use AI to improve it for this specific role
              </p>
            </div>

            <ResumeEditor 
              sections={sections}
              onSectionsChange={setSections}
              jobTitle={job.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
