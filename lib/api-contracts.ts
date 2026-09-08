import type { Priority, ReportStatus, TaskSection, TaskStatus, TaskTypeCode, UserRole } from '@/types';
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
}
export interface ApiProject {
  id: number;
  name: string;
  description: string | null;
  members: ApiUser[];
}
export interface ApiTask {
  id: number;
  project_id: number;
  section: TaskSection;
  task_type: TaskTypeCode;
  name: string;
  priority: Priority | null;
  planned_percent: number | null;
  actual_percent: number | null;
  status: TaskStatus | null;
  planned_hours: number | string | null;
  spent_hours: number | string | null;
  output: string | null;
}
export interface ApiBlocker {
  id: number;
  title: string;
  description: string | null;
  status: 'OPEN' | 'RESOLVED';
  is_key_issue: boolean;
}
export interface ApiAchievement {
  id: number;
  title: string;
  description: string | null;
  is_key_achievement: boolean;
}
export interface ApiReview {
  id: number;
  report_version_id: number;
  reviewer_id: number;
  action: 'APPROVE' | 'REQUEST_CHANGES';
  comment: string | null;
  created_at: string;
}
export interface ApiVersion {
  id: number;
  version_number: number;
  notes: string | null;
  submitted_at: string | null;
  tasks: ApiTask[];
  blockers: ApiBlocker[];
  achievements: ApiAchievement[];
  reviews?: ApiReview[];
}
export interface ApiReportSummary {
  id: number;
  user_id: number;
  week_start: string;
  week_end: string;
  due_at: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}
export interface ApiReport extends ApiReportSummary {
  current_version: ApiVersion;
  latest_review: ApiReview | null;
}
export interface ApiReportPage {
  page: number;
  page_size: number;
  total: number;
  items: ApiReportSummary[];
}
export interface ApiSummary {
  total_reports: number;
  draft_reports: number;
  submitted_reports: number;
  needs_correction_reports: number;
  approved_reports: number;
  total_spent_hours: number;
}
export interface ApiActivity {
  activity_type: 'REPORT_SUBMITTED' | 'CHANGES_REQUESTED' | 'REPORT_APPROVED';
  message: string;
  report_id: number;
  version_number: number;
  user_id: number;
  user_name: string;
  reviewer_id: number | null;
  reviewer_name: string | null;
  week_start: string;
  created_at: string;
}
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export type ApiAIChatRole = 'user' | 'assistant';
export interface ApiAIChatMessage {
  role: ApiAIChatRole;
  content: string;
}
export interface ApiAIChatResponse {
  answer: string;
  reports_used: number;
  period_start: string;
  period_end: string;
}
