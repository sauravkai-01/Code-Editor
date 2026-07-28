import type { Project } from '../types';

const STORAGE_KEY = 'codeflow-recent';

export interface RecentProject {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: number;
  snapshot: Project;
}

export function getRecentProjects(): RecentProject[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveRecentProject(project: Project) {
  const recent = getRecentProjects().filter((p) => p.id !== project.id);
  recent.unshift({
    id: project.id,
    name: project.name,
    fileCount: project.files.length,
    updatedAt: Date.now(),
    snapshot: project,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 8)));
}
