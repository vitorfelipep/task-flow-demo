'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun,
  Calendar,
  Inbox,
  CheckCircle2,
  FolderKanban,
  Tags,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { cn, Button } from '@taskflow/ui';
import { useTasksStore } from '@/stores/tasks-store';
import { AddProjectDialog } from '@/components/projects/add-project-dialog';
import { AddLabelDialog } from '@/components/labels/add-label-dialog';

const mainNavItems = [
  { id: 'today', label: 'Hoje', icon: Sun, href: '/dashboard' },
  { id: 'upcoming', label: 'Próximos', icon: Calendar, href: '/dashboard/upcoming' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, href: '/dashboard/inbox' },
  { id: 'completed', label: 'Concluídas', icon: CheckCircle2, href: '/dashboard/completed' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { projects, labels, setCurrentView } = useTasksStore();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [labelsOpen, setLabelsOpen] = useState(true);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* Main Nav */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setCurrentView(item.id as any)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Projects */}
          <div className="mt-6">
            <button
              onClick={() => setProjectsOpen(!projectsOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <FolderKanban className="h-3.5 w-3.5" />
                Projetos
              </span>
              {projectsOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            {projectsOpen && (
              <div className="mt-1 space-y-1">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/project/${project.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                    {'taskCount' in project && (
                      <span className="ml-auto text-xs">
                        {(project as any).taskCount}
                      </span>
                    )}
                  </Link>
                ))}
                <AddProjectDialog />
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="mt-6">
            <button
              onClick={() => setLabelsOpen(!labelsOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Tags className="h-3.5 w-3.5" />
                Etiquetas
              </span>
              {labelsOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            {labelsOpen && (
              <div className="mt-1 space-y-1">
                {labels.map((label) => (
                  <Link
                    key={label.id}
                    href={`/dashboard/label/${label.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="truncate">{label.name}</span>
                  </Link>
                ))}
                <AddLabelDialog />
              </div>
            )}
          </div>
        </nav>

        {/* Settings */}
        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>
    </aside>
  );
}
