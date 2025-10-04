import { useState, useRef } from "react";
import { ArrowLeft, Upload, Download, FileUp } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ResumeEditor, ResumeSection } from "./ResumeEditor";

interface ResumePageProps {
  onBack: () => void;
}

const initialResume: ResumeSection[] = [
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

export function ResumePage({ onBack }: ResumePageProps) {
  const [resumeSections, setResumeSections] = useState<ResumeSection[]>(initialResume);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadText(content);
    };
    reader.readAsText(file);
  };

  const handleUploadResume = () => {
    if (!uploadText.trim()) return;

    // Simple parsing - in real app, would parse structured resume
    const sections = uploadText.split('\n\n').filter(s => s.trim());
    if (sections.length > 0) {
      setResumeSections([
        {
          id: "imported",
          title: "Imported Resume",
          content: uploadText
        }
      ]);
    }
    setUploadDialogOpen(false);
    setUploadText("");
    setUploadedFileName("");
  };

  const handleDownload = () => {
    const resumeText = resumeSections
      .map(section => `${section.title.toUpperCase()}\n${section.content}`)
      .join('\n\n');
    
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.txt';
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
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">My Resume</h1>
          <p className="text-muted-foreground">
            Edit your resume manually or let AI improve it for you
          </p>
        </div>

        {/* Resume Editor */}
        <ResumeEditor 
          sections={resumeSections}
          onSectionsChange={setResumeSections}
        />
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload a file or paste your resume text below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <Label>Upload from File</Label>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  {uploadedFileName || "Choose File"}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or paste text
                </span>
              </div>
            </div>

            {/* Text Paste */}
            <div>
              <Label htmlFor="resume-upload">Resume Content</Label>
              <Textarea
                id="resume-upload"
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                className="min-h-[300px] mt-2 font-mono text-sm"
                placeholder="Paste your resume content here..."
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleUploadResume} 
                className="flex-1"
                disabled={!uploadText.trim()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Resume
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadDialogOpen(false);
                  setUploadText("");
                  setUploadedFileName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
