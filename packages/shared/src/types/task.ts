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

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  dueTime?: string;
  projectId?: string;
  labelIds?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
  order?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  projectId?: string;
  labelId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export type TaskView = 'today' | 'upcoming' | 'inbox' | 'completed' | 'project' | 'label';
