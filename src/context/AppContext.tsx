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
import { 
  auth, 
  googleAuthProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  FirebaseUser
} from '../firebase';

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  apps: AppListing[];
  bugReports: BugReport[];
  featureFeedbacks: FeatureFeedbackItem[];
  comments: FeedbackComment[];
  automatedFeedbacks: AutomatedFeedbackSubmission[];
  enrollments: TesterEnrollment[];
  firebaseUser: FirebaseUser | null;
  isFirebaseLoading: boolean;
  setCurrentUser: (user: User) => void;
  switchUser: (userId: string) => void;
  loginWithGoogle: (email: string, name: string, role: UserRole, testerTier: TesterTier, developerAccountName?: string) => void;
  signInWithFirebaseGoogle: () => Promise<User | null>;
  signOutFromFirebase: () => Promise<void>;
  updateDeveloperProfile: (profileData: Partial<User>) => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  updateTesterTier: (tier: TesterTier) => void;
  publishApp: (appData: Omit<AppListing, 'id' | 'developerId' | 'developerName' | 'developerAvatar' | 'currentTesters' | 'createdAt' | 'averageRating' | 'ratingsCount' | 'status'>) => AppListing;
  enrollInApp: (appId: string, deviceModel: string, osVersion: string) => void;
  unenrollFromApp: (appId: string) => void;
  performDailyCheckin: (appId: string) => boolean;
  reportBug: (bugData: Omit<BugReport, 'id' | 'testerId' | 'testerName' | 'testerAvatar' | 'createdAt' | 'status'>) => BugReport;
  updateBugStatus: (bugId: string, status: BugStatus, notes?: string) => void;
  submitAutomatedFeedback: (feedback: Omit<AutomatedFeedbackSubmission, 'id' | 'testerId' | 'testerName' | 'testerTier' | 'submittedAt'>) => AutomatedFeedbackSubmission;
  createFeatureFeedback: (data: Omit<FeatureFeedbackItem, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'authorRole' | 'likes' | 'likedBy' | 'commentsCount' | 'createdAt'>) => FeatureFeedbackItem;
  toggleLikeFeatureFeedback: (feedbackId: string) => void;
  updateFeatureStatus: (feedbackId: string, status: FeedbackStatus) => void;
  addComment: (feedbackId: string, content: string) => FeedbackComment;
  toggleLikeComment: (commentId: string) => void;
  resetToDefaults: () => void;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'droid88_state_v1';
const LEGACY_STORAGE_KEY = 'droidclosed_state_v1';

