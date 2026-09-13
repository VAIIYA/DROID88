import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  Store, 
  LayoutDashboard, 
  MessageSquareHeart, 
  MessageSquare,
  TrendingUp, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle, 
  Building2,
  Users,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'tester_hub' | 'dev_dashboard' | 'dev_profile' | 'community' | 'analytics';
  setActiveTab: (tab: 'catalog' | 'tester_hub' | 'dev_dashboard' | 'dev_profile' | 'community' | 'analytics') => void;
  onOpenPublish: () => void;
  onOpenGoogleAuth: () => void;
  onOpenOwnProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPublish,
  onOpenGoogleAuth,
  onOpenOwnProfile
}) => {
  const { currentUser, apps, enrollments, supabaseUser } = useApp();

  // Calculate active counts
  const myEnrolledApps = enrollments.filter(e => e.testerId === currentUser.id);
  const myDevApps = apps.filter(a => a.developerId === currentUser.id);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'tier_3_core':
        return { label: 'Core QA VIP', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'tier_2_verified':
        return { label: 'Verified Beta', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Standard Tester', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const tierBadge = getTierBadge(currentUser.testerTier);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs w-full overflow-hidden">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/30">
              <CheckCircle className="w-3 h-3" />
              Google Play 14-Day 20-Tester Hub
            </span>
            <span className="hidden md:inline text-slate-400">
              Android Closed Testing Exchange & Community
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400 hidden sm:inline">
              <strong className="text-emerald-400 font-semibold">{apps.length} Tracks</strong> Active
            </span>
            <button
              onClick={onOpenGoogleAuth}
              className="text-slate-300 hover:text-white underline transition flex items-center gap-1.5 cursor-pointer max-w-[220px] sm:max-w-none truncate"
            >
              <span className="truncate">{currentUser.developerAccountName || currentUser.name}</span>
              <span className="text-emerald-400 shrink-0">({currentUser.role})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-tight text-slate-900">
                  DROID<span className="text-emerald-600">88</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Beta
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">Closed Testing Community</p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Catalog</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {apps.length}
              </span>
            </button>

            <button
              onClick={onOpenOwnProfile}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dev_profile'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Dev Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('tester_hub')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tester_hub'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>14-Day Tester Hub</span>
              {myEnrolledApps.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {myEnrolledApps.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dev_dashboard')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dev_dashboard'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Developer Console</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Feature Board</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Publish App CTA */}
            <button
              onClick={onOpenPublish}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
              title="Post your closed testing track"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Publish Track</span>
              <span className="sm:hidden">Publish</span>
            </button>

            {/* Google User Profile Button */}
            <button
              onClick={onOpenOwnProfile}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer text-left"
              title="Open Developer Profile"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="hidden xl:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                    {currentUser.developerAccountName || currentUser.name}
                  </span>
                  {currentUser.verifiedDeveloper && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="font-semibold text-indigo-700 capitalize">{currentUser.role}</span>
                  <span>•</span>
                  <span className="text-slate-400 font-mono">Google Connected</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'catalog' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            Catalog ({apps.length})
          </button>
          <button
            onClick={onOpenOwnProfile}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'dev_profile' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-slate-600'
            }`}
          >
            Dev Profile
          </button>
          <button
            onClick={() => setActiveTab('tester_hub')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'tester_hub' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Tester Hub ({myEnrolledApps.length})
          </button>
          <button
            onClick={() => setActiveTab('dev_dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'dev_dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'community' ? 'bg-rose-50 text-rose-700' : 'text-slate-600'
            }`}
          >
            Feedback
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'analytics' ? 'bg-amber-50 text-amber-700' : 'text-slate-600'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
};
