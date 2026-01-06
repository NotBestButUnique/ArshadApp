export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completedAt?: string; // Track when the task was finished
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'weekly';
  groupId: string;
  completed: boolean;
  assignee?: string; // Employee ID
  priority: 'low' | 'medium' | 'high';
  subtasks?: Task[]; // Recursive Task structure
  isExpanded?: boolean; // UI state for expansion
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  role: string;
  initials: string;
  color: string;
  status?: 'active' | 'pending'; // 'active' = registered, 'pending' = invited
}

export interface Group {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  color: string;
  description?: string;
  memberIds: string[];
  defaultDueDay?: number; // 1-31
  isRecurring?: boolean; // Is this month-to-month compliance work?
  isRestricted?: boolean; // Only visible to admins
  mutedBy?: string[]; // Array of Employee IDs who muted this group
}

export interface ChatGroup {
  id: string;
  name: string;
  type: 'work' | 'social';
  color: string;
  memberIds: string[];
  mutedBy?: string[]; // Array of Employee IDs who muted this group
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  groupId: string; 
  image?: string;
  replyTo?: { id: string; text: string; senderName: string };
  isForwarded?: boolean;
  readBy?: string[];
}

export enum ViewState {
  LOGIN = 'LOGIN',
  APP = 'APP'
}