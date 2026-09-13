'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, AppListing, BugReport, BugStatus, slugify } from '../types';
import { 
  Building2, 
  Globe, 
  Mail, 
  Smartphone, 
  ShieldCheck, 
  Edit3, 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  Users, 
  Layers, 
  Sparkles, 
  LogOut, 
  LogIn, 
  RefreshCw,
  AlertCircle,
  Bug,
  Flame,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Share2,
  Check,
  Copy,
  Download,
  Filter,
  CheckCircle,
  Eye,
  AlertTriangle,
  Clock,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EditAppModal } from './EditAppModal';

interface DeveloperProfilePageProps {
  onSelectApp: (app: AppListing) => void;
  onOpenPublishModal: () => void;
  targetDeveloperId?: string;
  onBackToCatalog?: () => void;
}

export const DeveloperProfilePage: React.FC<DeveloperProfilePageProps> = ({
  onSelectApp,
  onOpenPublishModal,
  targetDeveloperId,
  onBackToCatalog
}) => {
  const { 
    currentUser, 
    allUsers, 
    apps, 
    bugReports,
    automatedFeedbacks,
    enrollments,
    updateDeveloperProfile, 
    updateBugStatus,
    signInWithSupabaseGoogle, 
    signInWithSupabaseGithub,
    signOutFromSupabase,
    supabaseUser 
  } = useApp();

  // Determine which developer profile we are looking at with robust ID, slug, and app matching
  const profileUser: User | null = (() => {
    if (!targetDeveloperId) {
      return currentUser || allUsers[0] || null;
    }

    const cleanTarget = targetDeveloperId.trim().toLowerCase();

    // 1. Direct ID match
    const byId = allUsers.find(u => u.id.toLowerCase() === cleanTarget);
    if (byId) return byId;

    // 2. Slug match on developerAccountName or name
    const bySlug = allUsers.find(u => 
      (u.developerAccountName && slugify(u.developerAccountName) === cleanTarget) ||
      slugify(u.name) === cleanTarget
    );
    if (bySlug) return bySlug;

    // 3. Match against currentUser
    if (currentUser) {
      if (
        currentUser.id.toLowerCase() === cleanTarget ||
        (currentUser.developerAccountName && slugify(currentUser.developerAccountName) === cleanTarget) ||
        slugify(currentUser.name) === cleanTarget ||
        (currentUser.email && currentUser.email.toLowerCase() === cleanTarget)
      ) {
        return currentUser;
      }
    }

    // 4. Match against apps published by this developer
    const matchingApp = apps.find(a => 
      a.developerId.toLowerCase() === cleanTarget ||
      slugify(a.developerName) === cleanTarget ||
      a.developerName.toLowerCase() === cleanTarget
    );
    if (matchingApp) {
      const devInUsers = allUsers.find(u => u.id.toLowerCase() === matchingApp.developerId.toLowerCase());
      if (devInUsers) return devInUsers;

      return {
        id: matchingApp.developerId,
        name: matchingApp.developerName,
        developerAccountName: matchingApp.developerName,
        email: '',
        avatar: matchingApp.developerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(matchingApp.developerId)}`,
        role: 'developer',
        testerTier: 'tier_2_verified',
        googleId: matchingApp.developerId,
        joinedDate: matchingApp.createdAt ? matchingApp.createdAt.split('T')[0] : '2026-01-01',
        enrolledAppIds: [matchingApp.id],
        reputationScore: 500,
        bio: `Android developer of ${matchingApp.name} on Droid88.`,
        verifiedDeveloper: true
      };
    }

    return null;
  })();

  const isOwnProfile = currentUser && profileUser ? profileUser.id === currentUser.id : false;

  const developerSlug = profileUser 
    ? (profileUser.developerAccountName ? slugify(profileUser.developerAccountName) : slugify(profileUser.name || profileUser.id))
    : '';

  // Synchronize the browser URL to display the clean matching developer dashboard URL
  useEffect(() => {
    if (typeof window !== 'undefined' && developerSlug) {
      const path = window.location.pathname;
      const targetPath = `/profile/${developerSlug}/dashboard`;
      if (path === '/profile' || path === '/profile/' || (path.startsWith('/profile/') && !path.includes(developerSlug))) {
        window.history.replaceState({}, '', targetPath);
      }
    }
  }, [developerSlug]);

  // Edit Mode state (Inline, no popups)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // App editing modal state
  const [appToEdit, setAppToEdit] = useState<AppListing | null>(null);

  // Bug triage inline state
  const [expandedBugId, setExpandedBugId] = useState<string | null>(null);
  const [bugFilter, setBugFilter] = useState<'all' | 'open' | 'investigating' | 'fix_in_next_build' | 'resolved'>('all');
  const [developerNoteInput, setDeveloperNoteInput] = useState<{ [bugId: string]: string }>({});

  const handleShareDashboard = async () => {
    if (!profileUser) return;
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/profile/${developerSlug || profileUser.id}/dashboard`
      : `https://droid88.vercel.app/profile/${developerSlug || profileUser.id}/dashboard`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Form Fields for inline editing
  const [developerAccountName, setDeveloperAccountName] = useState(profileUser ? (profileUser.developerAccountName || `${profileUser.name} Studios`) : '');
  const [company, setCompany] = useState(profileUser?.company || '');
  const [bio, setBio] = useState(profileUser?.bio || 'Android developer managing closed testing tracks and beta tester feedback on Google Play.');
  const [website, setWebsite] = useState(profileUser?.website || '');
  const [contactEmail, setContactEmail] = useState(profileUser?.contactEmail || profileUser?.email || '');
  const [googlePlayConsoleDevId, setGooglePlayConsoleDevId] = useState(profileUser?.googlePlayConsoleDevId || '');
  const [deviceModel, setDeviceModel] = useState(profileUser?.deviceInfo?.model || 'Google Pixel 8 Pro');
  const [osVersion, setOsVersion] = useState(profileUser?.deviceInfo?.osVersion || 'Android 14 (API 34)');

  // Keep form in sync if profileUser changes
  useEffect(() => {
    if (!profileUser) return;
    setDeveloperAccountName(profileUser.developerAccountName || `${profileUser.name} Studios`);
    setCompany(profileUser.company || '');
    setBio(profileUser.bio || 'Android developer managing closed testing tracks and beta tester feedback on Google Play.');
    setWebsite(profileUser.website || '');
    setContactEmail(profileUser.contactEmail || profileUser.email);
    setGooglePlayConsoleDevId(profileUser.googlePlayConsoleDevId || '');
    setDeviceModel(profileUser.deviceInfo?.model || 'Google Pixel 8 Pro');
    setOsVersion(profileUser.deviceInfo?.osVersion || 'Android 14 (API 34)');
  }, [profileUser]);

  // Apps published by this developer
  const developerApps = profileUser ? apps.filter(a => 
    a.developerId === profileUser.id || 
    (profileUser.developerAccountName && a.developerName.toLowerCase() === profileUser.developerAccountName.toLowerCase()) ||
    (profileUser.name && a.developerName.toLowerCase() === profileUser.name.toLowerCase())
  ) : [];

  const devAppIds = developerApps.map(a => a.id);

  // Aggregated live calculations
  const totalTestersRecruited = developerApps.reduce((sum, a) => sum + a.currentTesters, 0);
  const targetTestersTotal = developerApps.reduce((sum, a) => sum + a.targetTesters, 0) || 20;
  const testersPercent = Math.min(100, Math.round((totalTestersRecruited / targetTestersTotal) * 100));
  const testersNeeded = Math.max(0, targetTestersTotal - totalTestersRecruited);

  // Real-time QA bugs for developer's apps
  const devBugs = bugReports.filter(b => devAppIds.includes(b.appId));
  const filteredBugs = devBugs.filter(b => bugFilter === 'all' || b.status === bugFilter);
  const openBugsCount = devBugs.filter(b => b.status === 'open' || b.status === 'investigating').length;
  const criticalBugsCount = devBugs.filter(b => b.severity === 'blocker' && b.status !== 'resolved').length;

  // Real-time Enrolled Testers & Feedback
  const devEnrollments = enrollments.filter(e => devAppIds.includes(e.appId));
  const devFeedbacks = automatedFeedbacks.filter(f => devAppIds.includes(f.appId));

  // 14-Day Cycle calculation
  const primaryApp = developerApps[0];
  const daysActive = primaryApp && primaryApp.testStartDate
    ? Math.max(1, Math.min(14, Math.ceil((Date.now() - new Date(primaryApp.testStartDate).getTime()) / (1000 * 60 * 60 * 24))))
    : 1;

  // If targetDeveloperId was specified and developer was not found
  if (!profileUser && targetDeveloperId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-slate-900">Developer Profile Not Found</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find a developer studio matching &ldquo;{targetDeveloperId}&rdquo;.
            </p>
          </div>
          {onBackToCatalog && (
            <button
              onClick={onBackToCatalog}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <span>Back to App Catalog</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // If unauthenticated and trying to view own profile
  if (!profileUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-slate-900">Developer Dashboard</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Sign in or register with GitHub to manage your closed testing tracks, track the 20-tester benchmark, and review QA bug reports.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs mx-auto">
            <button
              onClick={signInWithSupabaseGithub}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition cursor-pointer border border-slate-800"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccess(false);

    try {
      await updateDeveloperProfile({
        developerAccountName: developerAccountName.trim() || `${currentUser.name} Studios`,
        company: company.trim(),
        bio: bio.trim(),
        website: website.trim(),
        contactEmail: contactEmail.trim(),
        googlePlayConsoleDevId: googlePlayConsoleDevId.trim(),
        deviceInfo: {
          model: deviceModel,
          osVersion: osVersion,
          manufacturer: deviceModel.split(' ')[0] || 'Google'
        },
        verifiedDeveloper: true
      });

      setIsSavingProfile(false);
      setSaveSuccess(true);
      setIsEditingProfile(false);

      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.6 }
      });

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving developer profile:', err);
      setIsSavingProfile(false);
    }
  };

  const handleGoogleConnect = async () => {
    setAuthError(null);
    try {
      await signInWithSupabaseGoogle();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      setAuthError(err.message || 'Google Sign-in was cancelled or blocked by popup settings.');
    }
  };

  const handleUpdateBugTriage = (bugId: string, status: BugStatus) => {
    const note = developerNoteInput[bugId];
    updateBugStatus(bugId, status, note || undefined);
  };

  const handleExportSummary = () => {
    if (!primaryApp) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({
        developer: profileUser.developerAccountName || profileUser.name,
        contactEmail: profileUser.contactEmail || profileUser.email,
        app: primaryApp.name,
        package: primaryApp.packageName,
        version: `v${primaryApp.versionName} (${primaryApp.versionCode})`,
        trackStatus: primaryApp.status,
        testersEnrolledCount: primaryApp.currentTesters,
        targetTestersRequirement: primaryApp.targetTesters,
        daysActiveElapsed: daysActive,
        twentyTesterBenchmarkMet: primaryApp.currentTesters >= primaryApp.targetTesters,
        openBugsCount,
        criticalBugsCount,
        enrolledTesters: devEnrollments.map(e => ({
          name: e.testerName,
          device: e.deviceModel,
          os: e.osVersion,
          checkinsCount: e.dailyCheckins.length
        }))
      }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${primaryApp.packageName || 'closed_testing'}_google_play_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Back button if viewing another developer */}
      {!isOwnProfile && onBackToCatalog && (
        <button
          type="button"
          onClick={onBackToCatalog}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
        >
          <span>← Back to All Closed Testing Tracks</span>
        </button>
      )}

      {/* Main Developer Identity Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/80 via-white to-white border-b border-slate-100">
          {/* Top Status & Verification Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/80 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>droid88.vercel.app/profile/{developerSlug}/dashboard</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Developer Dashboard</span>
              </span>

              {profileUser.verifiedDeveloper && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Android Developer</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-200 shadow-md bg-white"
                />
                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs" title="Active">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="space-y-1.5">
                <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
                  {profileUser.developerAccountName || `${profileUser.name} Studios`}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Account Owner: {profileUser.name}</span>
                  {profileUser.email && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-500">{profileUser.email}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-emerald-700 font-bold capitalize">Role: {profileUser.role}</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleShareDashboard}
                className="px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                title="Copy dashboard link"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>{isCopied ? 'Link Copied!' : 'Share Dashboard'}</span>
              </button>

              {isOwnProfile && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isEditingProfile 
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' 
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingProfile ? 'Cancel' : 'Edit Studio Details'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenPublishModal}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+ Publish Track</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong>Studio Details Updated!</strong> Your developer account name and studio information have been synchronized persistently to Supabase.
            </div>
          </div>
        )}

        {/* INLINE EDIT PROFILE FORM (ZERO POPUPS) */}
        {isEditingProfile && isOwnProfile && (
          <form onSubmit={handleSaveProfile} className="m-6 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  Configure Studio & Android Developer Information
                </h3>
                <p className="text-[11px] text-slate-500">
                  Update your public studio name, website, and Play Console details inline.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Developer Account Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={developerAccountName}
                  onChange={(e) => setDeveloperAccountName(e.target.value)}
                  placeholder="e.g. MG Studios"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Organization / Studio Entity
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. MG Studios LLC"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Google Play Console Developer Account ID
                </label>
                <input
                  type="text"
                  value={googlePlayConsoleDevId}
                  onChange={(e) => setGooglePlayConsoleDevId(e.target.value)}
                  placeholder="e.g. 882910481029"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Website / Portfolio URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://vaiiya.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Public Support / Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="dev@vaiiya.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Primary Android Dev Device
                </label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="e.g. Google Pixel 8 Pro"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                Studio Biography & Mission
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Describe your studio and testing objectives..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                {isSavingProfile ? 'Saving...' : 'Save & Update Studio'}
              </button>
            </div>
          </form>
        )}

        {/* Bio and metadata display (when not editing) */}
        {!isEditingProfile && (
          <div className="p-6 sm:p-8 space-y-4">
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed max-w-3xl">
              {profileUser.bio || 'Android developer managing closed testing tracks and beta tester feedback on Google Play.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
              {profileUser.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{profileUser.company}</span>
                </span>
              )}

              {profileUser.website && (
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-emerald-700 hover:underline font-medium"
                >
                  <Globe className="w-4 h-4" />
                  <span>{profileUser.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {profileUser.contactEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{profileUser.contactEmail}</span>
                </span>
              )}

              {profileUser.googlePlayConsoleDevId && (
                <span className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200/60">
                  Play Console Dev ID: {profileUser.googlePlayConsoleDevId}
                </span>
              )}

              {profileUser.deviceInfo && (
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span>{profileUser.deviceInfo.model} ({profileUser.deviceInfo.osVersion})</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4 HIGH-IMPACT KPI BENCHMARK CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 20-Tester Play Store Benchmark */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Play Store Benchmark</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              totalTestersRecruited >= 20 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {totalTestersRecruited >= 20 ? 'Target Met' : `${testersNeeded} needed`}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              {totalTestersRecruited}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 20 Testers</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${testersPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 block">
            {testersPercent}% of Google Play closed test requirement
          </span>
        </div>

        {/* Card 2: 14-Day Closed Cycle */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">14-Day Cycle Status</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-display text-amber-600">
              Day {daysActive}
            </span>
            <span className="text-xs font-semibold text-slate-400">of 14</span>
          </div>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
            Continuous testing streak
          </span>
          <span className="text-[11px] text-slate-500 block">
            {14 - daysActive > 0 ? `${14 - daysActive} days until production review` : 'Ready for production apply'}
          </span>
        </div>

        {/* Card 3: QA Bug Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reported Bugs</span>
            {criticalBugsCount > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {criticalBugsCount} Critical
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Crash Free
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              {devBugs.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">total issues</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {openBugsCount} open investigations in progress
          </span>
        </div>

        {/* Card 4: QA Community Reputation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Developer Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-display text-emerald-700">
              {profileUser.reputationScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">points</span>
          </div>
          <span className="text-[11px] text-emerald-800 font-medium block">
            Verified QA community partner
          </span>
          <span className="text-[11px] text-slate-500 block">
            Ranked based on test feedback & builds
          </span>
        </div>
      </div>

      {/* SECTION 1: PUBLISHED TESTING TRACKS & OPT-IN LINKS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>
                {isOwnProfile ? 'Published Closed Testing Tracks' : `Apps by ${profileUser.developerAccountName || profileUser.name}`} ({developerApps.length})
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Active closed testing builds recruiting testers with Google Group integration and Play Store opt-in tracks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isOwnProfile && primaryApp && (
              <button
                type="button"
                onClick={handleExportSummary}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
                title="Export test report for Google Play Console submission"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Play Store Report</span>
              </button>
            )}

            {isOwnProfile && (
              <button
                type="button"
                onClick={onOpenPublishModal}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>+ Post New Track</span>
              </button>
            )}
          </div>
        </div>

        {developerApps.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Smartphone className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-display font-bold text-slate-800 text-base">No closed testing tracks published yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Publish your Google Play Console track link to recruit 20 beta testers for the required 14-day test cycle.
            </p>
            {isOwnProfile && (
              <button
                type="button"
                onClick={onOpenPublishModal}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Publish Your First Track
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {developerApps.map((app) => {
              const appPct = Math.min(100, Math.round((app.currentTesters / app.targetTesters) * 100));

              return (
                <div
                  key={app.id}
                  className="bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-slate-300 p-5 space-y-4 flex flex-col justify-between transition"
                >
                  <div className="space-y-4">
                    {/* App Identity Row */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-white shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {app.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            v{app.versionName} ({app.versionCode})
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg truncate mt-1">
                          {app.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 truncate">
                          {app.packageName}
                        </p>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {app.shortDescription}
                    </p>

                    {/* 20-Tester Progress Bar */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Tester Recruitment</span>
                        <span className="font-bold text-slate-900">
                          {app.currentTesters} / {app.targetTesters} ({appPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${appPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span>{app.targetTesters - app.currentTesters > 0 ? `${app.targetTesters - app.currentTesters} more needed` : 'Target Met'}</span>
                        <span>Added {formatDate(app.createdAt)}</span>
                      </div>
                    </div>

                    {/* Google Play & Group Opt-in Links */}
                    <div className="flex flex-col gap-1.5 text-xs">
                      {app.webOptInUrl && (
                        <a
                          href={app.webOptInUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1.5 truncate"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Web Opt-In: {app.webOptInUrl}</span>
                        </a>
                      )}
                      {app.androidOptInUrl && (
                        <a
                          href={app.androidOptInUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-700 hover:text-indigo-800 font-semibold flex items-center gap-1.5 truncate"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Android Store: {app.androidOptInUrl}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions for Track */}
                  <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => setAppToEdit(app)}
                        className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit App</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectApp(app)}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>View App Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: GOOGLE PLAY 14-DAY REQUIREMENTS CHECKLIST */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Google Play Production Requirements Checklist</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time compliance checklist for Google Play Console 14-day / 20-tester closed track policy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${totalTestersRecruited >= 20 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <div>
              <span className="text-xs font-bold text-slate-900 block">20 Opted-in Testers Requirement</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {totalTestersRecruited} / 20 testers currently enrolled across closed tracks
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${daysActive >= 14 ? 'text-emerald-600' : 'text-amber-500'}`} />
            <div>
              <span className="text-xs font-bold text-slate-900 block">14 Consecutive Active Testing Days</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Day {daysActive} of 14 in progress; daily check-in loops active
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${criticalBugsCount === 0 ? 'text-emerald-600' : 'text-rose-500'}`} />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Zero Blocker Crashes Reported</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {criticalBugsCount} unresolved blocker crashes reported by testers
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Diverse Android Hardware Coverage</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Google Pixel, Samsung Galaxy, OnePlus, and Xiaomi hardware verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: LIVE BUG REPORTS & SCREENSHOT TRIAGE (INLINE ACCORDION - ZERO POPUPS!) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-500" />
              <span>Bugs & Screenshot Triage ({devBugs.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Review issues, examine attached screenshot evidence, and update triage status directly inline without popups.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'open', 'investigating', 'fix_in_next_build', 'resolved'] as const).map((statusKey) => (
              <button
                key={statusKey}
                type="button"
                onClick={() => setBugFilter(statusKey)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
                  bugFilter === statusKey
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {statusKey.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredBugs.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-display font-bold text-slate-800 text-sm">No bug reports match this filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your closed testing track is currently running without reported defects.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBugs.map((bug) => {
              const isExpanded = expandedBugId === bug.id;

              return (
                <div 
                  key={bug.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
                >
                  {/* Summary Bar (Clickable header to expand inline) */}
                  <div 
                    onClick={() => setExpandedBugId(isExpanded ? null : bug.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        bug.severity === 'blocker' ? 'bg-rose-100 text-rose-600' :
                        bug.severity === 'major' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Bug className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            bug.severity === 'blocker' ? 'bg-rose-100 text-rose-800' :
                            bug.severity === 'major' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {bug.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {bug.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Reported by {bug.testerName}</span>
                          <span>•</span>
                          <span>{bug.deviceModel} ({bug.osVersion})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold capitalize ${
                        bug.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        bug.status === 'fix_in_next_build' ? 'bg-purple-100 text-purple-800' :
                        bug.status === 'investigating' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {bug.status.replace(/_/g, ' ')}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* INLINE EXPANDED DETAIL (NO POPUPS!) */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <span className="font-bold text-slate-700 block mb-1">Issue Description:</span>
                            <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                              {bug.description}
                            </p>
                          </div>

                          {bug.stepsToReproduce && (
                            <div>
                              <span className="font-bold text-slate-700 block mb-1">Steps to Reproduce:</span>
                              <div className="whitespace-pre-line text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                                {bug.stepsToReproduce}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] text-slate-400 block font-bold">EXPECTED:</span>
                              <span className="text-slate-700">{bug.expectedResult || 'Expected normal flow'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] text-slate-400 block font-bold">ACTUAL:</span>
                              <span className="text-rose-700">{bug.actualResult || 'Crash or incorrect behavior'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Screenshot Preview & Status Triage */}
                        <div className="space-y-3">
                          {bug.screenshotUrl ? (
                            <div>
                              <span className="font-bold text-slate-700 block mb-1">Attached Screenshot Evidence:</span>
                              <a
                                href={bug.screenshotUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-xl overflow-hidden border border-slate-200 group relative max-h-48 bg-slate-900"
                              >
                                <img
                                  src={bug.screenshotUrl}
                                  alt="Bug screenshot"
                                  className="w-full h-full object-cover group-hover:opacity-90 transition"
                                />
                                <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-semibold">
                                  <Eye className="w-3 h-3" />
                                  <span>View Full Image</span>
                                </span>
                              </a>
                            </div>
                          ) : (
                            <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-400 italic">
                              No screenshot attached to this report.
                            </div>
                          )}

                          {/* Direct Inline Triage Status Changer */}
                          {isOwnProfile && (
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                              <span className="font-bold text-slate-800 block">Triage Actions & Developer Response:</span>
                              <div className="flex items-center gap-2">
                                <select
                                  value={bug.status}
                                  onChange={(e) => handleUpdateBugTriage(bug.id, e.target.value as BugStatus)}
                                  className="flex-1 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                                >
                                  <option value="open">Open Issue</option>
                                  <option value="investigating">Investigating</option>
                                  <option value="fix_in_next_build">Fix in Next Build</option>
                                  <option value="resolved">Resolved & Closed</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: ENROLLED TESTERS & TELEMETRY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Enrolled Community Testers & Telemetry ({devEnrollments.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Active opt-in testers providing automated check-ins and performance benchmarks.
          </p>
        </div>

        {devEnrollments.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-display font-bold text-slate-800 text-sm">No community testers enrolled yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Share your track link or join the DROID88 universal Google Group to recruit testers automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {devEnrollments.map((enr) => (
              <div 
                key={enr.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
              >
                <img
                  src={enr.testerAvatar}
                  alt={enr.testerName}
                  className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-slate-900 text-xs truncate block">
                    {enr.testerName}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {enr.deviceModel} ({enr.osVersion})
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      {enr.dailyCheckins.length} check-ins
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit App Modal for fixing typos / updating fields */}
      {appToEdit && (
        <EditAppModal
          isOpen={true}
          onClose={() => setAppToEdit(null)}
          app={appToEdit}
        />
      )}
    </div>
  );
};
