import { useState } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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
}

interface JobsPageProps {
  onJobClick: (jobId: string) => void;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc",
    logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop",
    location: "San Francisco, CA",
    remote: true,
    skills: ["React", "TypeScript", "Tailwind CSS"],
    description: "Build next-generation web applications with our innovative team.",
    matchScore: 92
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    location: "New York, NY",
    remote: false,
    skills: ["Node.js", "React", "PostgreSQL"],
    description: "Join a fast-growing startup revolutionizing the finance industry.",
    matchScore: 85
  },
  {
    id: "3",
    title: "React Developer",
    company: "Digital Solutions",
    logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&fit=crop",
    location: "Austin, TX",
    remote: true,
    skills: ["React", "JavaScript", "Redux"],
    description: "Create beautiful user interfaces for enterprise clients.",
    matchScore: 88
  },
  {
    id: "4",
    title: "Frontend Architect",
    company: "MegaCorp",
    logo: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop",
    location: "Seattle, WA",
    remote: true,
    skills: ["React", "Vue.js", "Web Performance"],
    description: "Lead frontend architecture decisions for global products.",
    matchScore: 78
  },
  {
    id: "5",
    title: "UI Engineer",
    company: "DesignHub",
    logo: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=100&h=100&fit=crop",
    location: "Los Angeles, CA",
    remote: false,
    skills: ["React", "CSS", "Figma"],
    description: "Bridge the gap between design and development.",
    matchScore: 81
  },
  {
    id: "6",
    title: "JavaScript Developer",
    company: "WebWorks",
    logo: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=100&h=100&fit=crop",
    location: "Boston, MA",
    remote: true,
    skills: ["JavaScript", "React", "Node.js"],
    description: "Build scalable web applications for diverse clients.",
    matchScore: 75
  }
];

export function JobsPage({ onJobClick }: JobsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [remoteFilter, setRemoteFilter] = useState("all");
  
  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRemote = remoteFilter === "all" || 
                         (remoteFilter === "remote" && job.remote) ||
                         (remoteFilter === "onsite" && !job.remote);
    return matchesSearch && matchesRemote;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by job title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={remoteFilter} onValueChange={setRemoteFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Work Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="remote">Remote Only</SelectItem>
              <SelectItem value="onsite">On-site Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-muted-foreground">
        {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start gap-4 mb-2">
                <img 
                  src={job.logo} 
                  alt={job.company}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <CardTitle className="mb-1 truncate">{job.title}</CardTitle>
                  <CardDescription className="truncate">{job.company}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{job.location}</span>
                {job.remote && (
                  <Badge variant="secondary" className="ml-auto">Remote</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 3).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Match: </span>
                  <span className={job.matchScore >= 85 ? "text-green-600" : "text-orange-600"}>
                    {job.matchScore}%
                  </span>
                </div>
                <Button onClick={() => onJobClick(job.id)} size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
