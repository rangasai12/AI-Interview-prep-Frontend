export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected" | "saved";

export interface ApplicationRecord {
  id: string;
  company: string;
  role: string;
  location?: string;
  link?: string;
  appliedAt?: string; // ISO date
  nextStepAt?: string; // ISO date
  status: ApplicationStatus;
  notes?: string;
}

const APPS_KEY = "applications";

export function getStoredApplications(): ApplicationRecord[] {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter(Boolean);
  } catch {
    return [];
  }
}

export function setStoredApplications(apps: ApplicationRecord[]) {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

export function upsertApplication(app: ApplicationRecord) {
  const list = getStoredApplications();
  const idx = list.findIndex((a) => a.id === app.id);
  if (idx >= 0) list[idx] = app; else list.unshift(app);
  setStoredApplications(list);
  return list;
}

export function deleteApplication(id: string) {
  const list = getStoredApplications().filter((a) => a.id !== id);
  setStoredApplications(list);
  return list;
}