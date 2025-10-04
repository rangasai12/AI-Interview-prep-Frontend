import { useState } from "react";
import { Header } from "./components/Header";
import { JobsPage } from "./components/JobsPage";
import { JobDetailPage } from "./components/JobDetailPage";
import { MockInterviewPage } from "./components/MockInterviewPage";
import { LearningPathPage } from "./components/LearningPathPage";
import { ResumePage } from "./components/ResumePage";
import { ProfilePage } from "./components/ProfilePage";
import { TailorResumePage } from "./components/TailorResumePage";

type Page = "jobs" | "job-detail" | "mock-interview" | "learning-path" | "resume" | "profile" | "tailor-resume";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("jobs");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentPage("job-detail");
  };

  const handleStartInterview = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentPage("mock-interview");
  };

  const handleInterviewComplete = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentPage("learning-path");
  };

  const handleBackToJobs = () => {
    setCurrentPage("jobs");
    setSelectedJobId(null);
  };

  const handleBackToJobDetail = () => {
    setCurrentPage("job-detail");
  };

  const handleRetakeInterview = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentPage("mock-interview");
  };

  const handleGoToProfile = () => {
    setCurrentPage("profile");
  };

  const handleGoToResume = () => {
    setCurrentPage("resume");
  };

  const handleTailorResume = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentPage("tailor-resume");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentPage === "jobs" && <Header onProfileClick={handleGoToProfile} />}
      
      <main className="flex-1">
        {currentPage === "jobs" && (
          <JobsPage onJobClick={handleJobClick} />
        )}
        
        {currentPage === "job-detail" && selectedJobId && (
          <JobDetailPage
            jobId={selectedJobId}
            onBack={handleBackToJobs}
            onStartInterview={handleStartInterview}
            onTailorResume={handleTailorResume}
          />
        )}
        
        {currentPage === "mock-interview" && selectedJobId && (
          <MockInterviewPage
            jobId={selectedJobId}
            onBack={handleBackToJobDetail}
            onComplete={handleInterviewComplete}
          />
        )}
        
        {currentPage === "learning-path" && selectedJobId && (
          <LearningPathPage
            jobId={selectedJobId}
            onBack={handleBackToJobDetail}
            onRetakeInterview={handleRetakeInterview}
          />
        )}

        {currentPage === "profile" && (
          <ProfilePage 
            onBack={handleBackToJobs} 
            onEditResume={handleGoToResume}
          />
        )}

        {currentPage === "resume" && (
          <ResumePage onBack={handleGoToProfile} />
        )}

        {currentPage === "tailor-resume" && selectedJobId && (
          <TailorResumePage
            jobId={selectedJobId}
            onBack={handleBackToJobDetail}
          />
        )}
      </main>
    </div>
  );
}
