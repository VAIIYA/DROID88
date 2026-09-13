'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  AppListing, 
  BugReport, 
  FeatureFeedbackItem, 
  FeedbackComment, 
  AutomatedFeedbackSubmission, 
  TesterEnrollment,
  UserRole,
  TesterTier,
  BugStatus,
  FeedbackStatus
} from '../types';
import { 
  INITIAL_CURRENT_USER, 
  AVAILABLE_USERS, 
  INITIAL_APPS, 
  INITIAL_BUG_REPORTS, 
  INITIAL_FEATURE_FEEDBACK, 
  INITIAL_COMMENTS, 
  INITIAL_AUTOMATED_FEEDBACKS 
} from '../data/mockData';
import { supabase } from '../lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  apps: AppListing[];
  bugReports: BugReport[];
  featureFeedbacks: FeatureFeedbackItem[];
  comments: FeedbackComment[];
  automatedFeedbacks: AutomatedFeedbackSubmission[];
  enrollments: TesterEnrollment[];
  supabaseUser: SupabaseUser | null;
  isSupabaseLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  switchUser: (userId: string) => void;
  loginWithGoogle: (email: string, name: string, role: UserRole, testerTier: TesterTier, developerAccountName?: string) => void;
  signInWithSupabaseGoogle: () => Promise<void>;
  signInWithSupabaseGithub: () => Promise<void>;
  signOutFromSupabase: () => Promise<void>;
  uploadFileToStorage: (bucket: 'app-icons' | 'bug-screenshots', file: File) => Promise<string | null>;
  updateDeveloperProfile: (profileData: Partial<User>) => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  updateTesterTier: (tier: TesterTier) => void;
  publishApp: (appData: Omit<AppListing, 'id' | 'developerId' | 'developerName' | 'developerAvatar' | 'currentTesters' | 'createdAt' | 'averageRating' | 'ratingsCount' | 'status'>) => Promise<AppListing>;
  enrollInApp: (appId: string, deviceModel: string, osVersion: string) => Promise<void>;
  unenrollFromApp: (appId: string) => Promise<void>;
  performDailyCheckin: (appId: string) => Promise<boolean>;
  reportBug: (bugData: Omit<BugReport, 'id' | 'testerId' | 'testerName' | 'testerAvatar' | 'createdAt' | 'status'>) => Promise<BugReport>;
  updateBugStatus: (bugId: string, status: BugStatus, notes?: string) => Promise<void>;
  submitAutomatedFeedback: (feedback: Omit<AutomatedFeedbackSubmission, 'id' | 'testerId' | 'testerName' | 'testerTier' | 'submittedAt'>) => Promise<AutomatedFeedbackSubmission>;
  createFeatureFeedback: (data: Omit<FeatureFeedbackItem, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'authorRole' | 'likes' | 'likedBy' | 'commentsCount' | 'createdAt'>) => Promise<FeatureFeedbackItem>;
  toggleLikeFeatureFeedback: (feedbackId: string) => void;
  updateFeatureStatus: (feedbackId: string, status: FeedbackStatus) => void;
  addComment: (feedbackId: string, content: string) => Promise<FeedbackComment>;
  toggleLikeComment: (commentId: string) => void;
  resetToDefaults: () => void;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'droid88_state_v2';

