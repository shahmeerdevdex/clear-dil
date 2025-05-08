export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
  "not-before-policy": number;
  session_state: string;
  user_id?: string;
}

export interface Link {
  rel: string;
  href: string;
}

export interface BPMN {
  title: string;
  description: string;
  version: string;
  created_by: string;
  created_at: string;
  workspace_id: string;
  links: Link[];
  id: string;
}

export interface Project {
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  members: string[];
  bpmn: BPMN;
  workspace_id: string;
  links: Link[];
  id: string;
  icon?: {
    filename: string;
    content_type: string;
    content: string;
  };
  bpmn_id?: string;
}

export interface Workspace {
  title: string;
  description: string;
  created_by: string;
  members: string[];
  created_at: string;
  links: Link[];
  id: string;
  icon?: {
    filename: string;
    content_type: string;
    content: string;
  };
}

export interface CaseListResponse {
  content: Case[];
  total_pages: number;
  total_elements: number;
  last: boolean;
  number_of_elements: number;
  first: boolean;
  size: number;
  number: number;
}

export enum CaseStatus {
  UNDER_EXAMINATION = "UNDER_EXAMINATION",
  CLOSED = "CLOSED",
  INITIATED = "INITIATED",
  REVIEW_REQUESTED = "REVIEW_REQUESTED",
}

export enum CasePriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface Case {
  id: string;
  title: string;
  summary: string;
  auto_generated: boolean;
  created_at: string;
  updated_at: string;
  case_type: string;
  priority: CasePriority;
  status: CaseStatus;
  project_id: string;
  workspace_id: string;
  links: Link[];
  assignee_id?: string;
  examiner_id?: string;
  reviewer_id?: string;
  request_close?: boolean;
  approval_required?: boolean;
  close?: boolean;
  concerned_customer_ids: string[];
  concerned_transcation_ids: string[];
}

interface ActivityAction {
  id: string;
  created_at: string;
  action: string;
  created_by: string;
  details: string;
  assignee: string;
}

export interface Activity {
  activity_id: string;
  activity_name: string;
  activity_type: string;
  created_at: string;
  completed_at: string;
  duration_in_millis: number;
  id: string;
  created_by?: string;
  completed_by?: string;
  actions?: ActivityAction[];
}

export interface Attachment {
  id: string;
  file_name: string;
  content_type: string;
  title: string;
  description: string;
  attached_at: string; // ISO datetime
  attached_by_id: string;
  aml_case_id: string;
}

export interface Comment {
  id: string;
  body: string;
  commented_at: string; // ISO datetime
  aml_case_id: string;
  commented_by_id: string;
  children_comments: Comment[]; // recursive structure
  attachments: Attachment[]; // if using the Attachment interface from before
}

export interface Member {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface CreateMember extends Member {
  password: string;
  login_url: string;
  send_password_reset_mail: true;
}

export enum MemberRoleEnum {
  ViewOnly = "ViewOnly",
  Admin = "Admin",
  Analyst = "Analyst",
  Developer = "Developer",
  Support = "Support",
  SuperAdmin = "SuperAdmin",
}

export interface MemberRole {
  id: string;
  name: MemberRoleEnum;
  description: string;
}

export interface UserInfoProfile {
  id: string;
  credit: number;
  prepaid_dv: number;
  authorities: string[];
  client_id: string;
}
