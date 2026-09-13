export type UserRole = 'developer' | 'tester';

export type TesterTier = 'tier_1_standard' | 'tier_2_verified' | 'tier_3_core';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  testerTier: TesterTier;
  googleId: string;
  joinedDate: string;
  enrolledAppIds: string[];
  reputationScore: number;
  // Developer profile fields
  developerAccountName?: string;
  bio?: string;
  website?: string;
  contactEmail?: string;
  googlePlayConsoleDevId?: string;
  company?: string;
  verifiedDeveloper?: boolean;
  firebaseUid?: string;
  deviceInfo?: {
    model: string;
    osVersion: string;
    manufacturer: string;
  };
}

export type AppCategory = 
  | 'Productivity' 
  | 'Health & Fitness' 
  | 'Tools & Utilities' 
  | 'Games' 
  | 'Finance' 
  | 'Social' 
  | 'Education' 
  | 'Lifestyle';

export interface AppListing {
  id: string;
  developerId: string;
  developerName: string;
  developerAvatar: string;
  name: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  icon: string;
  category: AppCategory;
  shortDescription: string;
  fullDescription: string;
  testingTrackUrl: string; // fallback or general link
  webOptInUrl?: string; // https://play.google.com/apps/testing/<package> (Join on the web)
  androidOptInUrl?: string; // https://play.google.com/store/apps/details?id=<package> (Join on Android)
  googleGroupUrl?: string;
  requiredTier: TesterTier;
  targetTesters: number; // e.g. 20 for Google Play requirement
  currentTesters: number;
  testStartDate: string;
  testDurationDays: number; // default 14
  status: 'active_testing' | 'target_met' | 'completed' | 'paused';
  testingFocus: string[]; // e.g. ["Onboarding flow", "In-app Billing Sandbox", "Android 14 Push Notifications"]
  minAndroidVersion: string;
  screenshots: string[];
  createdAt: string;
  averageRating: number;
  ratingsCount: number;
}

export interface TesterEnrollment {
  id: string;
  appId: string;
  testerId: string;
  testerName: string;
  testerAvatar: string;
  testerEmail: string;
  testerTier: TesterTier;
  enrolledAt: string;
  deviceModel: string;
  osVersion: string;
  daysActive: number;
  lastActiveDate: string;
  dailyCheckins: string[]; // ISO dates
  completedFeedbacks: string[]; // e.g. ['day_1', 'day_3']
}

export type BugSeverity = 'blocker' | 'major' | 'minor' | 'cosmetic';
export type BugStatus = 'open' | 'investigating' | 'fix_in_next_build' | 'resolved' | 'closed';

export interface BugReport {
  id: string;
  appId: string;
  appName: string;
  testerId: string;
  testerName: string;
  testerAvatar: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: BugSeverity;
  status: BugStatus;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  screenshotUrl?: string;
  createdAt: string;
  developerNotes?: string;
}

export interface AutomatedFeedbackSubmission {
  id: string;
  appId: string;
  appName: string;
  testerId: string;
  testerName: string;
  testerTier: TesterTier;
  phase: 'day_1' | 'day_3' | 'day_7' | 'day_14' | 'ad_hoc';
  submittedAt: string;
  stabilityRating: number; // 1-5
  batteryImpactRating: number; // 1-5 (1=none, 5=heavy drain)
  uiIntuitivenessRating: number; // 1-5
  crashEncountered: boolean;
  crashDetails?: string;
  favoriteFeatures: string;
  confusingAreas: string;
  netPromoterScore: number; // 0-10
  deviceModel: string;
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export type FeedbackStatus = 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
export type FeedbackType = 'feature_request' | 'improvement' | 'general_feedback' | 'ux_issue';

export interface FeatureFeedbackItem {
  id: string;
  appId: string;
  appName: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  title: string;
  description: string;
  category: FeedbackType;
  status: FeedbackStatus;
  likes: number;
  likedBy: string[]; // user IDs
  commentsCount: number;
  createdAt: string;
  tags: string[];
}
