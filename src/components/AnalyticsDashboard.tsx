import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  Users, 
  Smartphone, 
  Bug, 
  Flame, 
  CheckCircle2, 
  BarChart3, 
  PieChart, 
  Sparkles, 
  ShieldCheck,
  Calendar,
  Activity
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { apps, bugReports, automatedFeedbacks, enrollments } = useApp();
  const [selectedAppId, setSelectedAppId] = useState<string>('all');

  const currentApp = selectedAppId === 'all' ? null : apps.find(a => a.id === selectedAppId);

  // Filtered dataset
  const filteredBugs = selectedAppId === 'all' 
    ? bugReports 
    : bugReports.filter(b => b.appId === selectedAppId);

  const filteredFeedbacks = selectedAppId === 'all'
    ? automatedFeedbacks
    : automatedFeedbacks.filter(f => f.appId === selectedAppId);

  const filteredEnrollments = selectedAppId === 'all'
    ? enrollments
    : enrollments.filter(e => e.appId === selectedAppId);

  // 14-day mock activity trend data
  const daysTrend = [
    { day: 'Day 1', active: 14, target: 20 },
    { day: 'Day 2', active: 16, target: 20 },
    { day: 'Day 3', active: 18, target: 20 },
    { day: 'Day 4', active: 19, target: 20 },
    { day: 'Day 5', active: 21, target: 20 },
    { day: 'Day 6', active: 20, target: 20 },
    { day: 'Day 7', active: 22, target: 20 },
    { day: 'Day 8', active: 23, target: 20 },
    { day: 'Day 9', active: 22, target: 20 },
    { day: 'Day 10', active: 24, target: 20 },
    { day: 'Day 11', active: 23, target: 20 },
    { day: 'Day 12', active: 25, target: 20 },
    { day: 'Day 13', active: 24, target: 20 },
    { day: 'Day 14', active: 26, target: 20 },
  ];

  // Bug severity stats
  const blockerCount = filteredBugs.filter(b => b.severity === 'blocker').length;
  const majorCount = filteredBugs.filter(b => b.severity === 'major').length;
  const minorCount = filteredBugs.filter(b => b.severity === 'minor').length;
  const cosmeticCount = filteredBugs.filter(b => b.severity === 'cosmetic').length;
  const totalBugs = filteredBugs.length || 1;

  // OS Distribution
  const osDistribution = [
    { os: 'Android 14 (API 34)', count: 18, percentage: 58 },
    { os: 'Android 13 (API 33)', count: 8, percentage: 26 },
    { os: 'Android 12 (API 31/32)', count: 3, percentage: 10 },
    { os: 'Android 11 (API 30)', count: 2, percentage: 6 },
  ];

  // Device Manufacturer Split
  const deviceSplit = [
    { brand: 'Google Pixel', percentage: 38, color: 'bg-emerald-500' },
    { brand: 'Samsung Galaxy', percentage: 32, color: 'bg-blue-500' },
    { brand: 'OnePlus / Oppo', percentage: 16, color: 'bg-rose-500' },
    { brand: 'Xiaomi / HyperOS', percentage: 14, color: 'bg-amber-500' },
  ];

  // Feedback NPS & average ratings
  const avgNps = filteredFeedbacks.length > 0
    ? (filteredFeedbacks.reduce((sum, f) => sum + f.netPromoterScore, 0) / filteredFeedbacks.length).toFixed(1)
    : '9.1';

  const avgStability = filteredFeedbacks.length > 0
    ? (filteredFeedbacks.reduce((sum, f) => sum + f.stabilityRating, 0) / filteredFeedbacks.length).toFixed(1)
    : '4.7';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Community Analytics
            </span>
            <span className="text-xs text-slate-500">Google Play 14-Day Closed Testing Retention & Engagement Trends</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Engagement Trends & Activity Dashboard
          </h1>
        </div>

        {/* Filter by App */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Testing Track:</span>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">All Published Tracks Aggregated</option>
            {apps.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 14-Day Retention & Daily Active Testers (DAU) Visual Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>Daily Active Testers (DAU) Across 14-Day Closed Cycle</span>
            </h2>
            <p className="text-xs text-slate-500">
              Measures continuous user retention against Google Play's required 20-tester benchmark threshold.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Active Testers</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 border border-dashed border-amber-500"></span>
              <span>20-Tester Threshold</span>
            </span>
          </div>
        </div>

        {/* Custom High-Precision SVG Graph */}
        <div className="relative pt-4 pb-2">
          <div className="h-64 w-full flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-slate-200">
            {daysTrend.map((item, idx) => {
              const maxVal = 30;
              const heightPercent = Math.round((item.active / maxVal) * 100);
              const targetPercent = Math.round((item.target / maxVal) * 100);
              const isMet = item.active >= item.target;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition duration-150 absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {item.day}: {item.active} active testers ({isMet ? 'Target Met' : 'Below 20'})
                  </div>

                  {/* 20-tester benchmark marker */}
                  <div 
                    className="absolute w-full border-t-2 border-dashed border-amber-400/80 z-10 pointer-events-none"
                    style={{ bottom: `${targetPercent}%` }}
                  />

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                      isMet ? 'bg-linear-to-t from-emerald-600 to-teal-400' : 'bg-linear-to-t from-amber-500 to-amber-400'
                    } group-hover:brightness-110 shadow-xs`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  <span className="text-[10px] text-slate-500 font-mono mt-2 hidden sm:block">
                    {item.day.replace('Day ', 'D')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 pt-2 px-1 font-mono">
            <span>Day 1 (Track Launch)</span>
            <span>Day 7 (Mid-point Check)</span>
            <span>Day 14 (Play Console Production Signoff)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 font-bold block">14-Day Retention Rate</span>
            <span className="text-xl font-bold font-display text-emerald-950">92.4%</span>
            <span className="text-[11px] text-emerald-700">Healthy continuous engagement</span>
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <span className="text-indigo-800 font-bold block">Daily Active Check-ins</span>
            <span className="text-xl font-bold font-display text-indigo-950">23 avg/day</span>
            <span className="text-[11px] text-indigo-700">+15% above Play Store minimum</span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-amber-800 font-bold block">Play Console Approval Score</span>
            <span className="text-xl font-bold font-display text-amber-950">98 / 100</span>
            <span className="text-[11px] text-amber-700">Ready for Closed-to-Prod transition</span>
          </div>
        </div>
      </div>

      {/* Grid: Bug Severity Breakdown & Hardware Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bug Severity & Triage Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-500" />
            <span>Bug Reports by Severity & Status</span>
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Blocker / Crash', count: blockerCount, color: 'bg-rose-500', pct: Math.round((blockerCount / totalBugs) * 100) },
              { label: 'Major Issues', count: majorCount, color: 'bg-amber-500', pct: Math.round((majorCount / totalBugs) * 100) },
              { label: 'Minor Defect', count: minorCount, color: 'bg-blue-500', pct: Math.round((minorCount / totalBugs) * 100) },
              { label: 'Cosmetic / Typo', count: cosmeticCount, color: 'bg-slate-400', pct: Math.round((cosmeticCount / totalBugs) * 100) },
            ].map((item, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>{item.label}</span>
                  <span>{item.count} issues ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{ width: `${Math.max(5, item.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Average Fix Turnaround:</span>
            <strong className="text-slate-900 font-bold">18.4 hours per build</strong>
          </div>
        </div>

        {/* Hardware Matrix Coverage */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            <span>Android Test Hardware & OS Distribution</span>
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
              Device Manufacturer Coverage:
            </span>

            {/* Manufacturer Split Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex">
              {deviceSplit.map((brand, i) => (
                <div
                  key={i}
                  className={`${brand.color} h-full transition-all`}
                  style={{ width: `${brand.percentage}%` }}
                  title={`${brand.brand}: ${brand.percentage}%`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              {deviceSplit.map((brand, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${brand.color}`} />
                  <span className="text-slate-700">{brand.brand} ({brand.percentage}%)</span>
                </div>
              ))}
            </div>

            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block pt-3 border-t border-slate-100">
              Android OS Versions Active:
            </span>

            <div className="space-y-2">
              {osDistribution.map((os, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-700 font-mono text-[11px]">{os.os}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{os.count} devices</span>
                    <span className="text-slate-400 text-[10px]">({os.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Active Testers Leaderboard */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">
              Community Tester Activity & Streak Leaderboard
            </h3>
            <p className="text-xs text-slate-500">
              High-ranking beta testers driving reliable 14-day telemetry and screenshot bug discoveries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { rank: '1', name: 'Marcus Vance', tier: 'Tier 3 Core QA', streak: '14 days', bugs: '5 reported', score: '1,250 pts', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
            { rank: '2', name: 'Elena Rostova', tier: 'Tier 3 Core QA', streak: '12 days', bugs: '3 reported', score: '920 pts', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
            { rank: '3', name: 'Aisha Patel', tier: 'Tier 2 Verified', streak: '8 days', bugs: '2 reported', score: '480 pts', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
          ].map((t) => (
            <div key={t.rank} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">
                #{t.rank}
              </span>
              <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-300" />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-slate-900 block truncate">{t.name}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">{t.tier}</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span>{t.streak} streak</span>
                  <span>•</span>
                  <span>{t.bugs}</span>
                </div>
              </div>
              <span className="font-bold text-slate-800 text-xs shrink-0">{t.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
