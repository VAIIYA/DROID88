import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AppListing, AppCategory, TesterTier, slugify } from '../types';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Users, 
  Shield, 
  Lock, 
  Bug, 
  MessageSquarePlus, 
  Sparkles, 
  Star,
  ChevronRight,
  AlertCircle,
  MessageSquare,
  Mail,
  Flame,
  Send
} from 'lucide-react';

interface AppCatalogProps {
  onSelectApp: (app: AppListing) => void;
  onOpenReportBug: (app: AppListing) => void;
  onOpenFeedback: (app: AppListing) => void;
  onOpenPublish: () => void;
  onSelectDeveloper?: (developerId: string) => void;
}

const CATEGORIES: ('All' | AppCategory)[] = [
  'All',
  'Health & Fitness',
  'Finance',
  'Tools & Utilities',
  'Productivity',
  'Lifestyle',
  'Games',
  'Social',
  'Education'
];

export const AppCatalog: React.FC<AppCatalogProps> = ({
  onSelectApp,
  onOpenReportBug,
  onOpenFeedback,
  onOpenPublish,
  onSelectDeveloper
}) => {
  const { apps, currentUser, enrollments, featureFeedbacks } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | AppCategory>('All');
  const [selectedTier, setSelectedTier] = useState<'All' | TesterTier>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active_testing' | 'target_met' | 'completed'>('All');
  const [sortBy, setSortBy] = useState<'need_testers' | 'days_left' | 'rating' | 'newest'>('need_testers');

  // Check user tier permissions
  const canAccessTier = (requiredTier: TesterTier): boolean => {
    if (!currentUser) return true;
    if (currentUser.role === 'developer') return true;
    if (requiredTier === 'tier_1_standard') return true;
    if (requiredTier === 'tier_2_verified') {
      return currentUser.testerTier === 'tier_2_verified' || currentUser.testerTier === 'tier_3_core';
    }
    if (requiredTier === 'tier_3_core') {
      return currentUser.testerTier === 'tier_3_core';
    }
    return true;
  };

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      // Search
      const matchesSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'All' && app.category !== selectedCategory) return false;

      // Tier
      if (selectedTier !== 'All' && app.requiredTier !== selectedTier) return false;

      // Status
      if (statusFilter !== 'All' && app.status !== statusFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'need_testers') {
        const needA = Math.max(0, a.targetTesters - a.currentTesters);
        const needB = Math.max(0, b.targetTesters - b.currentTesters);
        return needB - needA;
      }
      if (sortBy === 'days_left') {
        return a.testDurationDays - b.testDurationDays;
      }
      if (sortBy === 'rating') {
        return b.averageRating - a.averageRating;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [apps, searchQuery, selectedCategory, selectedTier, statusFilter, sortBy]);

  const getTierInfo = (tier: TesterTier) => {
    switch (tier) {
      case 'tier_3_core':
        return { label: 'Tier 3: Core QA Only', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'tier_2_verified':
        return { label: 'Tier 2: Verified Beta', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Tier 1: All Testers', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* WooCommerce Style Community Hero Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Play 20-Tester 14-Day Closed Testing Exchange</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 font-display">
            Publish & Test Android Closed Tracks
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Join the internal testing community. Developers post direct Google Play closed test opt-in links to satisfy the 14-day 20-tester benchmark. Beta testers report screenshot bugs and submit automated daily feedback.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPublish}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
            >
              <span>Publish Closed Track</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <a
              href="#catalog-list"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl transition border border-white/20"
            >
              Browse Open Tracks ({apps.length})
            </a>
          </div>
        </div>
      </div>

      {/* Persistent DROID88 Universal Google Group Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-950 via-slate-900 to-emerald-900 p-5 text-white border border-emerald-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">Join the Universal DROID88 Google Group (1-Time Setup)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-mono">
                droid88@googlegroups.com
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Join this group once with the Google Account on your Android phone. All indie apps on Droid88 use this single group, instantly granting you Play Store access to every closed testing build with 1 click!
            </p>
          </div>
        </div>

        <a
          href="https://groups.google.com/g/droid88"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-center"
        >
          <span>Join DROID88 Group</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Google Group Conversations & Community Hub */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base">
                  Google Group Conversations & App Discussions
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  groups.google.com/g/droid88
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live conversations, closed testing announcements, and tester feedback for all DROID88 tracks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="mailto:droid88@googlegroups.com?subject=[Discussion]%20Question%20/%20Feedback%20for%20DROID88%20Apps&body=Hi%20DROID88%20community,%0A%0A"
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Start New Conversation</span>
            </a>
            <a
              href="https://groups.google.com/g/droid88"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <span>Open Group</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live App Topics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {featureFeedbacks.slice(0, 6).map((item) => {
            const linkedApp = apps.find(a => a.id === item.appId);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-200 transition flex flex-col justify-between space-y-2 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                      {item.appName}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-slate-200 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-emerald-900 transition">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <Flame className="w-3 h-3 text-amber-500" />
                      {item.likes} upvotes
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      {item.commentsCount}
                    </span>
                  </div>

                  {linkedApp ? (
                    <button
                      type="button"
                      onClick={() => onSelectApp(linkedApp)}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Join Track</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <a
                      href="https://groups.google.com/g/droid88"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>View Thread</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Footer banner explaining how Google Group sync works */}
        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Every published app automatically creates a discussion topic. Email <strong>droid88@googlegroups.com</strong> to start a thread from your inbox!
            </span>
          </div>
          <a
            href="https://groups.google.com/g/droid88"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-800 font-bold hover:underline whitespace-nowrap flex items-center gap-1"
          >
            <span>View All Topics on Google Groups</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Filter and Search Bar (WooCommerce Shop Bar) */}
      <div id="catalog-list" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps by title, package name (e.g. com.example), or developer..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-700"
            >
              <option value="need_testers">Most Testers Needed</option>
              <option value="days_left">Testing Track Duration</option>
              <option value="rating">Highest Tester Rating</option>
              <option value="newest">Recently Published</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Tier & Status */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Access Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="All">All Tiers</option>
              <option value="tier_1_standard">Tier 1: Standard Community</option>
              <option value="tier_2_verified">Tier 2: Verified Beta</option>
              <option value="tier_3_core">Tier 3: Core QA Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Track Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="active_testing">Actively Recruiting (Day 1-14)</option>
              <option value="target_met">Target Met (≥20 Testers)</option>
              <option value="completed">Testing Cycle Completed</option>
            </select>
          </div>

          {(searchQuery || selectedCategory !== 'All' || selectedTier !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedTier('All');
                setStatusFilter('All');
              }}
              className="text-xs text-rose-600 hover:underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Catalog Grid (WooCommerce style product cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => {
          const isEnrolled = currentUser ? enrollments.some(e => e.appId === app.id && e.testerId === currentUser.id) : false;
          const hasAccess = canAccessTier(app.requiredTier);
          const tierInfo = getTierInfo(app.requiredTier);
          const testersPercent = Math.min(100, Math.round((app.currentTesters / app.targetTesters) * 100));
          const testersNeeded = Math.max(0, app.targetTesters - app.currentTesters);

          return (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header & Badges */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-14 h-14 rounded-2xl object-cover shadow-xs border border-slate-100 group-hover:scale-105 transition duration-200"
                    />
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                        {app.category}
                      </span>
                      <h3 className="font-display font-bold text-slate-900 text-base leading-snug line-clamp-1">
                        {app.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                        <span className="truncate max-w-[150px]">{app.packageName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${tierInfo.badgeColor} flex items-center gap-1`}>
                      {!hasAccess && <Lock className="w-3 h-3" />}
                      {app.requiredTier === 'tier_3_core' ? 'Core QA' : app.requiredTier === 'tier_2_verified' ? 'Tier 2' : 'Tier 1'}
                    </span>
                  </div>
                </div>

                {/* Rating & Developer */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectDeveloper) {
                        onSelectDeveloper(app.developerName ? slugify(app.developerName) : app.developerId);
                      }
                    }}
                    className="flex items-center gap-1.5 hover:text-emerald-700 transition group/dev text-left cursor-pointer"
                    title="View Developer Profile"
                  >
                    <img
                      src={app.developerAvatar}
                      alt={app.developerName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="truncate max-w-[130px] font-semibold text-slate-700 group-hover/dev:text-emerald-700 group-hover/dev:underline">
                      {app.developerName}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{app.averageRating}</span>
                    <span className="text-slate-400 font-normal">({app.ratingsCount})</span>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {app.shortDescription}
                </p>

                {/* 14-Day Closed Testing Progress */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{app.currentTesters} / {app.targetTesters} Testers</span>
                    </span>
                    <span className={`font-semibold text-[11px] ${
                      testersNeeded === 0 ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {testersNeeded === 0 ? 'Target Met' : `${testersNeeded} needed`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        testersPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${testersPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>14-day cycle</span>
                    </span>
                    <span className="text-[10px] bg-slate-200/70 px-1.5 py-0.2 rounded font-mono">
                      v{app.versionName}
                    </span>
                  </div>
                </div>

                {/* Focus badges */}
                <div className="flex flex-wrap gap-1">
                  {app.testingFocus.slice(0, 2).map((focus, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-[160px]"
                      title={focus}
                    >
                      • {focus}
                    </span>
                  ))}
                  {app.testingFocus.length > 2 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{app.testingFocus.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectApp(app)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-800 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  View Details
                </button>

                <div className="flex items-center gap-1.5">
                  {isEnrolled ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Enrolled</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectApp(app)}
                      disabled={!hasAccess}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                        hasAccess
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {hasAccess ? (
                        <>
                          <span>Join Track</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Tier Locked</span>
                        </>
                      )}
                    </button>
                  )}

                  {isEnrolled && (
                    <button
                      onClick={() => onOpenReportBug(app)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Report a bug with screenshot"
                    >
                      <Bug className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-slate-900 text-lg mb-1">No testing tracks found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Try adjusting your search query, access tier, or category filter to discover more Android closed beta apps.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedTier('All');
              setStatusFilter('All');
            }}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
