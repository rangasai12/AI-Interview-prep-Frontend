import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Link as LinkIcon, Building2, MapPin, CalendarDays, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { ApplicationRecord, ApplicationStatus, deleteApplication, getStoredApplications, upsertApplication } from "../lib/applicationsStore";

interface ApplicationTrackingPageProps {
  onBack: () => void;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "bg-blue-600",
  interview: "bg-amber-600",
  offer: "bg-emerald-600",
  rejected: "bg-rose-600",
  saved: "bg-slate-600",
};

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36).slice(4);
}

export function ApplicationTrackingPage({ onBack }: ApplicationTrackingPageProps) {
  const [apps, setApps] = useState<ApplicationRecord[]>(() => getStoredApplications());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApplicationRecord | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

  useEffect(() => {
    // Keep in sync in case other tabs modify storage
    const onStorage = (e: StorageEvent) => {
      if (e.key === "applications") {
        setApps(getStoredApplications());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return apps;
    return apps.filter((a) => a.status === filter);
  }, [apps, filter]);

  const openCreate = () => {
    setEditing({
      id: uuid(),
      company: "",
      role: "",
      status: "saved",
    });
    setDialogOpen(true);
  };

  const openEdit = (app: ApplicationRecord) => {
    setEditing({ ...app });
    setDialogOpen(true);
  };

  const saveEditing = () => {
    if (!editing) return;
    if (!editing.company.trim() || !editing.role.trim()) {
      alert("Company and Role are required.");
      return;
    }
    const next = upsertApplication({ ...editing });
    setApps(next);
    setDialogOpen(false);
    setEditing(null);
  };

  const removeApp = (id: string) => {
    if (!confirm("Delete this application?")) return;
    const next = deleteApplication(id);
    setApps(next);
  };

  const statusBadge = (s: ApplicationStatus) => (
    <Badge className={`${STATUS_COLORS[s]} text-white`}>{s}</Badge>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No applications yet. Click "Add Application" to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="whitespace-normal break-words">
                      {app.role} <span className="text-muted-foreground">@ {app.company}</span>
                    </CardTitle>
                    {statusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {app.location && (
                      <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.location}</span>
                    )}
                    {app.appliedAt && (
                      <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                    )}
                    {app.nextStepAt && (
                      <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Next step {new Date(app.nextStepAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {app.notes && (
                    <p className="text-sm whitespace-pre-line">{app.notes}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(app)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeApp(app.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </div>
                    {app.link && (
                      <a href={app.link} target="_blank" rel="noreferrer" className="text-primary text-sm inline-flex items-center gap-1">
                        <LinkIcon className="w-4 h-4" /> Job Link
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing && editing.company ? "Edit Application" : "Add Application"}</DialogTitle>
            <DialogDescription>
              Track roles you are targeting and their status.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-6">
              {/* Job details */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Job details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Company</Label>
                    <Input autoFocus value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} placeholder="Acme Corp" className="mt-2" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Role</Label>
                    <Input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="Frontend Engineer" className="mt-2" />
                  </div>
                </div>
              </div>

              {/* Additional info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Additional info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</Label>
                    <Input value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Remote / City, State" className="mt-2" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Link</Label>
                    <Input value={editing.link || ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} placeholder="https://company.com/careers/role" className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">Paste the full job posting URL</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Applied At</Label>
                    <Input type="date" value={editing.appliedAt ? editing.appliedAt.slice(0,10) : ""} onChange={(e) => setEditing({ ...editing, appliedAt: e.target.value })} className="mt-2" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Next Step</Label>
                    <Input type="date" value={editing.nextStepAt ? editing.nextStepAt.slice(0,10) : ""} onChange={(e) => setEditing({ ...editing, nextStepAt: e.target.value })} className="mt-2" />
                  </div>
                </div>
              </div>

              {/* Status & notes */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Status & notes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                      <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as ApplicationStatus })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saved">Saved</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      {statusBadge(editing.status)}
                    </div>
                  </div>
                  <div className="md:col-span-1 md:col-start-1 md:row-start-2 md:col-end-3">
                    <Label>Notes</Label>
                    <Textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="min-h-[120px] mt-2" placeholder="Quick notes, contacts, interviewers, next actions, etc." />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveEditing} disabled={!editing.company.trim() || !editing.role.trim()}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
