import type { ResumeSection } from "../components/ResumeEditor";

const SECTIONS_KEY = "resumeSections";
const PROFILE_KEY = "profile";

export function getStoredResumeSections(): ResumeSection[] | null {
  try {
    const raw = localStorage.getItem(SECTIONS_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    return arr.filter(Boolean);
  } catch {
    return null;
  }
}

export function setStoredResumeSections(sections: ResumeSection[]) {
  try {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
  } catch {
    // ignore
  }
}

export function getStoredProfile(): any | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
