export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type TaskStatus = 'pending' | 'completed';

export interface Label {
  id: string;
  name: string;
  color: string;
  userId: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  userId: string;
  isInbox: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  dueTime?: string;
  projectId: string;
  project?: Project;
  labels: Label[];
  userId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskView = 'today' | 'upcoming' | 'inbox' | 'completed' | 'project' | 'label';

// CreateTaskInput, UpdateTaskInput, and TaskFilters are exported from validations/task.ts
