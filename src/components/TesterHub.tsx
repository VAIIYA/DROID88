import React from 'react';
import { useApp } from '../context/AppContext';
import { AppListing } from '../types';
import { 
  Smartphone, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Bug, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TesterHubProps {
  onSelectApp: (app: AppListing) => void;
  onOpenReportBug: (app: AppListing) => void;
  onOpenFeedback: (app: AppListing, phase?: 'day_1' | 'day_3' | 'day_7' | 'day_14') => void;
  onExploreCatalog: () => void;
}

export const TesterHub: React.FC<TesterHubProps> = ({
  onSelectApp,
  onOpenReportBug,
  onOpenFeedback,
  onExploreCatalog
}) => {
  const { 
    currentUser, 
    enrollments, 
    apps, 
    performDailyCheckin, 
    bugReports, 
    automatedFeedbacks,
    signInWithSupabaseGoogle 
  } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-slate-900">14-Day Tester Hub</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Sign in or register with your Google account to track your daily testing streaks, report bugs with screenshots, and earn verified tester tiers.
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

  const myEnrollments = enrollments.filter(e => e.testerId === currentUser.id);
  const myBugs = bugReports.filter(b => b.testerId === currentUser.id);
  const myFeedbacks = automatedFeedbacks.filter(f => f.testerId === currentUser.id);

  const today = new Date().toISOString().split('T')[0];

  const handleCheckin = (appId: string) => {
    const success = performDailyCheckin(appId);
    if (success) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'tier_3_core':
        return { label: 'Tier 3: Core QA VIP', badge: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'tier_2_verified':
        return { label: 'Tier 2: Verified Beta Tester', badge: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Tier 1: Standard Tester', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const tierInfo = getTierInfo(currentUser.testerTier);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Tester Identity Profile Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white">{currentUser.name}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${tierInfo.badge}`}>
                {tierInfo.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser.deviceInfo?.model || 'Android Device'}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{currentUser.reputationScore} QA Reputation Points</span>
              <span>•</span>
              <span>{myEnrollments.length} Active Testing Tracks</span>
            </div>
          </div>
        </div>

        {/* Quick Reputation Perk */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-xs border border-white/10 max-w-sm text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>14-Day Google Play Testing Hero</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Your daily check-in ensures indie Android developers fulfill the 20-testers / 14-day Play Console rule.
          </p>
        </div>
      </div>

      {/* Enrolled Closed Testing Tracks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl">
              My Enrolled Closed Testing Tracks ({myEnrollments.length})
            </h2>
            <p className="text-xs text-slate-500">
              Keep your test streak active every day and complete automated feedback milestones.
            </p>
          </div>

          <button
            onClick={onExploreCatalog}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <span>Explore More Apps</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {myEnrollments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <Smartphone className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-display font-bold text-slate-800 text-base">You haven't joined any closed tracks yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Browse the app catalog to join Android closed testing tracks, test real builds, and earn beta reputation.
            </p>
            <button
              onClick={onExploreCatalog}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Browse Open Testing Tracks
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myEnrollments.map((enr) => {
              const app = apps.find(a => a.id === enr.appId);
              if (!app) return null;

              const isCheckedInToday = enr.dailyCheckins.includes(today);

              return (
                <div
                  key={enr.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs p-5 space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* App Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs"
                        />
                        <div>
                          <h3 className="font-display font-bold text-slate-900 text-base leading-tight">
                            {app.name}
                          </h3>
                          <span className="text-xs font-mono text-slate-500 block truncate max-w-[200px]">
                            {app.packageName}
                          </span>
                        </div>
                      </div>

                      <a
                        href={app.testingTrackUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200"
                        title="Open Google Play Closed Track Opt-in"
                      >
                        <span>Opt-in Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Streak and Daily Action */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Flame className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">Day {enr.daysActive} of 14</span>
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                              Active Tester
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {isCheckedInToday ? 'Checked in for today' : 'Needs today’s active test check-in'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckin(app.id)}
                        disabled={isCheckedInToday}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                          isCheckedInToday 
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        {isCheckedInToday ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Done Today</span>
                          </>
                        ) : (
                          <>
                            <Flame className="w-3.5 h-3.5" />
                            <span>Check-in (+10)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Automated Feedback Milestones */}
                    <div className="space-y-1.5 mb-3">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Automated Feedback Milestones:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { phase: 'day_1', label: 'Day 1' },
                          { phase: 'day_3', label: 'Day 3' },
                          { phase: 'day_7', label: 'Day 7' },
                          { phase: 'day_14', label: 'Day 14' }
                        ].map((m) => {
                          const isDone = enr.completedFeedbacks.includes(m.phase);
                          return (
                            <button
                              key={m.phase}
                              type="button"
                              onClick={() => onOpenFeedback(app, m.phase as any)}
                              className={`p-1.5 rounded-lg text-center text-xs font-semibold transition border ${
                                isDone 
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                              }`}
                            >
                              <span className="block text-[10px]">{m.label}</span>
                              <span className="text-[9px] block opacity-80">{isDone ? 'Done' : 'Submit'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onSelectApp(app)}
                      className="text-slate-600 hover:text-slate-900 font-semibold"
                    >
                      View App Details
                    </button>

                    <button
                      onClick={() => onOpenReportBug(app)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <Bug className="w-3.5 h-3.5" />
                      <span>Report Bug</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Submitted Bug Reports */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg">
              My Submitted Bug Reports & Fix Tracker ({myBugs.length})
            </h3>
            <p className="text-xs text-slate-500">
              Track developer investigations and resolution responses for your screenshot reports.
            </p>
          </div>
        </div>

        {myBugs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">You haven't reported any bugs yet.</p>
        ) : (
          <div className="space-y-3">
            {myBugs.map((bug) => (
              <div key={bug.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-emerald-800">{bug.appName}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                        bug.severity === 'blocker' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {bug.severity}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold uppercase">
                        {bug.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{bug.title}</h4>
                  </div>

                  <span className="text-slate-400 text-[11px]">
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-slate-600 line-clamp-2">{bug.description}</p>

                {bug.developerNotes && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 text-[11px]">
                    <strong>Developer Update:</strong> {bug.developerNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tiered Access Progression Guide (WooCommerce Style Community Levels) */}
      <div className="bg-linear-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 text-white space-y-4">
        <div>
          <h3 className="font-display font-bold text-white text-base">Community Tester Tier Progression</h3>
          <p className="text-xs text-slate-300">
            Higher tiers unlock confidential alpha tracks, specialized dev tools, and direct developer communication channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-emerald-400 font-bold block">Tier 1: Standard</span>
            <span className="text-[11px] text-slate-300 block">Unlocked by default</span>
            <p className="text-slate-400 text-[11px] pt-1">Access to all public 14-day 20-tester closed tracks on Google Play.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-amber-400 font-bold block">Tier 2: Verified Beta</span>
            <span className="text-[11px] text-slate-300 block">Complete 3 full 14-day tracks</span>
            <p className="text-slate-400 text-[11px] pt-1">Access to early beta releases, priority bug triage, and verified tester badge.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-purple-400 font-bold block">Tier 3: Core QA / VIP</span>
            <span className="text-[11px] text-slate-300 block">500+ QA Reputation Points</span>
            <p className="text-slate-400 text-[11px] pt-1">Confidential alpha builds, root inspector tools, and direct direct dev dialogue.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
