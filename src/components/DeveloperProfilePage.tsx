import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, AppListing } from '../types';
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
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
    updateDeveloperProfile, 
    signInWithFirebaseGoogle, 
    signOutFromFirebase,
    firebaseUser 
  } = useApp();

  // Determine which developer profile we are looking at
  const profileUser: User = targetDeveloperId 
    ? allUsers.find(u => u.id === targetDeveloperId) || currentUser 
    : currentUser;

  const isOwnProfile = profileUser.id === currentUser.id;

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form Fields
  const [developerAccountName, setDeveloperAccountName] = useState(profileUser.developerAccountName || `${profileUser.name} Studios`);
  const [company, setCompany] = useState(profileUser.company || '');
  const [bio, setBio] = useState(profileUser.bio || 'Android developer managing closed testing tracks and beta tester feedback on Google Play.');
  const [website, setWebsite] = useState(profileUser.website || '');
  const [contactEmail, setContactEmail] = useState(profileUser.contactEmail || profileUser.email);
  const [googlePlayConsoleDevId, setGooglePlayConsoleDevId] = useState(profileUser.googlePlayConsoleDevId || '');
  const [deviceModel, setDeviceModel] = useState(profileUser.deviceInfo?.model || 'Google Pixel 8 Pro');
  const [osVersion, setOsVersion] = useState(profileUser.deviceInfo?.osVersion || 'Android 14 (API 34)');

  // Keep form in sync if profileUser changes
  useEffect(() => {
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
  const developerApps = apps.filter(a => 
    a.developerId === profileUser.id || 
    (profileUser.developerAccountName && a.developerName.toLowerCase() === profileUser.developerAccountName.toLowerCase())
  );

  const totalTestersRecruited = developerApps.reduce((sum, a) => sum + a.currentTesters, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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

      setIsSaving(false);
      setSaveSuccess(true);
      setIsEditing(false);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving developer profile:', err);
      setIsSaving(false);
    }
  };

  const handleGoogleConnect = async () => {
    setAuthError(null);
    try {
      await signInWithFirebaseGoogle();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      setAuthError(err.message || 'Google Sign-in was cancelled or blocked by popup settings.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button if viewing another developer */}
      {!isOwnProfile && onBackToCatalog && (
        <button
          onClick={onBackToCatalog}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
        >
          <span>← Back to All Closed Testing Tracks</span>
        </button>
      )}

      {/* Main Developer Identity Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover Canvas Gradient */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 relative p-6 flex items-end justify-between">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Cloud Firestore Persistence Pill */}
            <span className="bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Firestore Persistent Profile</span>
            </span>

            {profileUser.verifiedDeveloper && (
              <span className="bg-emerald-500/30 backdrop-blur-md border border-emerald-400/50 text-emerald-300 text-[11px] px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Android Developer</span>
              </span>
            )}
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-100"
                />
                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                    {profileUser.developerAccountName || `${profileUser.name} Studios`}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Account Owner: {profileUser.name}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">{profileUser.email}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold capitalize">Role: {profileUser.role}</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isEditing 
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Cancel Editing' : 'Edit Developer Name & Details'}</span>
                  </button>

                  <button
                    onClick={onOpenPublishModal}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+ Publish Track</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Developer Profile Updated!</strong> Your developer account name and studio details have been synchronized persistently to Cloud Firestore.
              </div>
            </div>
          )}

          {/* Google Auth Status & Connect Box */}
          {isOwnProfile && (
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {firebaseUser ? `Connected as ${firebaseUser.email}` : `Persistent Google Profile (${currentUser.email})`}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                      {firebaseUser ? 'Firebase Auth Live' : 'Active Account'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Developer credentials and published tracks are linked to this Google identity.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoogleConnect}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{firebaseUser ? 'Switch Google Account' : 'Sign in with Google'}</span>
                </button>

                {firebaseUser && (
                  <button
                    onClick={signOutFromFirebase}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Sign Out from Firebase"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Edit Profile Form OR View Profile Info */}
          {isEditing ? (
            <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm">
                    Configure Developer Account & Studio Information
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Set your public Android developer account name and studio details.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving to Firestore...' : 'Save Changes'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Developer Account Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Developer Account Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={developerAccountName}
                    onChange={(e) => setDeveloperAccountName(e.target.value)}
                    placeholder="e.g. Nordic Byte Labs or PixelCraft Devs"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block">
                    This is your public studio / developer brand name displayed across the WooCommerce catalog.
                  </span>
                </div>

                {/* Company / Legal Entity */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Organization / Studio Entity
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Nordic Byte Labs LLC"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Optional studio entity or indie label name.
                  </span>
                </div>

                {/* Google Play Console Developer Account ID */}
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
                  <span className="text-[10px] text-slate-500 block">
                    Found in Google Play Console Account Settings.
                  </span>
                </div>

                {/* Public Website / Portfolio */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Developer Website / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://nordicbyte.dev"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Public Support / Contact Email */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Public Support / Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="dev@nordicbyte.dev"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Android Testing Hardware */}
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

              {/* Bio */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Studio Biography & Testing Mission
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell your beta testers about what you are building, architectural choices (Jetpack Compose, Kotlin Multiplatform), and focus areas..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  {isSaving ? 'Saving...' : 'Save & Publish Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
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
                  <span className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
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
      </div>

      {/* Aggregate Developer Track Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Tracks</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              {developerApps.length}
            </span>
            <span className="text-xs text-slate-400">Android apps</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block">
            Google Play closed tracks
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Community Testers</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-indigo-700">
              {totalTestersRecruited}
            </span>
            <span className="text-xs text-slate-400">total opt-ins</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Across active closed tracks
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">14-Day Progress</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-amber-600">
              Day 8
            </span>
            <span className="text-xs text-slate-400">of 14</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium block">
            Continuous daily check-ins
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">QA Reputation</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-emerald-700">
              {profileUser.reputationScore}
            </span>
            <span className="text-xs text-slate-400">points</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block">
            Ranked community member
          </span>
        </div>
      </div>

      {/* Developer's Closed Testing Tracks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>
                {isOwnProfile ? 'My Published Closed Testing Tracks' : `Apps by ${profileUser.developerAccountName || profileUser.name}`} ({developerApps.length})
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Open tracks for Google Play closed testing with direct opt-in links and automated feedback milestones.
            </p>
          </div>

          {isOwnProfile && (
            <button
              onClick={onOpenPublishModal}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>+ Post New Track</span>
            </button>
          )}
        </div>

        {developerApps.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Smartphone className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-display font-bold text-slate-800 text-base">No closed testing tracks published yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Publish your Google Play Console track link to recruit 20 beta testers for the required 14-day test cycle.
            </p>
            {isOwnProfile && (
              <button
                onClick={onOpenPublishModal}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Publish Your First Track
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developerApps.map((app) => {
              const testersPct = Math.min(100, Math.round((app.currentTesters / app.targetTesters) * 100));

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 space-y-4">
                    {/* Top Row: Icon, Name, Category */}
                    <div className="flex items-start gap-3">
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-2xs shrink-0 group-hover:scale-105 transition duration-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {app.category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                            v{app.versionName}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-slate-900 text-base leading-snug truncate">
                          {app.name}
                        </h3>
                        <span className="text-xs font-mono text-slate-400 block truncate">
                          {app.packageName}
                        </span>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {app.shortDescription}
                    </p>

                    {/* 20-Tester Closed Benchmark Progress */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tester Recruitment</span>
                        </span>
                        <span className="font-bold text-slate-900">
                          {app.currentTesters} / {app.targetTesters}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${testersPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{testersPct}% reached</span>
                        <span>{app.targetTesters - app.currentTesters > 0 ? `${app.targetTesters - app.currentTesters} more needed` : 'Goal Satisfied'}</span>
                      </div>
                    </div>

                    {/* Google Play Closed Track Opt-in */}
                    <a
                      href={app.testingTrackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold truncate hover:underline"
                    >
                      <span>Google Play Opt-in Track</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onSelectApp(app)}
                      className="font-bold text-slate-800 hover:text-emerald-700 transition flex items-center gap-1"
                    >
                      <span>View App Track</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[11px] text-slate-400">
                      Added {app.createdAt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