const getSavedItem = (suffix: string): string | null => {
  return localStorage.getItem(`${LOCAL_STORAGE_KEY}_${suffix}`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_${suffix}`);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = getSavedItem('users');
    return saved ? JSON.parse(saved) : AVAILABLE_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = getSavedItem('current_user');
    return saved ? JSON.parse(saved) : INITIAL_CURRENT_USER;
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
    if (saved) return JSON.parse(saved);
    
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'enr_01',
        appId: 'app_01',
        testerId: INITIAL_CURRENT_USER.id,
        testerName: INITIAL_CURRENT_USER.name,
        testerAvatar: INITIAL_CURRENT_USER.avatar,
        testerEmail: INITIAL_CURRENT_USER.email,
        testerTier: INITIAL_CURRENT_USER.testerTier,
        enrolledAt: '2026-09-06T10:00:00Z',
        deviceModel: 'Google Pixel 8 Pro',
        osVersion: 'Android 14',
        daysActive: 8,
        lastActiveDate: today,
        dailyCheckins: [today],
        completedFeedbacks: ['day_1', 'day_3', 'day_7']
      },
      {
        id: 'enr_02',
        appId: 'app_03',
        testerId: INITIAL_CURRENT_USER.id,
        testerName: INITIAL_CURRENT_USER.name,
        testerAvatar: INITIAL_CURRENT_USER.avatar,
        testerEmail: INITIAL_CURRENT_USER.email,
        testerTier: INITIAL_CURRENT_USER.testerTier,
        enrolledAt: '2026-09-09T15:00:00Z',
        deviceModel: 'Google Pixel 8 Pro',
        osVersion: 'Android 14',
        daysActive: 4,
        lastActiveDate: today,
        dailyCheckins: [today],
        completedFeedbacks: ['day_1']
      }
    ];
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setIsFirebaseLoading(false);

      if (fbUser) {
        try {
          // Fetch persistent user document from Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as User;
            setCurrentUser(data);
            setAllUsers(prev => {
              const exists = prev.some(u => u.id === data.id || u.firebaseUid === fbUser.uid);
              if (exists) {
                return prev.map(u => (u.id === data.id || u.firebaseUid === fbUser.uid) ? data : u);
              }
              return [data, ...prev];
            });
          } else {
            // First time login - bootstrap persistent profile
            const newDevProfile: User = {
              id: fbUser.uid,
              firebaseUid: fbUser.uid,
              name: fbUser.displayName || 'Android Developer',
              developerAccountName: fbUser.displayName ? `${fbUser.displayName} Studios` : 'Indie Android Dev',
              email: fbUser.email || 'developer@android.google.com',
              avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
              role: 'developer',
              testerTier: 'tier_2_verified',
              googleId: fbUser.uid,
              joinedDate: new Date().toISOString().split('T')[0],
              enrolledAppIds: [],
              reputationScore: 500,
              bio: 'Android software developer building for Google Play closed testing tracks.',
              website: '',
              contactEmail: fbUser.email || '',
              googlePlayConsoleDevId: '',
              company: '',
              verifiedDeveloper: true,
              deviceInfo: {
                model: 'Google Pixel 8 Pro',
                osVersion: 'Android 14 (API 34)',
                manufacturer: 'Google'
              }
            };

            await setDoc(userDocRef, {
              ...newDevProfile,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            setCurrentUser(newDevProfile);
            setAllUsers(prev => [newDevProfile, ...prev.filter(u => u.id !== newDevProfile.id)]);
          }
        } catch (err) {
          console.warn('Could not sync Firestore profile:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist state updates to localStorage as robust offline cache
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_apps`, JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_bugs`, JSON.stringify(bugReports));
  }, [bugReports]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_features`, JSON.stringify(featureFeedbacks));
  }, [featureFeedbacks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_comments`, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_auto_feedbacks`, JSON.stringify(automatedFeedbacks));
  }, [automatedFeedbacks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_enrollments`, JSON.stringify(enrollments));
  }, [enrollments]);

  // Sign in with real Firebase Google Auth
  const signInWithFirebaseGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      let resolvedUser: User;
      if (userSnap.exists()) {
        resolvedUser = userSnap.data() as User;
      } else {
        resolvedUser = {
          id: fbUser.uid,
          firebaseUid: fbUser.uid,
          name: fbUser.displayName || 'Android Developer',
          developerAccountName: fbUser.displayName ? `${fbUser.displayName} Studios` : 'Indie Android Dev',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
          role: 'developer',
          testerTier: 'tier_2_verified',
          googleId: fbUser.uid,
          joinedDate: new Date().toISOString().split('T')[0],
          enrolledAppIds: [],
          reputationScore: 500,
          bio: 'Android software developer building for Google Play closed testing tracks.',
          website: '',
          contactEmail: fbUser.email || '',
          googlePlayConsoleDevId: '',
          company: '',
          verifiedDeveloper: true,
          deviceInfo: {
            model: 'Google Pixel 8 Pro',
            osVersion: 'Android 14 (API 34)',
            manufacturer: 'Google'
          }
        };

        await setDoc(userDocRef, {
          ...resolvedUser,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      setCurrentUser(resolvedUser);
      setAllUsers(prev => [resolvedUser, ...prev.filter(u => u.id !== resolvedUser.id)]);
      return resolvedUser;
    } catch (err: any) {
      console.error('Firebase Google Sign-in error:', err);
      throw err;
    }
  };

  // Sign out
  const signOutFromFirebase = async () => {
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
    } catch (err) {
      console.error('Firebase sign out error:', err);
    }
  };

  // Update Developer Profile and persist to Firestore
  const updateDeveloperProfile = async (profileData: Partial<User>) => {
    const updated: User = {
      ...currentUser,
      ...profileData
    };

    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));

    // Also update any app listings where this user is the developer
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

    // Persist to Cloud Firestore
    try {
      const targetUid = currentUser.firebaseUid || currentUser.id;
      const userDocRef = doc(db, 'users', targetUid);
      await setDoc(userDocRef, {
        ...updated,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
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

      // Attempt background Firestore sync
      try {
        const userDocRef = doc(db, 'users', newUser.id);
        setDoc(userDocRef, {
          ...newUser,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        // Safe to ignore if offline
      }
    }
  };

  const updateUserRole = (role: UserRole) => {
    updateDeveloperProfile({ role });
  };

  const updateTesterTier = (testerTier: TesterTier) => {
    updateDeveloperProfile({ testerTier });
  };

  const publishApp = (appData: Omit<AppListing, 'id' | 'developerId' | 'developerName' | 'developerAvatar' | 'currentTesters' | 'createdAt' | 'averageRating' | 'ratingsCount' | 'status'>): AppListing => {
    const newApp: AppListing = {
      ...appData,
      id: `app_${Date.now()}`,
      developerId: currentUser.id,
      developerName: currentUser.developerAccountName || currentUser.name,
      developerAvatar: currentUser.avatar,
      currentTesters: 0,
      status: 'active_testing',
      createdAt: new Date().toISOString().split('T')[0],
      averageRating: 5.0,
      ratingsCount: 0
    };

    setApps(prev => [newApp, ...prev]);

    // Persist app to Firestore
    try {
      const appDocRef = doc(db, 'apps', newApp.id);
      setDoc(appDocRef, newApp);
    } catch (e) {
      console.warn('Firestore app write:', e);
    }

    return newApp;
  };

  const enrollInApp = (appId: string, deviceModel: string, osVersion: string) => {
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

    // Update app currentTesters count
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

    // Update current user enrolledAppIds
    const updatedEnrolled = [...(currentUser.enrolledAppIds || []), appId];
    updateDeveloperProfile({
      enrolledAppIds: updatedEnrolled,
      reputationScore: (currentUser.reputationScore || 0) + 20
    });
  };

  const unenrollFromApp = (appId: string) => {
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
  };

  const performDailyCheckin = (appId: string): boolean => {
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

  const reportBug = (bugData: Omit<BugReport, 'id' | 'testerId' | 'testerName' | 'testerAvatar' | 'createdAt' | 'status'>): BugReport => {
    const newBug: BugReport = {
      ...bugData,
      id: `bug_${Date.now()}`,
      testerId: currentUser.id,
      testerName: currentUser.name,
      testerAvatar: currentUser.avatar,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    setBugReports(prev => [newBug, ...prev]);

    // Persist to Firestore
    try {
      const bugDocRef = doc(db, 'bugReports', newBug.id);
      setDoc(bugDocRef, newBug);
    } catch (e) {
      console.warn('Firestore bug write:', e);
    }

    // Award reputation points
    updateDeveloperProfile({
      reputationScore: (currentUser.reputationScore || 0) + 30
    });

    return newBug;
  };

  const updateBugStatus = (bugId: string, status: BugStatus, notes?: string) => {
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

    // Update in Firestore
    try {
      const bugDocRef = doc(db, 'bugReports', bugId);
      setDoc(bugDocRef, { status, developerNotes: notes }, { merge: true });
    } catch (e) {
      console.warn('Firestore update bug:', e);
    }
  };

  const submitAutomatedFeedback = (feedback: Omit<AutomatedFeedbackSubmission, 'id' | 'testerId' | 'testerName' | 'testerTier' | 'submittedAt'>): AutomatedFeedbackSubmission => {
    const newSubmission: AutomatedFeedbackSubmission = {
      ...feedback,
      id: `fb_${Date.now()}`,
      testerId: currentUser.id,
      testerName: currentUser.name,
      testerTier: currentUser.testerTier,
      submittedAt: new Date().toISOString()
    };

    setAutomatedFeedbacks(prev => [newSubmission, ...prev]);

    // Update enrollment completedFeedbacks
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

    // Persist to Firestore
    try {
      const fbDocRef = doc(db, 'automatedFeedbacks', newSubmission.id);
      setDoc(fbDocRef, newSubmission);
    } catch (e) {
      console.warn('Firestore feedback write:', e);
    }

    // Award reputation
    updateDeveloperProfile({
      reputationScore: (currentUser.reputationScore || 0) + 40
    });

    return newSubmission;
  };

  const createFeatureFeedback = (data: Omit<FeatureFeedbackItem, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'authorRole' | 'likes' | 'likedBy' | 'commentsCount' | 'createdAt'>): FeatureFeedbackItem => {
    const newItem: FeatureFeedbackItem = {
      ...data,
      id: `feat_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.role === 'developer' && currentUser.developerAccountName ? currentUser.developerAccountName : currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      likes: 1,
      likedBy: [currentUser.id],
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };

    setFeatureFeedbacks(prev => [newItem, ...prev]);

    // Persist to Firestore
    try {
      const featDocRef = doc(db, 'featureFeedbacks', newItem.id);
      setDoc(featDocRef, newItem);
    } catch (e) {
      console.warn('Firestore feature write:', e);
    }

    return newItem;
  };

  const toggleLikeFeatureFeedback = (feedbackId: string) => {
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

  const addComment = (feedbackId: string, content: string): FeedbackComment => {
    const newComment: FeedbackComment = {
      id: `comm_${Date.now()}`,
      feedbackId,
      authorId: currentUser.id,
      authorName: currentUser.role === 'developer' && currentUser.developerAccountName ? currentUser.developerAccountName : currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
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

    return newComment;
  };

  const toggleLikeComment = (commentId: string) => {
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
    setCurrentUser(INITIAL_CURRENT_USER);
    setAllUsers(AVAILABLE_USERS);
    setApps(INITIAL_APPS);
    setBugReports(INITIAL_BUG_REPORTS);
    setFeatureFeedbacks(INITIAL_FEATURE_FEEDBACK);
    setComments(INITIAL_COMMENTS);
    setAutomatedFeedbacks(INITIAL_AUTOMATED_FEEDBACKS);
    localStorage.clear();
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
      firebaseUser,
      isFirebaseLoading,
      setCurrentUser,
      switchUser,
      loginWithGoogle,
      signInWithFirebaseGoogle,
      signOutFromFirebase,
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
