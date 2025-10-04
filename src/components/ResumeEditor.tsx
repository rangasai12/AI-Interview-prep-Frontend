import { useState } from "react";
import { Sparkles, Edit, Save, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export interface ResumeSection {
  id: string;
  title: string;
  content: string;
  aiSuggestion?: string;
}

interface ResumeEditorProps {
  sections: ResumeSection[];
  onSectionsChange: (sections: ResumeSection[]) => void;
  jobTitle?: string; // Optional - used to tailor AI suggestions for specific job
}

export function ResumeEditor({ sections, onSectionsChange, jobTitle }: ResumeEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [currentAiSection, setCurrentAiSection] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleEdit = (sectionId: string, content: string) => {
    setEditingSection(sectionId);
    setEditContent(content);
  };

  const handleSave = (sectionId: string) => {
    onSectionsChange(
      sections.map(section =>
        section.id === sectionId
          ? { ...section, content: editContent }
          : section
      )
    );
    setEditingSection(null);
    setEditContent("");
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditContent("");
  };

  const handleAiImprove = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setCurrentAiSection(sectionId);
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const improvements: Record<string, string> = {
        summary: jobTitle 
          ? `Results-driven Software Engineer with 5+ years of expertise in full-stack web development, perfectly aligned for the ${jobTitle} role. Proven track record of building scalable applications serving 1M+ users. Specialized in React, TypeScript, and modern web technologies with a passion for creating intuitive, high-performance user experiences that match the requirements of this position.`
          : "Results-driven Software Engineer with 5+ years of expertise in full-stack web development. Proven track record of building scalable applications serving 1M+ users. Specialized in React, TypeScript, and modern web technologies with a passion for creating intuitive, high-performance user experiences.",
        experience: jobTitle
          ? `Senior Software Engineer | TechCo | 2020-Present\n• Architected and developed 15+ responsive web applications using React and TypeScript, improving user engagement by 40% - directly relevant to ${jobTitle} requirements\n• Led cross-functional agile teams of 5-8 members to deliver mission-critical features on schedule\n• Implemented reusable UI component library reducing development time by 30%\n• Mentored 3 junior developers and established coding best practices\n• Delivered features matching the tech stack and requirements for ${jobTitle} positions`
          : "Senior Software Engineer | TechCo | 2020-Present\n• Architected and developed 15+ responsive web applications using React and TypeScript, improving user engagement by 40%\n• Led cross-functional agile teams of 5-8 members to deliver mission-critical features on schedule\n• Implemented reusable UI component library reducing development time by 30%\n• Mentored 3 junior developers and established coding best practices",
        skills: "Frontend: React (Expert), TypeScript (Advanced), Next.js, Redux, Tailwind CSS\nBackend: Node.js, Express, REST APIs\nTools & Other: Git, CI/CD, Testing (Jest, RTL), Agile/Scrum, Web Performance Optimization",
        education: "Bachelor of Science in Computer Science | GPA: 3.8/4.0\nUniversity of Technology | 2015-2019\nRelevant Coursework: Data Structures, Algorithms, Web Development, Database Systems"
      };

      onSectionsChange(
        sections.map(section =>
          section.id === sectionId
            ? { ...section, aiSuggestion: improvements[sectionId] || section.content }
            : section
        )
      );
      setIsGenerating(false);
      setAiDialogOpen(true);
    }, 2000);
  };

  const handleAcceptAiSuggestion = () => {
    if (!currentAiSection) return;
    
    onSectionsChange(
      sections.map(section =>
        section.id === currentAiSection && section.aiSuggestion
          ? { ...section, content: section.aiSuggestion, aiSuggestion: undefined }
          : section
      )
    );
    setAiDialogOpen(false);
    setCurrentAiSection(null);
  };

  const handleRejectAiSuggestion = () => {
    if (!currentAiSection) return;
    
    onSectionsChange(
      sections.map(section =>
        section.id === currentAiSection
          ? { ...section, aiSuggestion: undefined }
          : section
      )
    );
    setAiDialogOpen(false);
    setCurrentAiSection(null);
  };

  const currentAiSuggestion = currentAiSection
    ? sections.find(s => s.id === currentAiSection)?.aiSuggestion
    : null;
  const currentOriginalContent = currentAiSection
    ? sections.find(s => s.id === currentAiSection)?.content
    : null;

  return (
    <>
      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{section.title}</CardTitle>
                <div className="flex gap-2">
                  {editingSection === section.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(section.id)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(section.id, section.content)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAiImprove(section.id)}
                        disabled={isGenerating && currentAiSection === section.id}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isGenerating && currentAiSection === section.id
                          ? "Generating..."
                          : "AI Improve"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingSection === section.id ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              ) : (
                <div className="whitespace-pre-line text-muted-foreground">
                  {section.content}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add Section */}
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Add New Section
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestion Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>AI Improvement Suggestion</DialogTitle>
            <DialogDescription>
              {jobTitle 
                ? `AI-tailored improvement for ${jobTitle} position`
                : "Review the AI-generated improvement and decide whether to accept it"
              }
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="comparison" className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Side by Side</TabsTrigger>
              <TabsTrigger value="original">Original</TabsTrigger>
              <TabsTrigger value="improved">AI Improved</TabsTrigger>
            </TabsList>
            <TabsContent value="comparison" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Original</Label>
                  <div className="bg-muted rounded-lg p-4 min-h-[200px] whitespace-pre-line text-sm">
                    {currentOriginalContent}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">AI Improved</Label>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-h-[200px] whitespace-pre-line text-sm">
                    {currentAiSuggestion}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="original">
              <div className="bg-muted rounded-lg p-4 min-h-[300px] whitespace-pre-line">
                {currentOriginalContent}
              </div>
            </TabsContent>
            <TabsContent value="improved">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-h-[300px] whitespace-pre-line">
                {currentAiSuggestion}
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAcceptAiSuggestion} className="flex-1">
              Accept AI Version
            </Button>
            <Button variant="outline" onClick={handleRejectAiSuggestion} className="flex-1">
              Keep Original
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
