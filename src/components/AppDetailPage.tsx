'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AppListing } from '@/types';
import { 
  Smartphone, 
  Users, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Bug, 
  FileText, 
  MessageSquare, 
  ArrowLeft,
  Share2, 
  ThumbsUp, 
  Flame, 
  Image as ImageIcon,
  Building2,
  AlertCircle,
  HelpCircle,
  Info,
  Plus,
  Trash2,
  Upload,
  Link2,
  Loader2,
  Sparkles,
  Edit3,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleAuthModal } from './GoogleAuthModal';

interface AppDetailPageProps {
  app: AppListing;
  onBack?: () => void;
  onOpenReportBug: (app: AppListing) => void;
  onOpenFeedback: (app: AppListing, phase?: 'day_1' | 'day_3' | 'day_7' | 'day_14') => void;
  onSelectDeveloper?: (developerId: string) => void;
}

export const AppDetailPage: React.FC<AppDetailPageProps> = ({
  app,
  onBack,
  onOpenReportBug,
  onOpenFeedback,
  onSelectDeveloper
}) => {
  const { 
    currentUser, 
    enrollments, 
    enrollInApp, 
    unenrollFromApp, 
    performDailyCheckin, 
    bugReports, 
    automatedFeedbacks,
    featureFeedbacks,
    signInWithSupabaseGithub,
    updateAppScreenshots,
    uploadFileToStorage
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'bugs' | 'discussion'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(currentUser?.deviceInfo?.model || 'Google Pixel 8 Pro');
  const [selectedOs, setSelectedOs] = useState(currentUser?.deviceInfo?.osVersion || 'Android 14 (API 34)');
  const [justEnrolled, setJustEnrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Screenshots management state
  const [localScreenshots, setLocalScreenshots] = useState<string[]>(app.screenshots || []);
  const [isEditingScreenshots, setIsEditingScreenshots] = useState(false);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [screenshotSuccess, setScreenshotSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLocalScreenshots(app.screenshots || []);
  }, [app.screenshots]);

  const handleAddScreenshotUrl = async () => {
    if (!newScreenshotUrl.trim()) return;
    const updated = [...localScreenshots, newScreenshotUrl.trim()];
    setLocalScreenshots(updated);
    setNewScreenshotUrl('');
    setScreenshotSuccess('Screenshot added successfully!');
    setTimeout(() => setScreenshotSuccess(null), 3000);
    await updateAppScreenshots(app.id, updated);
  };

  const handleRemoveScreenshot = async (index: number) => {
    const updated = localScreenshots.filter((_, i) => i !== index);
    setLocalScreenshots(updated);
    await updateAppScreenshots(app.id, updated);
  };

  const handleUploadScreenshotFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingScreenshot(true);
    setScreenshotError(null);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const publicUrl = await uploadFileToStorage('bug-screenshots', files[i]);
        if (publicUrl) {
          newUrls.push(publicUrl);
        } else {
          // Local fallback
          const reader = new FileReader();
          const p = new Promise<string>((resolve) => {
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(files[i]);
          });
          const dataUrl = await p;
          if (dataUrl) newUrls.push(dataUrl);
        }
      }
      if (newUrls.length > 0) {
        const updated = [...localScreenshots, ...newUrls];
        setLocalScreenshots(updated);
        setScreenshotSuccess('Uploaded screenshots added!');
        setTimeout(() => setScreenshotSuccess(null), 3000);
        await updateAppScreenshots(app.id, updated);
      }
    } catch (err: any) {
      setScreenshotError(err.message || 'Failed to upload screenshot');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleUseSampleMockups = async () => {
    const sample = [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
    ];
    setLocalScreenshots(sample);
    setScreenshotSuccess('Updated with mobile phone UI mockups!');
    setTimeout(() => setScreenshotSuccess(null), 3000);
    await updateAppScreenshots(app.id, sample);
  };

  const currentEnrollment = currentUser 
    ? enrollments.find(e => e.appId === app.id && e.testerId === currentUser.id)
    : undefined;
  const isEnrolled = !!currentEnrollment;

  const appBugs = bugReports.filter(b => b.appId === app.id);
  const appFeedbacks = automatedFeedbacks.filter(f => f.appId === app.id);
  const appFeatures = featureFeedbacks.filter(f => f.appId === app.id);

  const canAccessTier = (): boolean => {
    if (!currentUser) return true;
    if (currentUser.role === 'developer') return true;
    if (app.requiredTier === 'tier_1_standard') return true;
    if (app.requiredTier === 'tier_2_verified') {
      return currentUser.testerTier === 'tier_2_verified' || currentUser.testerTier === 'tier_3_core';
    }
    if (app.requiredTier === 'tier_3_core') {
      return currentUser.testerTier === 'tier_3_core';
    }
    return true;
  };

  const hasAccess = canAccessTier();

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const success = await enrollInApp(app.id, selectedDevice, selectedOs);
    if (success) {
      setJustEnrolled(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Automatically open the developer's Google Group join page in a new window
      if (app.googleGroupUrl && typeof window !== 'undefined') {
        window.open(app.googleGroupUrl, '_blank', 'noopener,noreferrer');
      }

      setTimeout(() => setJustEnrolled(false), 5000);
    }
  };

  const handleCheckin = () => {
    const success = performDailyCheckin(app.id);
    if (success) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 }
      });
    }
  };

  const testersNeeded = Math.max(0, app.targetTesters - app.currentTesters);
  const testersPercent = Math.min(100, Math.round((app.currentTesters / app.targetTesters) * 100));

  const today = new Date().toISOString().split('T')[0];
  const checkedInToday = currentEnrollment?.dailyCheckins.includes(today);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (onBack) {
              onBack();
            } else if (typeof window !== 'undefined') {
              window.history.back();
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <button
          type="button"
          onClick={handleCopyShareLink}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Page Link Copied!' : 'Share App Page'}</span>
        </button>
      </div>

      {/* Hero Mini-Site Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* App Title & Identity Details */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/80 via-white to-white border-b border-slate-100">
          {/* Top Status & Category Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {app.category}
              </span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                {app.packageName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>v{app.versionName} ({app.versionCode})</span>
              </span>

              <span className={`text-xs px-3 py-1 rounded-full font-bold border shadow-2xs ${
                app.status === 'target_met'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {app.status === 'target_met' ? '20+ Testers Target Met' : 'Active 14-Day Track'}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-200 shadow-md bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">
                  {app.name}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Published by</span>
                  <button
                    type="button"
                    onClick={() => onSelectDeveloper && onSelectDeveloper(app.developerId)}
                    className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{app.developerName}</span>
                  </button>
                  <span>•</span>
                  <span>Created {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex items-center gap-3 shrink-0">
              {isEnrolled ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckin}
                    disabled={checkedInToday}
                    className={`px-5 py-3 font-bold text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-md ${
                      checkedInToday 
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>{checkedInToday ? `Checked In (Day ${currentEnrollment?.daysActive}/14)` : 'Daily Testing Check-in'}</span>
                  </button>

                  <button
                    onClick={() => unenrollFromApp(app.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs px-3 py-2 transition cursor-pointer"
                  >
                    Leave
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={!hasAccess}
                  className={`px-6 py-3.5 font-bold text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-md ${
                    hasAccess
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{hasAccess ? (app.googleGroupUrl ? '1-Click Enroll & Join Google Group' : '1-Click Enroll as Tester') : 'Tier Locked'}</span>
                </button>
              )}
            </div>
          </div>

          {justEnrolled && (
            <div className="mt-5 p-3.5 bg-emerald-600 text-white text-xs rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Enrolled!</strong> We opened {app.name}&apos;s Google Group in a new tab. Click &ldquo;Join Group&rdquo; there, then tap the Play Store Opt-In link below to install!
                </span>
              </div>
              {app.googleGroupUrl && (
                <a
                  href={app.googleGroupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-white text-emerald-800 rounded-lg font-bold text-xs shrink-0 hover:bg-emerald-50 transition"
                >
                  Re-open Group
                </a>
              )}
            </div>
          )}
        </div>

        {/* Google Play Closed Testing Direct Opt-In Action Box */}
        <div className="bg-emerald-50/70 border-t border-emerald-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  Google Play Closed Testing Opt-in Links
                </span>
                {app.googleGroupUrl && (
                  <a
                    href={app.googleGroupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 underline font-medium"
                  >
                    (1. Join Google Group First)
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Tap either link below to accept the Google Play invite and install the build directly to your phone.
              </p>

              {/* Dual Direct Play Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl pt-1">
                {/* Web Opt-in */}
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-emerald-200 text-xs shadow-2xs">
                  <div className="truncate mr-3">
                    <span className="font-bold text-slate-900 block text-xs">Join on the Web</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {app.webOptInUrl || `https://play.google.com/apps/testing/${app.packageName}`}
                    </span>
                  </div>
                  <a
                    href={app.webOptInUrl || `https://play.google.com/apps/testing/${app.packageName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
                  >
                    <span>Opt-In</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Android Direct */}
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-emerald-200 text-xs shadow-2xs">
                  <div className="truncate mr-3">
                    <span className="font-bold text-slate-900 block text-xs">Join on Android (Phone)</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {app.androidOptInUrl || `https://play.google.com/store/apps/details?id=${app.packageName}`}
                    </span>
                  </div>
                  <a
                    href={app.androidOptInUrl || `https://play.google.com/store/apps/details?id=${app.packageName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
                  >
                    <span>Play Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Google Play Opt-in Requirements Helper Notice */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 max-w-2xl mt-2 shadow-2xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <span className="font-semibold text-amber-950 block">Google Play Closed Testing Access Requirements</span>
                  <p className="text-amber-800 leading-relaxed">
                    Google Play requires your Google Account to be in the <strong>DROID88 Google Group</strong> (<code className="font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded text-amber-900">droid88@googlegroups.com</code>). If you see &ldquo;App not available&rdquo; or &ldquo;URL not found&rdquo;, join the group once using the Google Account on your phone. All apps on DROID88 unlock automatically!
                  </p>
                  <a 
                    href="https://groups.google.com/g/droid88" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline pt-0.5"
                  >
                    <span>Join the Universal DROID88 Google Group (1-Click)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini-Site Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview & Instructions
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`py-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Automated Feedback Forms</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {appFeedbacks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bugs')}
          className={`py-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bugs'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bug className="w-4 h-4 text-rose-500" />
          <span>Bug Reports with Screenshots</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
            {appBugs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('discussion')}
          className={`py-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'discussion'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <span>Feature Feedback & Ideas</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
            {appFeatures.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Play Console Recruitment</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-display text-slate-900">
                {app.currentTesters} / {app.targetTesters} Testers
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${testersPercent}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                {testersNeeded === 0 ? 'Goal met for Google Play Console' : `${testersNeeded} more active testers needed`}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Closed Testing Window</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-display text-slate-900">
                14 Continuous Days
              </div>
              <p className="text-[11px] text-slate-500">
                Started on {new Date(app.testStartDate).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Compatibility Specs</span>
                <Smartphone className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-base font-bold text-slate-900">
                {app.minAndroidVersion}
              </div>
              <span className="text-[11px] text-slate-500 block">
                Access tier: {app.requiredTier === 'tier_3_core' ? 'Tier 3 Core QA' : app.requiredTier === 'tier_2_verified' ? 'Tier 2 Verified' : 'Tier 1 Standard'}
              </span>
            </div>
          </div>

          {/* Testing Focus / What to Test */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xs">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Developer Testing Instructions & Focus Areas</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Please prioritize verifying the following features and edge cases on your physical Android hardware:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {app.testingFocus.map((focus, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 font-medium leading-relaxed">{focus}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Description */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-2xs">
            <h3 className="font-display font-bold text-slate-900 text-base">About This App</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {app.fullDescription}
            </p>
          </div>

          {/* Screenshots Gallery */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">
                    App Screenshots & UI Preview
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Real mobile UI previews from testing builds ({localScreenshots.length} screenshot{localScreenshots.length === 1 ? '' : 's'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingScreenshots(!isEditingScreenshots)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    isEditingScreenshots
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingScreenshots ? 'Done Editing' : 'Add / Edit Image URLs'}</span>
                </button>
              </div>
            </div>

            {/* Quick alert if app has old random stock photos (matrix / charts) */}
            {localScreenshots.some(s => s.includes('1551288049') || s.includes('1526374965') || s.includes('1550745165') || s.includes('1511512578')) && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Notice default placeholder images?</strong> You can replace them with clean phone mockups or paste your own custom URLs.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleUseSampleMockups}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    1-Click Phone Mockups
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingScreenshots(true)}
                    className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-semibold border border-amber-300 rounded-xl text-xs transition cursor-pointer"
                  >
                    Paste Custom URLs
                  </button>
                </div>
              </div>
            )}

            {screenshotSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{screenshotSuccess}</span>
              </div>
            )}

            {screenshotError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{screenshotError}</span>
              </div>
            )}

            {/* Interactive Screenshot URL / File Editor */}
            {isEditingScreenshots && (
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-emerald-600" />
                    <span>Manage App Screenshot URLs & Uploads</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUseSampleMockups}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Use Standard Mobile Mockups</span>
                    </button>
                  </div>
                </div>

                {/* Paste URL Input Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={newScreenshotUrl}
                      onChange={(e) => setNewScreenshotUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddScreenshotUrl(); } }}
                      placeholder="Paste image URL (e.g. https://example.com/screenshot.png)..."
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddScreenshotUrl}
                    disabled={!newScreenshotUrl.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add URL</span>
                  </button>
                </div>

                {/* Upload Action */}
                <div className="flex items-center gap-3 pt-1">
                  <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Screenshot File</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={handleUploadScreenshotFile}
                      className="hidden"
                    />
                  </label>
                  {isUploadingScreenshot && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading to storage...
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    Changes save automatically to your app profile.
                  </span>
                </div>
              </div>
            )}

            {/* Screenshots Gallery Display */}
            {localScreenshots.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
                {localScreenshots.map((shot, idx) => (
                  <div
                    key={idx}
                    className="relative shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 group max-w-[240px] sm:max-w-[280px] h-[340px] sm:h-[420px] flex items-center justify-center"
                  >
                    <img
                      src={shot}
                      alt={`App Screenshot ${idx + 1}`}
                      className="w-full h-full object-contain group-hover:scale-102 transition duration-300"
                      loading="lazy"
                    />

                    {isEditingScreenshots && (
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(idx)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md cursor-pointer transition"
                          title="Delete screenshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-slate-900/70 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                      Preview {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">No screenshots uploaded for this app yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Add custom screenshot URLs or upload phone mockups so testers can preview your app before opting in.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingScreenshots(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Screenshot URLs</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUseSampleMockups}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Use Sample Mockups
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">Automated Feedback Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standardized questionnaires triggered at specific testing phases to validate Google Play readiness.
                </p>
              </div>
              <button
                onClick={() => onOpenFeedback(app)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                Submit Feedback Now
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { phase: 'day_1', title: 'Day 1 Check', desc: 'Onboarding & Launch' },
                { phase: 'day_3', title: 'Day 3 Check', desc: 'Core Features & UI' },
                { phase: 'day_7', title: 'Day 7 Check', desc: 'Stability & Battery' },
                { phase: 'day_14', title: 'Day 14 Check', desc: 'Production Signoff' }
              ].map((item) => {
                const isCompleted = currentEnrollment?.completedFeedbacks.includes(item.phase);
                return (
                  <div 
                    key={item.phase}
                    className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                    onClick={() => onOpenFeedback(app, item.phase as any)}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="font-bold text-xs block">{item.title}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                    <span className={`text-[10px] font-semibold mt-2 inline-block px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isCompleted ? 'Completed' : 'Fill Form'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-slate-900 text-sm">
              Aggregated Feedback Submissions ({appFeedbacks.length})
            </h4>

            {appFeedbacks.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
                No automated feedback submissions yet.
              </div>
            ) : (
              <div className="space-y-3">
                {appFeedbacks.map((fb) => (
                  <div key={fb.id} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{fb.testerName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold uppercase">
                          {fb.phase.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{fb.deviceModel}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(fb.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2.5 bg-slate-50 rounded-xl p-3 text-center text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Stability</span>
                        <span className="font-bold text-slate-900">{fb.stabilityRating} / 5</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Battery Impact</span>
                        <span className="font-bold text-slate-900">{fb.batteryImpactRating} / 5</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">NPS Score</span>
                        <span className="font-bold text-emerald-700">{fb.netPromoterScore} / 10</span>
                      </div>
                    </div>

                    <p className="text-slate-700">
                      <strong>Favorite features:</strong> {fb.favoriteFeatures}
                    </p>
                    {fb.confusingAreas && (
                      <p className="text-slate-600">
                        <strong>Confusing areas:</strong> {fb.confusingAreas}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bugs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                Reported Bugs with Screenshots ({appBugs.length})
              </h3>
              <p className="text-xs text-slate-500">
                Direct device diagnostics and screenshots submitted by internal closed beta testers.
              </p>
            </div>
            <button
              onClick={() => onOpenReportBug(app)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Bug className="w-4 h-4" />
              <span>Report a Bug</span>
            </button>
          </div>

          {appBugs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No bugs reported yet</p>
              <p className="text-xs text-slate-500 mt-1">Run the APK through edge-cases and submit screen captures if anything breaks!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appBugs.map((bug) => (
                <div key={bug.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          bug.severity === 'blocker' ? 'bg-rose-100 text-rose-800' :
                          bug.severity === 'major' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {bug.severity}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold uppercase">
                          {bug.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {bug.deviceModel} • {bug.osVersion}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-slate-900 text-base">{bug.title}</h4>
                    </div>

                    <span className="text-slate-400 text-xs shrink-0">
                      {new Date(bug.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line">{bug.description}</p>

                  {bug.stepsToReproduce && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <strong className="text-slate-800 block mb-1">Steps to Reproduce:</strong>
                      <span className="text-slate-600 whitespace-pre-line font-mono text-[11px]">
                        {bug.stepsToReproduce}
                      </span>
                    </div>
                  )}

                  {/* Attached Screenshot */}
                  {bug.screenshotUrl && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        Attached Screenshot
                      </span>
                      <a
                        href={bug.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block rounded-2xl overflow-hidden border border-slate-200 max-w-md hover:opacity-90 transition"
                      >
                        <img
                          src={bug.screenshotUrl}
                          alt="Bug Screenshot"
                          className="max-h-64 object-cover"
                        />
                      </a>
                    </div>
                  )}

                  {bug.developerNotes && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                      <span className="font-bold block">Developer Response:</span>
                      <span>{bug.developerNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'discussion' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                Feedback & Feature Discussions ({appFeatures.length})
              </h3>
              <p className="text-xs text-slate-500">
                Community suggestions, feature proposals, and threaded discussions.
              </p>
            </div>
          </div>

          {appFeatures.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No feature feedback threads yet</p>
              <p className="text-xs text-slate-500 mt-1">Visit the Feature Board tab to propose improvements and discuss features!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appFeatures.map((feat) => (
                <div key={feat.id} className="p-6 bg-white rounded-3xl border border-slate-200 text-xs space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{feat.title}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold capitalize">
                      {feat.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{feat.description}</p>
                  <div className="flex items-center gap-4 text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {feat.likes} Likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {feat.commentsCount} Comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Authentication Modal */}
      <GoogleAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};
