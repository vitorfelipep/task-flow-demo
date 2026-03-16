'use client';

import { create } from 'zustand';
import type { Task, Project, Label, TaskView } from '@taskflow/shared';

interface TasksState {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  currentView: TaskView;
  selectedProjectId: string | null;
  selectedLabelId: string | null;
  searchQuery: string;
  isLoading: boolean;
  
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  setLabels: (labels: Label[]) => void;
  addLabel: (label: Label) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  removeLabel: (id: string) => void;
  
  setCurrentView: (view: TaskView) => void;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedLabelId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  projects: [],
  labels: [],
  currentView: 'today',
  selectedProjectId: null,
  selectedLabelId: null,
  searchQuery: '',
  isLoading: true,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  removeProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),

  setLabels: (labels) => set({ labels }),
  addLabel: (label) => set((state) => ({ labels: [...state.labels, label] })),
  updateLabel: (id, updates) =>
    set((state) => ({
      labels: state.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
  removeLabel: (id) =>
    set((state) => ({ labels: state.labels.filter((l) => l.id !== id) })),

  setCurrentView: (currentView) => set({ currentView }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setSelectedLabelId: (selectedLabelId) => set({ selectedLabelId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
}));
