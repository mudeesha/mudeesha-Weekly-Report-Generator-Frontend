/** UI models. The API transport types live in lib/api/contracts.ts. */
export type UserRole = 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_CORRECTION' | 'APPROVED';
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskSection = 'THIS_WEEK' | 'NEXT_WEEK';
export type TaskTypeCode = 'DEVELOPMENT' | 'TESTING' | 'MEETINGS' | 'DOCUMENTATION' | 'SUPPORT' | 'RESEARCH' | 'OTHER';
export type TaskType = 'Development' | 'Testing' | 'Meetings' | 'Documentation' | 'Support' | 'Research' | 'Other';
export const TASK_TYPES: TaskType[] = ['Development', 'Testing', 'Meetings', 'Documentation', 'Support', 'Research', 'Other'];
export const TASK_TYPE_LABELS: Record<TaskTypeCode, TaskType> = { DEVELOPMENT: 'Development', TESTING: 'Testing', MEETINGS: 'Meetings', DOCUMENTATION: 'Documentation', SUPPORT: 'Support', RESEARCH: 'Research', OTHER: 'Other' };
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  projectIds: string[];
  avatar?: string;
}
export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}
export interface Project {
  id: string;
  name: string;
  description: string | null;
  members: ProjectMember[];
}
export interface ProjectInput {
  name: string;
  description: string | null;
}
export interface ReportTask {
  id: string;
  projectId: string;
  section: TaskSection;
  taskType: TaskTypeCode;
  name: string;
  priority: Priority | null;
  plannedPercent: number | null;
  actualPercent: number | null;
  status: TaskStatus | null;
  plannedHours: number | null;
  spentHours: number | null;
  output: string | null;
}
export interface ReportBlocker {
  id: string;
  title: string;
  description: string | null;
  status: 'OPEN' | 'RESOLVED';
  isKeyIssue: boolean;
}
export interface ReportAchievement {
  id: string;
  title: string;
  description: string | null;
  isKeyAchievement: boolean;
}
export interface ReviewComment {
  id: string;
  reportVersionId: string;
  reviewerId: string;
  action: 'APPROVE' | 'REQUEST_CHANGES';
  comment: string | null;
  createdAt: string;
}
export interface ReportListItem {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  dueAt: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  weekNumber: number;
  year: number;
}
export interface ReportVersion {
  id: string;
  versionNumber: number;
  notes: string | null;
  submittedAt: string | null;
  tasks: ReportTask[];
  blockers: ReportBlocker[];
  achievements: ReportAchievement[];
  reviews: ReviewComment[];
}
export interface WeeklyReport extends ReportListItem {
  currentVersion: ReportVersion;
  latestReview: ReviewComment | null;
}
export interface ReportDraft {
  weekStart: string;
  notes: string | null;
  tasks: ReportTask[];
  blockers: ReportBlocker[];
  achievements: ReportAchievement[];
}
export interface ReportFilters {
  userId?: string;
  projectId?: string;
  status?: ReportStatus | 'ALL';
  from?: string;
  to?: string;
}
export interface ReportPage {
  page: number;
  pageSize: number;
  total: number;
  items: ReportListItem[];
}
export interface Activity {
  id: string;
  activityType: 'REPORT_SUBMITTED' | 'CHANGES_REQUESTED' | 'REPORT_APPROVED';
  message: string;
  reportId: string;
  versionNumber: number;
  userId: string;
  userName: string;
  reviewerId: string | null;
  reviewerName: string | null;
  weekStart: string;
  createdAt: string;
}
export interface SummaryCounts {
  totalReports: number;
  draftReports: number;
  submittedReports: number;
  needsCorrectionReports: number;
  approvedReports: number;
  totalSpentHours: number;
}
export interface TrendPoint {
  label: string;
  submitted: number;
  approved: number;
  expected: number;
}
export interface MemberStatusPoint {
  member: string;

  // Main reporting states
  submitted: number;
  draft: number;
  notSubmitted: number;

  // Breakdown of submitted reports
  approved: number;
  needsCorrection: number;
  awaitingReview: number;
}
export interface WorkloadPoint {
  project: string;
  tasks: number;
  hours: number;
}
export interface TimePoint {
  type: TaskType;
  hours: number;
}
export interface AnalyticsData {
  totalReports: number;
  submitted: number;
  approved: number;
  needsCorrection: number;
  openBlockers: number;
  totalHours: number;
  versionCount: number;
  correctionCycles: number;
  completedTrend: {
    label: string;
    completed: number;
  }[];
  approvalRate: number;
  avgTaskCompletion: number;
  submissionTrend: TrendPoint[];
  completionTrend: {
    label: string;
    planned: number;
    actual: number;
  }[];
  statusByMember: MemberStatusPoint[];
  workloadByProject: WorkloadPoint[];
  timeByTaskType: TimePoint[];
  memberRows: {
    userId: string;
    name: string;
    reports: number;
    approved: number;
    corrections: number;
    hours: number;
  }[];
  drafts: number;
  pendingReview: number;
  completedTasks: number;
  activeMembers: number;
  reportingMembers: number;
  coverage: number | null;
  onTime: number;
  late: number;
  pending: number;
  overdue: number;
  notStarted: number;
  recentReports: ReportListItem[];
  details: WeeklyReport[];
  activities: Activity[];
}
