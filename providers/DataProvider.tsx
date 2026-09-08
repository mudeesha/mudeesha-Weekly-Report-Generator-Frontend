'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import * as projectsApi from '@/services/project.service';
import * as usersApi from '@/services/user.service';
import { getAllReportSummaries } from '@/services/report.service';
import { getActivities } from '@/services/dashboard.service';
import { errorMessage } from '@/lib/api-client';
import type { Activity, Project, ProjectInput, ReportListItem, User, UserRole } from '@/types';
interface DataContextValue {
  reports: ReportListItem[];
  projects: Project[];
  users: User[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  revision: number;
  reload: () => Promise<void>;
  createProject: (data: ProjectInput) => Promise<void>;
  updateProject: (id: string, data: ProjectInput) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  assignMembers: (id: string, userIds: string[]) => Promise<void>;
  changeUserRole: (id: string, role: UserRole) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
  getProjectById: (id: string) => Project | undefined;
}
const DataContext = createContext<DataContextValue | null>(null);
export function DataProvider({ children }: {
  children: ReactNode;
}) {
  const { user, isManager, refreshUser } = useAuth();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const running = useRef<AbortController | null>(null);
  const reload = useCallback(async () => {
    running.current?.abort();
    const controller = new AbortController();
    running.current = controller;
    if (!user) {
      setReports([]);
      setProjects([]);
      setUsers([]);
      setActivities([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [r, p, u, a] = await Promise.all([
        getAllReportSummaries({}, controller.signal), projectsApi.getProjects(controller.signal),
        isManager ? usersApi.getUsers(controller.signal) : Promise.resolve([user]),
        isManager ? getActivities(10, {}, controller.signal) : Promise.resolve([]),
      ]);
      if (controller.signal.aborted)
        return;
      setReports(r);
      setProjects(p);
      setActivities(a);
      setUsers(u.map(item => ({ ...item, projectIds: p.filter(project => project.members.some(member => member.userId === item.id)).map(project => project.id) })));
      setRevision(value => value + 1);
    }
    catch (e) {
      if (!controller.signal.aborted)
        setError(errorMessage(e));
    }
    finally {
      if (!controller.signal.aborted)
        setLoading(false);
    }
  }, [user, isManager]);
  useEffect(() => { void reload(); return () => running.current?.abort(); }, [reload]);
  const createProject = useCallback(async (data: ProjectInput) => { await projectsApi.createProject(data); await reload(); }, [reload]);
  const updateProject = useCallback(async (id: string, data: ProjectInput) => { await projectsApi.updateProject(id, data); await reload(); }, [reload]);
  const deleteProject = useCallback(async (id: string) => { await projectsApi.deleteProject(id); await reload(); }, [reload]);
  const assignMembers = useCallback(async (id: string, ids: string[]) => { await projectsApi.assignProjectMembers(id, ids); await reload(); }, [reload]);
  const changeUserRole = useCallback(async (id: string, role: UserRole) => { await usersApi.updateUserRole(id, role); await refreshUser(); await reload(); }, [reload, refreshUser]);
  const deactivateUser = useCallback(async (id: string) => { await usersApi.deactivateUser(id); await reload(); }, [reload]);
  const value = useMemo<DataContextValue>(() => ({ reports, projects, users, activities, loading, error, revision, reload, createProject, updateProject, deleteProject, assignMembers, changeUserRole, deactivateUser, getUserById: id => users.find(u => u.id === id), getProjectById: id => projects.find(p => p.id === id) }), [reports, projects, users, activities, loading, error, revision, reload, createProject, updateProject, deleteProject, assignMembers, changeUserRole, deactivateUser]);
  return <DataContext.Provider value={value}>
    {children}
  </DataContext.Provider>;
}
export function useData(): DataContextValue {
  const value = useContext(DataContext); if (!value)
    throw new Error('useData must be used inside DataProvider'); return value;
}
