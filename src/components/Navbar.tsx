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
  activeTab: 'catalog' | 'tester_hub' | 'dev_dashboard' | 'dev_profile' | 'community' | 'analytics' | 'app_detail';
  setActiveTab: (tab: any) => void;
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
  const myEnrolledApps = currentUser ? enrollments.filter(e => e.testerId === currentUser.id) : [];
  const myDevApps = currentUser ? apps.filter(a => a.developerId === currentUser.id) : [];

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

  const tierBadge = currentUser ? getTierBadge(currentUser.testerTier) : null;

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
            {currentUser ? (
              <button
                onClick={onOpenGoogleAuth}
                className="text-slate-300 hover:text-white underline transition flex items-center gap-1.5 cursor-pointer max-w-[220px] sm:max-w-none truncate"
              >
                <span className="truncate">{currentUser.developerAccountName || currentUser.name}</span>
                <span className="text-emerald-400 shrink-0">({currentUser.role})</span>
              </button>
            ) : (
              <button
                onClick={onOpenGoogleAuth}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
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

            {/* Google User Profile Button or Sign In Button */}
            {currentUser ? (
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
                    <span className="text-emerald-600 font-medium">Online</span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenGoogleAuth}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer border border-slate-800"
                title="Sign In or Register with GitHub"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-white">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="hidden sm:inline">Sign In / Register</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
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
