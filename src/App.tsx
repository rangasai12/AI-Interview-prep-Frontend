import { useState } from "react";
import { Header } from "./components/Header";
import { JobsPage } from "./components/JobsPage";
import { JobDetailPage } from "./components/JobDetailPage";
import { MockInterviewPage } from "./components/MockInterviewPage";
import { LearningPathPage } from "./components/LearningPathPage";
import { ResumePage } from "./components/ResumePage";
import { ProfilePage } from "./components/ProfilePage";
import { TailorResumePage } from "./components/TailorResumePage";
import { ApplicationTrackingPage } from "./components/ApplicationTrackingPage";

type Page = "jobs" | "job-detail" | "mock-interview" | "learning-path" | "resume" | "profile" | "tailor-resume" | "applications";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("jobs");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobData, setSelectedJobData] = useState<any>(null);

  const handleJobClick = (jobId: string, jobData?: any) => {
    setSelectedJobId(jobId);
    setSelectedJobData(jobData);
    setCurrentPage("job-detail");
  };

  const handleStartInterview = (jobId: string, jobData?: any) => {
    setSelectedJobId(jobId);
    setSelectedJobData(jobData);
    setCurrentPage("mock-interview");
  };

  const handleInterviewComplete = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentPage("learning-path");
  };

  const handleBackToJobs = () => {
    setCurrentPage("jobs");
    setSelectedJobId(null);
    setSelectedJobData(null);
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


  const handleGoToApplications = () => {
    setCurrentPage("applications");
  };


  const handleTailorResume = (jobId: string, jobData?: any) => {
    setSelectedJobId(jobId);
    setSelectedJobData(jobData);
    setCurrentPage("tailor-resume");
  };

  return (
    <div className="min-h-screen flex flex-col">

  {currentPage === "jobs" && <Header onProfileClick={handleGoToProfile} onApplicationsClick={handleGoToApplications} />}
      
      <main className="flex-1">
        {currentPage === "jobs" && (
          <JobsPage onJobClick={handleJobClick} />
        )}

        {currentPage === "job-detail" && selectedJobId && (
          <JobDetailPage
            jobId={selectedJobId}
            jobData={selectedJobData}
            onBack={handleBackToJobs}
            onStartInterview={handleStartInterview}
            onTailorResume={handleTailorResume}
          />
        )}

        {currentPage === "mock-interview" && selectedJobId && (
          <MockInterviewPage
            jobId={selectedJobId}
            jobData={selectedJobData}
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
            jobData={selectedJobData}
            onBack={handleBackToJobDetail}
          />
        )}

        {currentPage === "applications" && (
          <ApplicationTrackingPage onBack={handleBackToJobs} />
        )}
      </main>
    </div>
  );
}
