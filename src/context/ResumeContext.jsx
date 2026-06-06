import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { SAMPLE_RESUME } from "../Data";

const ResumeContext = createContext(null);

const STORAGE_KEY = "resumai:data";

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return SAMPLE_RESUME;
}

export function ResumeProvider({ children }) {
  const [resume, setResume] = useState(loadInitial);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
        setSaved(true);
      } catch {
        /* ignore */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [resume]);

  const update = useCallback((path, value) => {
    setResume((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const setField = useCallback((section, value) => {
    setResume((prev) => ({ ...prev, [section]: value }));
  }, []);

  const resetResume = useCallback(() => setResume(SAMPLE_RESUME), []);

  return (
    <ResumeContext.Provider
      value={{ resume, setResume, update, setField, resetResume, saved }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
}

const uid = () => Math.random().toString(36).slice(2, 9);
export const newId = uid;