const getSavedItem = (suffix: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${LOCAL_STORAGE_KEY}_${suffix}`);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState<boolean>(true);

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = getSavedItem('users');
    return saved ? JSON.parse(saved) : AVAILABLE_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = getSavedItem('current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id !== 'user_current_01') {
          return parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [apps, setApps] = useState<AppListing[]>(() => {
    const saved = getSavedItem('apps');
    return saved ? JSON.parse(saved) : INITIAL_APPS;
  });

  const [bugReports, setBugReports] = useState<BugReport[]>(() => {
    const saved = getSavedItem('bugs');
    return saved ? JSON.parse(saved) : INITIAL_BUG_REPORTS;
  });

  const [featureFeedbacks, setFeatureFeedbacks] = useState<FeatureFeedbackItem[]>(() => {
    const saved = getSavedItem('features');
    return saved ? JSON.parse(saved) : INITIAL_FEATURE_FEEDBACK;
  });

  const [comments, setComments] = useState<FeedbackComment[]>(() => {
    const saved = getSavedItem('comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [automatedFeedbacks, setAutomatedFeedbacks] = useState<AutomatedFeedbackSubmission[]>(() => {
    const saved = getSavedItem('auto_feedbacks');
    return saved ? JSON.parse(saved) : INITIAL_AUTOMATED_FEEDBACKS;
  });

  const [enrollments, setEnrollments] = useState<TesterEnrollment[]>(() => {
    const saved = getSavedItem('enrollments');
    return saved ? JSON.parse(saved) : [];
  });

  // Supabase Auth listener & initial profile sync
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setSupabaseUser(user);

        if (user) {
          // Fetch user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            const mappedUser: User = {
              id: profile.id,
              name: profile.name,
              developerAccountName: profile.developer_account_name,
              email: profile.email,
              avatar: profile.avatar || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.id)}`,
              role: profile.role,
              testerTier: profile.tester_tier,
              googleId: user.id,
              joinedDate: profile.created_at ? profile.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              enrolledAppIds: profile.enrolled_app_ids || [],
              reputationScore: profile.reputation_score || 500,
              bio: profile.bio || '',
              website: profile.website || '',
              contactEmail: profile.contact_email || user.email || '',
              googlePlayConsoleDevId: profile.google_play_console_dev_id || '',
              company: profile.company || '',
              verifiedDeveloper: profile.verified_developer ?? true,
              deviceInfo: profile.device_info || {
                model: 'Google Pixel 8 Pro',
                osVersion: 'Android 14',
                manufacturer: 'Google'
              }
            };
            setCurrentUser(mappedUser);
          } else {
            // Create initial profile in Supabase
            const newProfile: User = {
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Android Developer',
              developerAccountName: `${user.user_metadata?.full_name || 'Indie'} Studios`,
              email: user.email || '',
              avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.id)}`,
              role: 'developer',
              testerTier: 'tier_2_verified',
              googleId: user.id,
              joinedDate: new Date().toISOString().split('T')[0],
              enrolledAppIds: [],
              reputationScore: 500,
              bio: 'Android software developer building for Google Play closed testing tracks.',
              website: '',
              contactEmail: user.email || '',
              googlePlayConsoleDevId: '',
              company: '',
              verifiedDeveloper: true,
              deviceInfo: {
                model: 'Google Pixel 8 Pro',
                osVersion: 'Android 14',
                manufacturer: 'Google'
              }
            };

            await supabase.from('profiles').upsert({
              id: newProfile.id,
              name: newProfile.name,
              developer_account_name: newProfile.developerAccountName,
              email: newProfile.email,
              avatar: newProfile.avatar,
              role: newProfile.role,
              tester_tier: newProfile.testerTier,
              reputation_score: newProfile.reputationScore,
              bio: newProfile.bio,
              website: newProfile.website,
              contact_email: newProfile.contactEmail,
              google_play_console_dev_id: newProfile.googlePlayConsoleDevId,
              company: newProfile.company,
              verified_developer: newProfile.verifiedDeveloper,
              device_info: newProfile.deviceInfo,
              enrolled_app_ids: newProfile.enrolledAppIds
            });

            setCurrentUser(newProfile);
          }
        }
      } catch (err) {
        console.warn('Supabase session load error (using cached state):', err);
      } finally {
        setIsSupabaseLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setSupabaseUser(user);
      if (!user) {
        setCurrentUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
        }
      } else {
        await checkUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch initial data from Supabase if connected
  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const { data: remoteApps } = await supabase.from('apps').select('*');
        if (remoteApps && remoteApps.length > 0) {
          const mappedApps: AppListing[] = remoteApps.map((a: any) => ({
            id: a.id,
            developerId: a.developer_id,
            developerName: a.developer_name,
            developerAvatar: a.developer_avatar,
            name: a.name,
            packageName: a.package_name,
            versionName: a.version_name,
            versionCode: a.version_code,
            icon: a.icon,
            category: a.category,
            shortDescription: a.short_description,
            fullDescription: a.full_description,
            testingTrackUrl: a.testing_track_url,
            webOptInUrl: a.web_opt_in_url || (a.package_name ? `https://play.google.com/apps/testing/${a.package_name}` : a.testing_track_url),
            androidOptInUrl: a.android_opt_in_url || (a.package_name ? `https://play.google.com/store/apps/details?id=${a.package_name}` : undefined),
            googleGroupUrl: a.google_group_url,
            requiredTier: a.required_tier,
            targetTesters: a.target_testers,
            currentTesters: a.current_testers,
            testStartDate: a.test_start_date,
            testDurationDays: a.test_duration_days,
            status: a.status,
            testingFocus: a.testing_focus,
            minAndroidVersion: a.min_android_version,
            screenshots: a.screenshots || [],
            createdAt: a.created_at,
            averageRating: Number(a.average_rating) || 5.0,
            ratingsCount: a.ratings_count || 0
          }));
          setApps(mappedApps);
        }

        const { data: remoteBugs } = await supabase.from('bug_reports').select('*').order('created_at', { ascending: false });
        if (remoteBugs && remoteBugs.length > 0) {
          const mappedBugs: BugReport[] = remoteBugs.map((b: any) => ({
            id: b.id,
            appId: b.app_id,
            appName: b.app_name,
            testerId: b.tester_id,
            testerName: b.tester_name,
            testerAvatar: b.tester_avatar,
            title: b.title,
            description: b.description,
            stepsToReproduce: b.steps_to_reproduce,
            expectedResult: b.expected_result,
            actualResult: b.actual_result,
            severity: b.severity,
            status: b.status,
            deviceModel: b.device_model,
            osVersion: b.os_version,
            appVersion: b.app_version,
            screenshotUrl: b.screenshot_url,
            developerNotes: b.developer_notes,
            createdAt: b.created_at
          }));
          setBugReports(mappedBugs);
        }
      } catch (err) {
        console.warn('Could not sync with Supabase tables, running offline mock cache:', err);
      }
    };

    fetchRemoteData();
  }, []);

  // Save state to localStorage for offline cache
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(allUsers));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_apps`, JSON.stringify(apps));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_bugs`, JSON.stringify(bugReports));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_features`, JSON.stringify(featureFeedbacks));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_comments`, JSON.stringify(comments));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_auto_feedbacks`, JSON.stringify(automatedFeedbacks));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_enrollments`, JSON.stringify(enrollments));
  }, [currentUser, allUsers, apps, bugReports, featureFeedbacks, comments, automatedFeedbacks, enrollments]);

  // Upload file to Supabase Storage
  const uploadFileToStorage = async (bucket: 'app-icons' | 'bug-screenshots', file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

      if (uploadError) {
        console.warn('Storage upload error:', uploadError);
        // Fallback to data URL for local display
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Storage upload catch error:', err);
      return null;
    }
  };

  const signInWithSupabaseGoogle = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error('Supabase Google Sign-In error:', err);
      throw err;
    }
  };

  const signInWithSupabaseGithub = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error('Supabase GitHub Sign-In error:', err);
      throw err;
    }
  };

  const signOutFromSupabase = async () => {
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
      }
    } catch (err) {
      console.error('Supabase sign out error:', err);
      setCurrentUser(null);
    }
  };

  const updateDeveloperProfile = async (profileData: Partial<User>) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      ...profileData
    };

    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));

    if (profileData.developerAccountName || profileData.name || profileData.avatar) {
      const devName = profileData.developerAccountName || profileData.name || updated.developerAccountName || updated.name;
      setApps(prev => prev.map(a => {
        if (a.developerId === currentUser.id) {
          return {
            ...a,
            developerName: devName,
            developerAvatar: profileData.avatar || a.developerAvatar
          };
        }
        return a;
      }));
    }

    try {
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        name: updated.name,
        developer_account_name: updated.developerAccountName,
        email: updated.email,
        avatar: updated.avatar,
        role: updated.role,
        tester_tier: updated.testerTier,
        reputation_score: updated.reputationScore,
        bio: updated.bio,
        website: updated.website,
        contact_email: updated.contactEmail,
        google_play_console_dev_id: updated.googlePlayConsoleDevId,
        company: updated.company,
        verified_developer: updated.verifiedDeveloper,
        device_info: updated.deviceInfo,
        enrolled_app_ids: updated.enrolledAppIds,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase profile update warning:', err);
    }
  };

  const switchUser = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const loginWithGoogle = (
    email: string, 
    name: string, 
    role: UserRole, 
    testerTier: TesterTier,
    developerAccountName?: string
  ) => {
    const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const updated = { 
        ...existing, 
        role, 
        testerTier, 
        developerAccountName: developerAccountName || existing.developerAccountName || `${name} Studios` 
      };
      setCurrentUser(updated);
      setAllUsers(prev => prev.map(u => u.id === existing.id ? updated : u));
    } else {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        developerAccountName: developerAccountName || `${name} Studios`,
        email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        role,
        testerTier,
        googleId: `g_${Date.now()}`,
        joinedDate: new Date().toISOString().split('T')[0],
        enrolledAppIds: [],
        reputationScore: 200,
        bio: 'Android software developer building for Google Play closed testing tracks.',
        website: '',
        contactEmail: email,
        googlePlayConsoleDevId: '',
        company: '',
        verifiedDeveloper: role === 'developer',
        deviceInfo: {
          model: 'Google Pixel 8 Pro',
          osVersion: 'Android 14',
          manufacturer: 'Google'
        }
      };
      setAllUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);

      // Save to Supabase
      supabase.from('profiles').upsert({
        id: newUser.id,
        name: newUser.name,
        developer_account_name: newUser.developerAccountName,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        tester_tier: newUser.testerTier,
        reputation_score: newUser.reputationScore,
        bio: newUser.bio,
        contact_email: newUser.contactEmail,
        verified_developer: newUser.verifiedDeveloper,
        device_info: newUser.deviceInfo
      }).then();
    }
  };

  const updateUserRole = (role: UserRole) => {
    updateDeveloperProfile({ role });
  };

  const updateTesterTier = (testerTier: TesterTier) => {
    updateDeveloperProfile({ testerTier });
  };

  const publishApp = async (appData: Omit<AppListing, 'id' | 'developerId' | 'developerName' | 'developerAvatar' | 'currentTesters' | 'createdAt' | 'averageRating' | 'ratingsCount' | 'status'>): Promise<AppListing> => {
    const authorId = currentUser ? currentUser.id : `dev_${Date.now()}`;
    const authorName = currentUser ? (currentUser.developerAccountName || currentUser.name) : 'Android Developer';
    const authorAvatar = currentUser ? currentUser.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=dev';

    const newApp: AppListing = {
      ...appData,
      id: `app_${Date.now()}`,
      developerId: authorId,
      developerName: authorName,
      developerAvatar: authorAvatar,
      currentTesters: 0,
      status: 'active_testing',
      createdAt: new Date().toISOString().split('T')[0],
      averageRating: 5.0,
      ratingsCount: 0
    };

    setApps(prev => [newApp, ...prev]);

    try {
      await supabase.from('apps').insert({
        id: newApp.id,
        developer_id: newApp.developerId,
        developer_name: newApp.developerName,
        developer_avatar: newApp.developerAvatar,
        name: newApp.name,
        package_name: newApp.packageName,
        version_name: newApp.versionName,
        version_code: newApp.versionCode,
        icon: newApp.icon,
        category: newApp.category,
        short_description: newApp.shortDescription,
        full_description: newApp.fullDescription,
        testing_track_url: newApp.testingTrackUrl,
        web_opt_in_url: newApp.webOptInUrl || (newApp.packageName ? `https://play.google.com/apps/testing/${newApp.packageName}` : newApp.testingTrackUrl),
        android_opt_in_url: newApp.androidOptInUrl || (newApp.packageName ? `https://play.google.com/store/apps/details?id=${newApp.packageName}` : null),
        google_group_url: newApp.googleGroupUrl,
        required_tier: newApp.requiredTier,
        target_testers: newApp.targetTesters,
        current_testers: 0,
        test_start_date: newApp.testStartDate,
        test_duration_days: newApp.testDurationDays,
        status: newApp.status,
        testing_focus: newApp.testingFocus,
        min_android_version: newApp.minAndroidVersion,
        screenshots: newApp.screenshots
      });
    } catch (e) {
      console.warn('Supabase app insert warning:', e);
    }

    return newApp;
  };

  const enrollInApp = async (appId: string, deviceModel: string, osVersion: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const today = new Date().toISOString().split('T')[0];
    const newEnrollment: TesterEnrollment = {
      id: `enr_${Date.now()}`,
      appId,
      testerId: currentUser.id,
      testerName: currentUser.name,
      testerAvatar: currentUser.avatar,
      testerEmail: currentUser.email,
      testerTier: currentUser.testerTier,
      enrolledAt: new Date().toISOString(),
      deviceModel,
      osVersion,
      daysActive: 1,
      lastActiveDate: today,
      dailyCheckins: [today],
      completedFeedbacks: []
    };

    setEnrollments(prev => [newEnrollment, ...prev]);

    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        const nextCount = a.currentTesters + 1;
        return {
          ...a,
          currentTesters: nextCount,
          status: nextCount >= a.targetTesters ? 'target_met' : a.status
        };
      }
      return a;
    }));

    const updatedEnrolled = [...(currentUser.enrolledAppIds || []), appId];
    updateDeveloperProfile({
      enrolledAppIds: updatedEnrolled,
      reputationScore: (currentUser.reputationScore || 0) + 20
    });

    try {
      await supabase.from('enrollments').insert({
        id: newEnrollment.id,
        app_id: newEnrollment.appId,
        tester_id: newEnrollment.testerId,
        tester_name: newEnrollment.testerName,
        tester_avatar: newEnrollment.testerAvatar,
        tester_email: newEnrollment.testerEmail,
        tester_tier: newEnrollment.testerTier,
        device_model: newEnrollment.deviceModel,
        os_version: newEnrollment.osVersion,
        days_active: newEnrollment.daysActive,
        daily_checkins: newEnrollment.dailyCheckins
      });
    } catch (e) {
      console.warn('Supabase enrollment insert warning:', e);
    }
  };

  const unenrollFromApp = async (appId: string) => {
    if (!currentUser) return;
    setEnrollments(prev => prev.filter(e => !(e.appId === appId && e.testerId === currentUser.id)));
    setApps(prev => prev.map(a => {
      if (a.id === appId && a.currentTesters > 0) {
        return { ...a, currentTesters: a.currentTesters - 1 };
      }
      return a;
    }));
    updateDeveloperProfile({
      enrolledAppIds: (currentUser.enrolledAppIds || []).filter(id => id !== appId)
    });

    try {
      await supabase.from('enrollments').delete().match({ app_id: appId, tester_id: currentUser.id });
    } catch (e) {
      console.warn('Supabase enrollment delete warning:', e);
    }
  };

  const performDailyCheckin = async (appId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const today = new Date().toISOString().split('T')[0];
    let updated = false;

    setEnrollments(prev => prev.map(e => {
      if (e.appId === appId && e.testerId === currentUser.id) {
        if (!e.dailyCheckins.includes(today)) {
          updated = true;
          return {
            ...e,
            daysActive: e.daysActive + 1,
            lastActiveDate: today,
            dailyCheckins: [...e.dailyCheckins, today]
          };
        }
      }
      return e;
    }));

    if (updated) {
      updateDeveloperProfile({
        reputationScore: (currentUser.reputationScore || 0) + 15
      });
    }

    return updated;
  };

  const reportBug = async (bugData: Omit<BugReport, 'id' | 'testerId' | 'testerName' | 'testerAvatar' | 'createdAt' | 'status'>): Promise<BugReport> => {
    const testerId = currentUser ? currentUser.id : `tester_${Date.now()}`;
    const testerName = currentUser ? currentUser.name : 'Community Tester';
    const testerAvatar = currentUser ? currentUser.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=tester';

    const newBug: BugReport = {
      ...bugData,
      id: `bug_${Date.now()}`,
      testerId,
      testerName,
      testerAvatar,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    setBugReports(prev => [newBug, ...prev]);

    try {
      await supabase.from('bug_reports').insert({
        id: newBug.id,
        app_id: newBug.appId,
        app_name: newBug.appName,
        tester_id: newBug.testerId,
        tester_name: newBug.testerName,
        tester_avatar: newBug.testerAvatar,
        title: newBug.title,
        description: newBug.description,
        steps_to_reproduce: newBug.stepsToReproduce,
        expected_result: newBug.expectedResult,
        actual_result: newBug.actualResult,
        severity: newBug.severity,
        status: newBug.status,
        device_model: newBug.deviceModel,
        os_version: newBug.osVersion,
        app_version: newBug.appVersion,
        screenshot_url: newBug.screenshotUrl
      });
    } catch (e) {
      console.warn('Supabase bug insert warning:', e);
    }

    if (currentUser) {
      updateDeveloperProfile({
        reputationScore: (currentUser.reputationScore || 0) + 30
      });
    }

    return newBug;
  };

  const updateBugStatus = async (bugId: string, status: BugStatus, notes?: string) => {
    setBugReports(prev => prev.map(bug => {
      if (bug.id === bugId) {
        return {
          ...bug,
          status,
          developerNotes: notes !== undefined ? notes : bug.developerNotes
        };
      }
      return bug;
    }));

    try {
      await supabase.from('bug_reports').update({
        status,
        developer_notes: notes
      }).eq('id', bugId);
    } catch (e) {
      console.warn('Supabase update bug warning:', e);
    }
  };

  const submitAutomatedFeedback = async (feedback: Omit<AutomatedFeedbackSubmission, 'id' | 'testerId' | 'testerName' | 'testerTier' | 'submittedAt'>): Promise<AutomatedFeedbackSubmission> => {
    const testerId = currentUser ? currentUser.id : `tester_${Date.now()}`;
    const testerName = currentUser ? currentUser.name : 'Community Tester';
    const testerTier = currentUser ? currentUser.testerTier : 'tier_1_standard';

    const newSubmission: AutomatedFeedbackSubmission = {
      ...feedback,
      id: `fb_${Date.now()}`,
      testerId,
      testerName,
      testerTier,
      submittedAt: new Date().toISOString()
    };

    setAutomatedFeedbacks(prev => [newSubmission, ...prev]);

    if (currentUser) {
      setEnrollments(prev => prev.map(e => {
        if (e.appId === feedback.appId && e.testerId === currentUser.id) {
          if (!e.completedFeedbacks.includes(feedback.phase)) {
            return {
              ...e,
              completedFeedbacks: [...e.completedFeedbacks, feedback.phase]
            };
          }
        }
        return e;
      }));
    }

    try {
      await supabase.from('automated_feedbacks').insert({
        id: newSubmission.id,
        app_id: newSubmission.appId,
        app_name: newSubmission.appName,
        tester_id: newSubmission.testerId,
        tester_name: newSubmission.testerName,
        tester_tier: newSubmission.testerTier,
        phase: newSubmission.phase,
        stability_rating: newSubmission.stabilityRating,
        battery_impact_rating: newSubmission.batteryImpactRating,
        ui_intuitiveness_rating: newSubmission.uiIntuitivenessRating,
        crash_encountered: newSubmission.crashEncountered,
        crash_details: newSubmission.crashDetails,
        favorite_features: newSubmission.favoriteFeatures,
        confusing_areas: newSubmission.confusingAreas,
        net_promoter_score: newSubmission.netPromoterScore,
        device_model: newSubmission.deviceModel
      });
    } catch (e) {
      console.warn('Supabase feedback insert warning:', e);
    }

    if (currentUser) {
      updateDeveloperProfile({
        reputationScore: (currentUser.reputationScore || 0) + 40
      });
    }

    return newSubmission;
  };

  const createFeatureFeedback = async (data: Omit<FeatureFeedbackItem, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'authorRole' | 'likes' | 'likedBy' | 'commentsCount' | 'createdAt'>): Promise<FeatureFeedbackItem> => {
    const authorId = currentUser ? currentUser.id : `guest_${Date.now()}`;
    const authorName = currentUser ? (currentUser.role === 'developer' && currentUser.developerAccountName ? currentUser.developerAccountName : currentUser.name) : 'Guest User';
    const authorAvatar = currentUser ? currentUser.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    const authorRole = currentUser ? currentUser.role : 'tester';

    const newItem: FeatureFeedbackItem = {
      ...data,
      id: `feat_${Date.now()}`,
      authorId,
      authorName,
      authorAvatar,
      authorRole,
      likes: 1,
      likedBy: currentUser ? [currentUser.id] : [],
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };

    setFeatureFeedbacks(prev => [newItem, ...prev]);

    try {
      await supabase.from('feature_feedbacks').insert({
        id: newItem.id,
        app_id: newItem.appId,
        app_name: newItem.appName,
        author_id: newItem.authorId,
        author_name: newItem.authorName,
        author_avatar: newItem.authorAvatar,
        author_role: newItem.authorRole,
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        status: newItem.status,
        likes: newItem.likes,
        liked_by: newItem.likedBy,
        tags: newItem.tags
      });
    } catch (e) {
      console.warn('Supabase feature insert warning:', e);
    }

    return newItem;
  };

  const toggleLikeFeatureFeedback = (feedbackId: string) => {
    if (!currentUser) return;
    setFeatureFeedbacks(prev => prev.map(item => {
      if (item.id === feedbackId) {
        const isLiked = item.likedBy.includes(currentUser.id);
        const newLikedBy = isLiked 
          ? item.likedBy.filter(id => id !== currentUser.id)
          : [...item.likedBy, currentUser.id];
        return {
          ...item,
          likes: newLikedBy.length,
          likedBy: newLikedBy
        };
      }
      return item;
    }));
  };

  const updateFeatureStatus = (feedbackId: string, status: FeedbackStatus) => {
    setFeatureFeedbacks(prev => prev.map(item => {
      if (item.id === feedbackId) {
        return { ...item, status };
      }
      return item;
    }));
  };

  const addComment = async (feedbackId: string, content: string): Promise<FeedbackComment> => {
    const authorId = currentUser ? currentUser.id : `guest_${Date.now()}`;
    const authorName = currentUser ? (currentUser.role === 'developer' && currentUser.developerAccountName ? currentUser.developerAccountName : currentUser.name) : 'Guest User';
    const authorAvatar = currentUser ? currentUser.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    const authorRole = currentUser ? currentUser.role : 'tester';

    const newComment: FeedbackComment = {
      id: `comm_${Date.now()}`,
      feedbackId,
      authorId,
      authorName,
      authorAvatar,
      authorRole,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    setComments(prev => [...prev, newComment]);

    setFeatureFeedbacks(prev => prev.map(item => {
      if (item.id === feedbackId) {
        return { ...item, commentsCount: item.commentsCount + 1 };
      }
      return item;
    }));

    try {
      await supabase.from('feedback_comments').insert({
        id: newComment.id,
        feedback_id: newComment.feedbackId,
        author_id: newComment.authorId,
        author_name: newComment.authorName,
        author_avatar: newComment.authorAvatar,
        author_role: newComment.authorRole,
        content: newComment.content
      });
    } catch (e) {
      console.warn('Supabase comment insert warning:', e);
    }

    return newComment;
  };

  const toggleLikeComment = (commentId: string) => {
    if (!currentUser) return;
    setComments(prev => prev.map(comm => {
      if (comm.id === commentId) {
        const isLiked = comm.likedBy.includes(currentUser.id);
        const newLikedBy = isLiked
          ? comm.likedBy.filter(id => id !== currentUser.id)
          : [...comm.likedBy, currentUser.id];
        return {
          ...comm,
          likes: newLikedBy.length,
          likedBy: newLikedBy
        };
      }
      return comm;
    }));
  };

  const resetToDefaults = () => {
    setCurrentUser(null);
    setAllUsers(AVAILABLE_USERS);
    setApps(INITIAL_APPS);
    setBugReports(INITIAL_BUG_REPORTS);
    setFeatureFeedbacks(INITIAL_FEATURE_FEEDBACK);
    setComments(INITIAL_COMMENTS);
    setAutomatedFeedbacks(INITIAL_AUTOMATED_FEEDBACKS);
    setEnrollments([]);
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  };

  const resetToSampleData = () => {
    resetToDefaults();
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      allUsers,
      apps,
      bugReports,
      featureFeedbacks,
      comments,
      automatedFeedbacks,
      enrollments,
      supabaseUser,
      isSupabaseLoading,
      setCurrentUser,
      switchUser,
      loginWithGoogle,
      signInWithSupabaseGoogle,
      signInWithSupabaseGithub,
      signOutFromSupabase,
      uploadFileToStorage,
      updateDeveloperProfile,
      updateUserRole,
      updateTesterTier,
      publishApp,
      enrollInApp,
      unenrollFromApp,
      performDailyCheckin,
      reportBug,
      updateBugStatus,
      submitAutomatedFeedback,
      createFeatureFeedback,
      toggleLikeFeatureFeedback,
      updateFeatureStatus,
      addComment,
      toggleLikeComment,
      resetToDefaults,
      resetToSampleData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
