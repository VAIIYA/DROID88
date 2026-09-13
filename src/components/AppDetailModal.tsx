import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppListing, TesterTier } from '../types';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  Shield, 
  Smartphone, 
  Bug, 
  MessageSquare, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Calendar,
  Flame,
  ThumbsUp,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AppDetailModalProps {
  app: AppListing | null;
  onClose: () => void;
  onOpenReportBug: (app: AppListing) => void;
  onOpenFeedback: (app: AppListing, phase?: 'day_1' | 'day_3' | 'day_7' | 'day_14') => void;
  onSelectDeveloper?: (developerId: string) => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  onClose,
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
    signInWithSupabaseGoogle,
    signInWithSupabaseGithub
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'bugs' | 'discussion'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(currentUser?.deviceInfo?.model || 'Google Pixel 8 Pro');
  const [selectedOs, setSelectedOs] = useState(currentUser?.deviceInfo?.osVersion || 'Android 14 (API 34)');
  const [justEnrolled, setJustEnrolled] = useState(false);

  if (!app) return null;

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(app.testingTrackUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleEnroll = () => {
    if (!currentUser) {
      signInWithSupabaseGithub();
      return;
    }
    enrollInApp(app.id, selectedDevice, selectedOs);
    setJustEnrolled(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setJustEnrolled(false), 4000);
  };

  const handleCheckin = () => {
    const success = performDailyCheckin(app.id);
    if (success) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.8 }
      });
    }
  };

  const testersNeeded = Math.max(0, app.targetTesters - app.currentTesters);
  const testersPercent = Math.min(100, Math.round((app.currentTesters / app.targetTesters) * 100));

  const today = new Date().toISOString().split('T')[0];
  const checkedInToday = currentEnrollment?.dailyCheckins.includes(today);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div 
        id="app-detail-modal"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Modal Top Header (WooCommerce App Bar) */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={app.icon}
              alt={app.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {app.category}
                </span>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  v{app.versionName} ({app.versionCode})
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  app.status === 'target_met' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-200'
                }`}>
                  {app.status === 'target_met' ? '20+ Testers Target Met' : 'Active 14-Day Closed Track'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">{app.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono mt-0.5">
                <span>{app.packageName}</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSelectDeveloper) onSelectDeveloper(app.developerId);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                  title="View Developer Profile"
                >
                  By {app.developerName}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Closed Testing Opt-in & Recruitment Action Bar */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-4 sm:p-5 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  Google Play Closed Testing Opt-in Tracks
                </span>
                {app.googleGroupUrl && (
                  <a
                    href={app.googleGroupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 underline font-medium"
                  >
                    (1. Join Google Group First)
                  </a>
                )}
              </div>

              {/* Dual Direct Play Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
                {/* Web Opt-in */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-200 text-xs shadow-xs">
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-800 block text-[11px]">Join on the Web</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {app.webOptInUrl || `https://play.google.com/apps/testing/${app.packageName}`}
                    </span>
                  </div>
                  <a
                    href={app.webOptInUrl || `https://play.google.com/apps/testing/${app.packageName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
                  >
                    <span>Opt-In</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Android Direct */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-200 text-xs shadow-xs">
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-800 block text-[11px]">Join on Android (Phone)</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {app.androidOptInUrl || `https://play.google.com/store/apps/details?id=${app.packageName}`}
                    </span>
                  </div>
                  <a
                    href={app.androidOptInUrl || `https://play.google.com/store/apps/details?id=${app.packageName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
                  >
                    <span>Play Store</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Main Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {isEnrolled ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckin}
                    disabled={checkedInToday}
                    className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      checkedInToday 
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>{checkedInToday ? `Checked In Today (Day ${currentEnrollment?.daysActive})` : 'Daily Active Check-in'}</span>
                  </button>

                  <button
                    onClick={() => unenrollFromApp(app.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs px-2 py-1 transition cursor-pointer"
                  >
                    Leave
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={!hasAccess}
                  className={`px-5 py-2.5 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                    hasAccess
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{hasAccess ? '1-Click Enroll in Droid88' : 'Tier Locked'}</span>
                </button>
              )}
            </div>
          </div>

          {justEnrolled && (
            <div className="mt-3 p-2.5 bg-emerald-600 text-white text-xs rounded-xl flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>You are now enrolled in closed testing! Complete daily check-ins for 14 days to help this developer get approved.</span>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="border-b border-slate-200 px-6 bg-slate-50 flex items-center gap-4 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Requirements
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Automated Feedback Forms</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {appFeedbacks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bugs')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'bugs'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-rose-500" />
            <span>Bug Reports with Screenshots</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800">
              {appBugs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('discussion')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'discussion'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Feature Feedback & Ideas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
              {appFeatures.length}
            </span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 14-Day Google Play Status Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Recruitment Benchmark</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-bold font-display text-slate-900">
                    {app.currentTesters} / {app.targetTesters} Testers
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${testersPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {testersNeeded === 0 ? 'Goal met for Play Console' : `${testersNeeded} more active testers needed`}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Closed Testing Window</span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold font-display text-slate-900">
                    14 Consecutive Days
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Started on {new Date(app.testStartDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Compatibility Specs</span>
                    <Smartphone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {app.minAndroidVersion}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Access tier: {app.requiredTier === 'tier_3_core' ? 'Tier 3 Core QA' : app.requiredTier === 'tier_2_verified' ? 'Tier 2 Verified' : 'Tier 1 Standard'}
                  </span>
                </div>
              </div>

              {/* Testing Focus / What to Test */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Developer Testing Instructions & Primary Focus</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Please prioritize testing the following specific scenarios on your Android hardware:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {app.testingFocus.map((focus, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 font-medium">{focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-slate-900 text-sm">About This App</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {app.fullDescription}
                </p>
              </div>

              {/* Screenshots Gallery */}
              {app.screenshots.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>App Screenshots & UI Preview</span>
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
                    {app.screenshots.map((shot, idx) => (
                      <div key={idx} className="relative shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 w-36 h-64 group flex items-center justify-center shadow-2xs">
                        <img
                          src={shot}
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Automated Feedback Schedule (Day 1, 3, 7, 14) */}
              <div className="bg-indigo-50/70 rounded-2xl p-5 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-indigo-950 text-sm">Automated Feedback Schedule</h3>
                    <p className="text-xs text-indigo-700">
                      Standardized questionnaires triggered at specific testing phases to validate Google Play readiness.
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenFeedback(app)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
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
                        className={`p-3 rounded-xl border text-center transition cursor-pointer ${
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
                        <span className={`text-[10px] font-semibold mt-1 inline-block px-1.5 py-0.2 rounded ${
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
                  Aggregated Automated Feedback ({appFeedbacks.length})
                </h4>

                {appFeedbacks.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No automated feedback submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {appFeedbacks.map((fb) => (
                      <div key={fb.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{fb.testerName}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-100 text-indigo-700 font-semibold uppercase">
                              {fb.phase.replace('_', ' ')}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">{fb.deviceModel}</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(fb.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded-lg p-2 text-center text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Stability</span>
                            <span className="font-bold text-slate-800">{fb.stabilityRating} / 5</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Battery Impact</span>
                            <span className="font-bold text-slate-800">{fb.batteryImpactRating} / 5</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">NPS Score</span>
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
                  <h3 className="font-display font-bold text-slate-900 text-sm">
                    Reported Bugs with Screenshots ({appBugs.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct device diagnostics and screenshots submitted by internal closed beta testers.
                  </p>
                </div>
                <button
                  onClick={() => onOpenReportBug(app)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>Report a Bug</span>
                </button>
              </div>

              {appBugs.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800">No bugs reported yet</p>
                  <p className="text-[11px] text-slate-500">Run the APK through edge-cases and submit screen captures if anything breaks!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appBugs.map((bug) => (
                    <div key={bug.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              bug.severity === 'blocker' ? 'bg-rose-100 text-rose-800' :
                              bug.severity === 'major' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {bug.severity}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold uppercase">
                              {bug.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {bug.deviceModel} • {bug.osVersion}
                            </span>
                          </div>
                          <h4 className="font-display font-bold text-slate-900 text-sm">{bug.title}</h4>
                        </div>

                        <span className="text-slate-400 text-[11px] shrink-0">
                          {new Date(bug.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 whitespace-pre-line">{bug.description}</p>

                      {bug.stepsToReproduce && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                          <strong className="text-slate-700 block mb-1">Steps to Reproduce:</strong>
                          <span className="text-slate-600 whitespace-pre-line font-mono text-[11px]">
                            {bug.stepsToReproduce}
                          </span>
                        </div>
                      )}

                      {/* Attached Screenshot */}
                      {bug.screenshotUrl && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Attached Screenshot
                          </span>
                          <a
                            href={bug.screenshotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded-xl overflow-hidden border border-slate-200 max-w-sm hover:opacity-90 transition"
                          >
                            <img
                              src={bug.screenshotUrl}
                              alt="Bug Screenshot"
                              className="max-h-48 object-cover"
                            />
                          </a>
                        </div>
                      )}

                      {bug.developerNotes && (
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900">
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
                  <h3 className="font-display font-bold text-slate-900 text-sm">
                    Feedback & Feature Discussions ({appFeatures.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Community suggestions, feature proposals, and threaded discussions.
                  </p>
                </div>
              </div>

              {appFeatures.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No feature feedback threads yet for this app. Visit the Community Feedback tab to propose an idea!
                </p>
              ) : (
                <div className="space-y-3">
                  {appFeatures.map((feat) => (
                    <div key={feat.id} className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{feat.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold capitalize">
                          {feat.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600">{feat.description}</p>
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
        </div>
      </div>
    </div>
  );
};
