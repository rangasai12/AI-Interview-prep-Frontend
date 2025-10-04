import { useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Download, FileText, FileUp, Loader2, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ResumeEditor, ResumeSection } from "./ResumeEditor";
import { parseResumeWithGemini } from "../lib/resumeParser";

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
    content: "Software Engineer at TechCo (2020-Present)\n- Built responsive web applications using React and TypeScript\n- Collaborated with cross-functional teams to deliver features\n- Implemented UI components following design specifications"
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUploadState = () => {
    setUploadText("");
    setUploadedFileName("");
    setUploadedFile(null);
    setParseError(null);
    const input = fileInputRef.current;
    if (input) {
      input.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadedFile(file);
    setUploadedFileName(file.name);
    setParseError(null);

    if (file.type.startsWith("text/") || file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setUploadText(content);
        }
      };
      reader.readAsText(file);
    } else {
      setUploadText("");
    }
  };

  const handleUploadResume = async () => {
    if (!uploadedFile && !uploadText.trim()) {
      setParseError("Upload a file or paste your resume text before submitting.");
      return;
    }

    setIsSubmitting(true);
    setParseError(null);

    try {
      const { sections } = await parseResumeWithGemini({
        file: uploadedFile ?? undefined,
        text: uploadText.trim() ? uploadText : undefined,
      });

      if (!sections.length) {
        throw new Error("The AI parser did not return any resume sections.");
      }

      setResumeSections(sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
      })));

      setUploadDialogOpen(false);
      resetUploadState();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to parse resume. Please try again.";
      setParseError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    const resumeText = resumeSections
      .map(section => `${section.title.toUpperCase()}\n${section.content}`)
      .join("\n\n");

    const blob = new Blob([resumeText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSubmitDisabled = isSubmitting || (!uploadedFile && !uploadText.trim());

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
      <Dialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
            resetUploadState();
          }
        }}
      >
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

            {parseError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{parseError}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUploadResume}
                className="flex-1"
                disabled={isSubmitDisabled}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Resume
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  resetUploadState();
                }}
                disabled={isSubmitting}
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

