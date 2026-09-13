import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BugStatus, BugReport, AppListing } from '../types';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Bug, 
  FileText, 
  TrendingUp, 
  Smartphone, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Eye
} from 'lucide-react';

interface DeveloperDashboardProps {
  onSelectApp: (app: AppListing) => void;
  onOpenPublish: () => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  onSelectApp,
  onOpenPublish
}) => {
  const { 
    apps, 
    currentUser, 
    bugReports, 
    automatedFeedbacks, 
    enrollments, 
    updateBugStatus,
    signInWithSupabaseGoogle
  } = useApp();

  // If visitor is unauthenticated, prompt sign in
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <Smartphone className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-slate-900">Developer Console</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Sign in or register with your Google account to manage your closed testing tracks, track the 20-tester benchmark, and review QA bug reports.
            </p>
          </div>
          <button
            onClick={signInWithSupabaseGoogle}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    );
  }

  // Find apps published by current developer (or show all if developer role is active)
  const developerApps = apps.filter(a => a.developerId === currentUser.id);
  const activeAppsList = developerApps.length > 0 ? developerApps : apps.slice(0, 2);

  const [selectedAppId, setSelectedAppId] = useState<string>(activeAppsList[0]?.id || apps[0]?.id || '');
  const [bugFilter, setBugFilter] = useState<'all' | 'open' | 'investigating' | 'fix_in_next_build' | 'resolved'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'bugs' | 'testers' | 'feedbacks'>('overview');
  const [selectedBugPreview, setSelectedBugPreview] = useState<BugReport | null>(null);
  const [developerNoteInput, setDeveloperNoteInput] = useState('');

  const currentApp = apps.find(a => a.id === selectedAppId) || activeAppsList[0] || apps[0];

  // App metrics
  const appBugs = bugReports.filter(b => b.appId === currentApp?.id);
  const filteredBugs = appBugs.filter(b => bugFilter === 'all' || b.status === bugFilter);

  const appFeedbacks = automatedFeedbacks.filter(f => f.appId === currentApp?.id);
  const appEnrollments = enrollments.filter(e => e.appId === currentApp?.id);

  // Aggregated calculations
  const avgStability = appFeedbacks.length > 0
    ? (appFeedbacks.reduce((acc, f) => acc + f.stabilityRating, 0) / appFeedbacks.length).toFixed(1)
    : '4.8';

  const avgBattery = appFeedbacks.length > 0
    ? (appFeedbacks.reduce((acc, f) => acc + f.batteryImpactRating, 0) / appFeedbacks.length).toFixed(1)
    : '1.8';

  const avgNps = appFeedbacks.length > 0
    ? (appFeedbacks.reduce((acc, f) => acc + f.netPromoterScore, 0) / appFeedbacks.length).toFixed(1)
    : '9.2';

  const crashesCount = appFeedbacks.filter(f => f.crashEncountered).length;
  const crashRate = appFeedbacks.length > 0
    ? ((crashesCount / appFeedbacks.length) * 100).toFixed(0)
    : '0';

  const testersPercent = currentApp 
    ? Math.min(100, Math.round((currentApp.currentTesters / currentApp.targetTesters) * 100))
    : 0;

  const handleUpdateStatus = (bugId: string, status: BugStatus) => {
    updateBugStatus(bugId, status, developerNoteInput || undefined);
    if (selectedBugPreview && selectedBugPreview.id === bugId) {
      setSelectedBugPreview(prev => prev ? { ...prev, status, developerNotes: developerNoteInput || prev.developerNotes } : null);
    }
    setDeveloperNoteInput('');
  };

  const handleExportSummary = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({
        app: currentApp?.name,
        package: currentApp?.packageName,
        testersCount: currentApp?.currentTesters,
        targetTesters: currentApp?.targetTesters,
        aggregatedMetrics: { avgStability, avgBattery, avgNps, crashRate },
        bugReportsCount: appBugs.length,
        enrolledTesters: appEnrollments
      }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${currentApp?.packageName || 'closed_testing'}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Developer Console
            </span>
            <span className="text-xs text-slate-500">Google Play 14-Day Closed Testing Command Center</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Aggregated Test Results & Tracker
          </h1>
        </div>

        {/* App Switcher & Publish Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 hidden sm:inline">Active App:</span>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {apps.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currentTesters}/{a.targetTesters} Testers)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportSummary}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Download test results for Google Play Console submission"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={onOpenPublish}
            className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            + Publish New Track
          </button>
        </div>
      </div>

      {currentApp && (
        <>
          {/* Primary Google Play 14-Day Closed Testing Status Banner */}
          <div className="rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 items-center">
              {/* App Overview */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={currentApp.icon}
                    alt={currentApp.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20"
                  />
                  <div>
                    <h2 className="font-display font-bold text-xl text-white">{currentApp.name}</h2>
                    <span className="text-xs font-mono text-emerald-400 block">{currentApp.packageName}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={currentApp.testingTrackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white underline"
                  >
                    <span>Open Play Console Closed Track Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* 14-Day Progress Gauge */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Closed Testers Benchmark</span>
                  </span>
                  <span className="font-bold text-emerald-400">
                    {currentApp.currentTesters} / {currentApp.targetTesters} Testers
                  </span>
                </div>

                <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-linear-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${testersPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{currentApp.currentTesters >= 20 ? 'Benchmark Satisfied' : `${20 - currentApp.currentTesters} needed`}</span>
                  <span>{testersPercent}% reached</span>
                </div>
              </div>

              {/* 14-Day Continuous Active Countdown */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Testing Track Cycle</span>
                  </span>
                  <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    Day 8 of 14
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Google Play requires 20 opted-in testers to remain engaged for 14 continuous days prior to Production approval.
                </p>

                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Daily check-in loop active with community testers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aggregated KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stability Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900">{avgStability}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium block">
                Based on {appFeedbacks.length} automated reports
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Battery Efficiency</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900">{avgBattery}</span>
                <span className="text-xs text-slate-400">/ 5.0 drain</span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                1.0 = imperceptible drain
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reported Bugs</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-rose-600">{appBugs.length}</span>
                <span className="text-xs text-slate-400">total issues</span>
              </div>
              <span className="text-[11px] text-rose-600 font-medium block">
                {appBugs.filter(b => b.severity === 'blocker').length} blocker crashes
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tester NPS Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-display text-emerald-700">+{avgNps}</span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium block">
                Play Store 5-star probability
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center gap-4 px-6 border-b border-slate-200 bg-slate-50/70 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3.5 border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                14-Day Play Store Readiness
              </button>

              <button
                onClick={() => setActiveTab('bugs')}
                className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'bugs'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bug className="w-3.5 h-3.5 text-rose-500" />
                <span>Bugs & Screenshot Triage ({appBugs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('testers')}
                className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'testers'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Enrolled Community Testers ({appEnrollments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('feedbacks')}
                className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'feedbacks'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Automated Feedback Feed ({appFeedbacks.length})</span>
              </button>
            </div>

            <div className="p-6">
              {/* Tab 1: Play Store Readiness */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Checklist */}
                    <div className="space-y-3">
                      <h3 className="font-display font-bold text-slate-900 text-base">
                        Google Play Production Requirements Checklist
                      </h3>
                      <div className="space-y-2">
                        {[
                          { 
                            title: '20 opted-in testers requirement', 
                            status: currentApp.currentTesters >= 20 ? 'pass' : 'progress',
                            desc: `${currentApp.currentTesters} / 20 testers currently enrolled`
                          },
                          { 
                            title: '14 consecutive active testing days', 
                            status: 'progress',
                            desc: 'Day 8 in progress; automated feedback loop active'
                          },
                          { 
                            title: 'Zero blocker crashes reported', 
                            status: appBugs.filter(b => b.severity === 'blocker' && b.status !== 'resolved').length === 0 ? 'pass' : 'fail',
                            desc: `${appBugs.filter(b => b.severity === 'blocker' && b.status !== 'resolved').length} unresolved blocker issues`
                          },
                          { 
                            title: 'Automated Day 1, 3, 7 milestone telemetry', 
                            status: appFeedbacks.length >= 2 ? 'pass' : 'progress',
                            desc: `${appFeedbacks.length} feedback submissions on record`
                          },
                          { 
                            title: 'Diverse Android hardware coverage', 
                            status: appEnrollments.length > 0 ? 'pass' : 'progress',
                            desc: 'Pixel, Galaxy, OnePlus & Xiaomi devices represented'
                          }
                        ].map((item, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                            {item.status === 'pass' && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {item.status === 'progress' && (
                              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            {item.status === 'fail' && (
                              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold text-xs text-slate-900 block">{item.title}</span>
                              <span className="text-[11px] text-slate-500">{item.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Testing Instructions & Quick Actions */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                      <h3 className="font-display font-bold text-slate-900 text-base">
                        Closed Testing Track Details
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 block">Application Package:</span>
                          <span className="font-mono font-bold text-slate-800">{currentApp.packageName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Version:</span>
                          <span className="font-mono text-slate-800">v{currentApp.versionName} ({currentApp.versionCode})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Required Tester Tier:</span>
                          <span className="font-semibold text-emerald-700 capitalize">{currentApp.requiredTier.replace(/_/g, ' ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Google Play Track URL:</span>
                          <span className="font-mono text-[11px] text-slate-700 truncate block bg-white p-2 rounded-lg border border-slate-200">
                            {currentApp.testingTrackUrl}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => onSelectApp(currentApp)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                        >
                          View App Public Page & Tester Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Bugs & Screenshot Triage */}
              {activeTab === 'bugs' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Filter by Status:</span>
                      <select
                        value={bugFilter}
                        onChange={(e) => setBugFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="all">All Issues ({appBugs.length})</option>
                        <option value="open">Open</option>
                        <option value="investigating">Investigating</option>
                        <option value="fix_in_next_build">Fix in Next Build</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <span className="text-xs text-slate-500">
                      Click any bug to review attached screenshots & update triage status.
                    </span>
                  </div>

                  {filteredBugs.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-800">No bugs match the current filter</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredBugs.map((bug) => (
                        <div
                          key={bug.id}
                          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                                  bug.severity === 'blocker' ? 'bg-rose-100 text-rose-800' :
                                  bug.severity === 'major' ? 'bg-amber-100 text-amber-800' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {bug.severity}
                                </span>
                                <span className="text-[10px] px-2 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold uppercase">
                                  {bug.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-slate-900">{bug.title}</h4>
                            </div>

                            <span className="text-[11px] text-slate-400 font-mono shrink-0">
                              {bug.deviceModel}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2">{bug.description}</p>

                          {/* Screenshot preview */}
                          {bug.screenshotUrl && (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-36 bg-slate-900/5">
                              <img
                                src={bug.screenshotUrl}
                                alt="Bug attachment"
                                className="w-full h-36 object-cover"
                              />
                            </div>
                          )}

                          {bug.developerNotes && (
                            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                              <strong>Note:</strong> {bug.developerNotes}
                            </div>
                          )}

                          {/* Action controls */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                            <span className="text-slate-400 text-[11px]">
                              Reported by {bug.testerName}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <select
                                value={bug.status}
                                onChange={(e) => handleUpdateStatus(bug.id, e.target.value as any)}
                                className="text-[11px] font-semibold px-2 py-1 border border-slate-300 rounded-lg bg-slate-50"
                              >
                                <option value="open">Open</option>
                                <option value="investigating">Investigating</option>
                                <option value="fix_in_next_build">Fix in Next Build</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Enrolled Community Testers */}
              {activeTab === 'testers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm">
                        Enrolled Beta Testers ({appEnrollments.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Active community testers maintaining the 14-day continuous testing requirement.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Tester</th>
                          <th className="py-3 px-4">Access Tier</th>
                          <th className="py-3 px-4">Test Device & OS</th>
                          <th className="py-3 px-4">Active Streak</th>
                          <th className="py-3 px-4">Automated Forms</th>
                          <th className="py-3 px-4">Last Check-in</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appEnrollments.map((enr) => (
                          <tr key={enr.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-4 flex items-center gap-2.5">
                              <img
                                src={enr.testerAvatar}
                                alt={enr.testerName}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                              <div>
                                <span className="font-semibold text-slate-900 block">{enr.testerName}</span>
                                <span className="text-[11px] text-slate-400">{enr.testerEmail}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                                {enr.testerTier.replace(/_/g, ' ')}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                              <div>{enr.deviceModel}</div>
                              <span className="text-slate-400">{enr.osVersion}</span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {enr.daysActive} days active
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                {['day_1', 'day_3', 'day_7', 'day_14'].map((phase) => (
                                  <span
                                    key={phase}
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                      enr.completedFeedbacks.includes(phase)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 text-slate-400'
                                    }`}
                                    title={phase}
                                  >
                                    {phase.replace('day_', '')}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {enr.lastActiveDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Automated Feedback Feed */}
              {activeTab === 'feedbacks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm">
                        Automated Feedback Milestones ({appFeedbacks.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Direct telemetry responses collected across Day 1, Day 3, Day 7, and Day 14 checkpoints.
                      </p>
                    </div>
                  </div>

                  {appFeedbacks.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No feedback submissions received yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {appFeedbacks.map((fb) => (
                        <div key={fb.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{fb.testerName}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-100 text-indigo-800 font-semibold uppercase">
                                {fb.phase.replace('_', ' ')}
                              </span>
                              <span className="text-slate-400 font-mono text-[11px]">{fb.deviceModel}</span>
                            </div>
                            <span className="text-slate-400 text-[11px]">
                              {new Date(fb.submittedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-2 bg-white rounded-lg p-2 text-center text-[11px] border border-slate-100">
                            <div>
                              <span className="text-slate-500 block">Stability</span>
                              <span className="font-bold text-slate-800">{fb.stabilityRating} / 5</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Battery Drain</span>
                              <span className="font-bold text-slate-800">{fb.batteryImpactRating} / 5</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">NPS Score</span>
                              <span className="font-bold text-emerald-700">{fb.netPromoterScore} / 10</span>
                            </div>
                          </div>

                          <p className="text-slate-700">
                            <strong>Favorite Features:</strong> {fb.favoriteFeatures}
                          </p>
                          {fb.confusingAreas && (
                            <p className="text-slate-600">
                              <strong>Confusing UX:</strong> {fb.confusingAreas}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
