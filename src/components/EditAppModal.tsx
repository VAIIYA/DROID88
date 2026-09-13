'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppListing, AppCategory, TesterTier } from '../types';
import { 
  X, 
  Sparkles, 
  Smartphone, 
  Trash2, 
  Upload,
  Image as ImageIcon,
  Link2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Users,
  Plus,
  Edit3,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppListing;
  onSuccess?: (updatedApp: AppListing) => void;
}

const CATEGORIES: AppCategory[] = [
  'Productivity',
  'Health & Fitness',
  'Tools & Utilities',
  'Games',
  'Finance',
  'Social',
  'Education',
  'Lifestyle'
];

// Helper to generate an adaptive SVG icon
const generateAdaptiveSvgIcon = (title: string, colorIndex: number = 0): string => {
  const initial = title ? title.trim().charAt(0).toUpperCase() : 'A';
  
  const gradients = [
    { start: '#10b981', end: '#047857' }, // Emerald
    { start: '#6366f1', end: '#4338ca' }, // Indigo
    { start: '#f59e0b', end: '#b45309' }, // Amber
    { start: '#ec4899', end: '#be185d' }, // Pink
    { start: '#06b6d4', end: '#0e7490' }, // Cyan
    { start: '#3b82f6', end: '#1d4ed8' }, // Blue
  ];

  const { start, end } = gradients[colorIndex % gradients.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${start}"/>
        <stop offset="100%" stop-color="${end}"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="30" fill="url(#grad)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="68" font-weight="800" fill="#ffffff">${initial}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const EditAppModal: React.FC<EditAppModalProps> = ({
  isOpen,
  onClose,
  app,
  onSuccess
}) => {
  const { updateApp, uploadFileToStorage } = useApp();

  // Form states initialized with app props
  const [name, setName] = useState(app.name);
  const [packageName, setPackageName] = useState(app.packageName);
  const [versionName, setVersionName] = useState(app.versionName);
  const [versionCode, setVersionCode] = useState(app.versionCode);
  const [category, setCategory] = useState<AppCategory>(app.category);
  const [icon, setIcon] = useState(app.icon);
  const [shortDescription, setShortDescription] = useState(app.shortDescription);
  const [fullDescription, setFullDescription] = useState(app.fullDescription);
  const [testingTrackUrl, setTestingTrackUrl] = useState(app.testingTrackUrl || '');
  const [webOptInUrl, setWebOptInUrl] = useState(app.webOptInUrl || '');
  const [androidOptInUrl, setAndroidOptInUrl] = useState(app.androidOptInUrl || '');
  const [googleGroupUrl, setGoogleGroupUrl] = useState(app.googleGroupUrl || 'https://groups.google.com/g/droid88');
  const [requiredTier, setRequiredTier] = useState<TesterTier>(app.requiredTier || 'tier_1_standard');
  const [targetTesters, setTargetTesters] = useState(app.targetTesters || 20);
  const [testDurationDays, setTestDurationDays] = useState(app.testDurationDays || 14);
  const [minAndroidVersion, setMinAndroidVersion] = useState(app.minAndroidVersion || 'Android 11 (API 30)+');
  const [status, setStatus] = useState(app.status || 'active_testing');

  // Focus areas
  const [testingFocus, setTestingFocus] = useState<string[]>(app.testingFocus || []);
  const [newFocusItem, setNewFocusItem] = useState('');

  // Screenshots state
  const [screenshots, setScreenshots] = useState<string[]>(app.screenshots || []);
  const [screenshotUrlInput, setScreenshotUrlInput] = useState('');
  const [showScreenshotUrlInput, setShowScreenshotUrlInput] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotUploadError, setScreenshotUploadError] = useState<string | null>(null);

  // Icon edit state
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [iconUploadError, setIconUploadError] = useState<string | null>(null);
  const [showIconUrlInput, setShowIconUrlInput] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState('');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedGroupEmail, setCopiedGroupEmail] = useState(false);

  // Sync state whenever the modal opens or app changes
  useEffect(() => {
    if (isOpen && app) {
      setName(app.name);
      setPackageName(app.packageName);
      setVersionName(app.versionName);
      setVersionCode(app.versionCode);
      setCategory(app.category);
      setIcon(app.icon);
      setShortDescription(app.shortDescription);
      setFullDescription(app.fullDescription);
      setTestingTrackUrl(app.testingTrackUrl || '');
      setWebOptInUrl(app.webOptInUrl || (app.packageName ? `https://play.google.com/apps/testing/${app.packageName}` : ''));
      setAndroidOptInUrl(app.androidOptInUrl || (app.packageName ? `https://play.google.com/store/apps/details?id=${app.packageName}` : ''));
      setGoogleGroupUrl(app.googleGroupUrl || 'https://groups.google.com/g/droid88');
      setRequiredTier(app.requiredTier || 'tier_1_standard');
      setTargetTesters(app.targetTesters || 20);
      setTestDurationDays(app.testDurationDays || 14);
      setMinAndroidVersion(app.minAndroidVersion || 'Android 11 (API 30)+');
      setStatus(app.status || 'active_testing');
      setTestingFocus(app.testingFocus || []);
      setScreenshots(app.screenshots || []);
      setErrorMessage(null);
    }
  }, [isOpen, app]);

  if (!isOpen) return null;

  const handleCopyGroupEmail = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText('droid88@googlegroups.com');
      setCopiedGroupEmail(true);
      setTimeout(() => setCopiedGroupEmail(false), 2000);
    }
  };

  // Icon file upload
  const handleIconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setIconUploadError('Please select a valid image file (PNG, WebP, JPG, or SVG).');
      return;
    }

    setIconUploadError(null);
    setIsUploadingIcon(true);

    try {
      const publicUrl = await uploadFileToStorage('app-icons', file);
      if (publicUrl) {
        setIcon(publicUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) setIcon(ev.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setIconUploadError(err.message || 'Failed to upload icon.');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleApplyCustomIconUrl = () => {
    if (customIconUrl.trim()) {
      setIcon(customIconUrl.trim());
      setShowIconUrlInput(false);
      setCustomIconUrl('');
    }
  };

  // Screenshot upload & management
  const handleAddScreenshotUrl = () => {
    if (screenshotUrlInput.trim()) {
      setScreenshots(prev => [...prev, screenshotUrlInput.trim()]);
      setScreenshotUrlInput('');
      setShowScreenshotUrlInput(false);
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleScreenshotFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingScreenshot(true);
    setScreenshotUploadError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const publicUrl = await uploadFileToStorage('bug-screenshots', file);
        if (publicUrl) {
          setScreenshots(prev => [...prev, publicUrl]);
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              setScreenshots(prev => [...prev, ev.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (err: any) {
        setScreenshotUploadError(err.message || 'Failed to upload screenshot');
      }
    }
    setIsUploadingScreenshot(false);
  };

  // Testing focus bullets
  const handleAddFocusItem = () => {
    if (newFocusItem.trim() && !testingFocus.includes(newFocusItem.trim())) {
      setTestingFocus(prev => [...prev, newFocusItem.trim()]);
      setNewFocusItem('');
    }
  };

  const handleRemoveFocusItem = (index: number) => {
    setTestingFocus(prev => prev.filter((_, i) => i !== index));
  };

  // Submit edits
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter an app name.');
      return;
    }
    if (!shortDescription.trim()) {
      setErrorMessage('Please enter a short description.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updatedFields: Partial<AppListing> = {
        name: name.trim(),
        packageName: packageName.trim(),
        versionName: versionName.trim(),
        versionCode: Number(versionCode) || 1,
        category,
        icon,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        testingTrackUrl: testingTrackUrl.trim(),
        webOptInUrl: webOptInUrl.trim() || (packageName.trim() ? `https://play.google.com/apps/testing/${packageName.trim()}` : testingTrackUrl.trim()),
        androidOptInUrl: androidOptInUrl.trim() || (packageName.trim() ? `https://play.google.com/store/apps/details?id=${packageName.trim()}` : undefined),
        googleGroupUrl: googleGroupUrl.trim() || 'https://groups.google.com/g/droid88',
        requiredTier,
        targetTesters: Number(targetTesters) || 20,
        testDurationDays: Number(testDurationDays) || 14,
        minAndroidVersion: minAndroidVersion.trim(),
        testingFocus,
        screenshots,
        status
      };

      const updated = await updateApp(app.id, updatedFields);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (onSuccess && updated) {
        onSuccess(updated);
      }
      onClose();
    } catch (err: any) {
      console.error('Error updating app:', err);
      setErrorMessage(err.message || 'Failed to update app details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Edit App Details</h2>
              <p className="text-xs text-slate-500">
                Update details, URLs, descriptions, or fix typos for <span className="font-semibold text-slate-700">{app.name}</span>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. App Identity & Icon */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Basic Information</h3>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              {/* Icon Preview */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <img 
                  src={icon} 
                  alt={name || 'App icon'} 
                  className="w-20 h-20 rounded-2xl border-2 border-white shadow-md object-cover bg-white"
                />
                <button
                  type="button"
                  onClick={() => setIcon(generateAdaptiveSvgIcon(name || 'App', Math.floor(Math.random() * 6)))}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Generate Icon
                </button>
              </div>

              {/* Icon Options */}
              <div className="flex-1 space-y-2.5 w-full">
                <label className="block text-xs font-bold text-slate-700">App Icon</label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer shadow-2xs transition">
                    {isUploadingIcon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleIconFileUpload} 
                      className="hidden" 
                      disabled={isUploadingIcon}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowIconUrlInput(!showIconUrlInput)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Enter Image URL</span>
                  </button>
                </div>

                {iconUploadError && (
                  <p className="text-rose-600 text-xs">{iconUploadError}</p>
                )}

                {showIconUrlInput && (
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="url"
                      value={customIconUrl}
                      onChange={(e) => setCustomIconUrl(e.target.value)}
                      placeholder="https://example.com/icon.png"
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomIconUrl}
                      className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  App Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Matchmoji"
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Package Name (Application ID)
                </label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g. com.vaiiya.matchmoji"
                  className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AppCategory)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Version Name</label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="1.0.0"
                  className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Version Code</label>
                <input
                  type="number"
                  min="1"
                  value={versionCode}
                  onChange={(e) => setVersionCode(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Descriptions */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Descriptions</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Short Description / Tagline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A high-intensity emoji matching memory puzzle."
                className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Description & Testing Instructions
              </label>
              <textarea
                rows={4}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Describe your app features, rules, what testers should try out, known bugs, or test account credentials..."
                className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Google Play Testing URLs & Group */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Google Play Opt-In & Universal Group</h3>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                1-Click Seamless Testing
              </span>
            </div>

            {/* DROID88 Universal Group callout */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>DROID88 Universal Google Group</span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Add <span className="font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded border border-emerald-300">droid88@googlegroups.com</span> to your closed test track in Google Play Console.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyGroupEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer shrink-0"
              >
                {copiedGroupEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGroupEmail ? 'Email Copied!' : 'Copy Group Email'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Group URL
                </label>
                <input
                  type="url"
                  value={googleGroupUrl}
                  onChange={(e) => setGoogleGroupUrl(e.target.value)}
                  placeholder="https://groups.google.com/g/droid88"
                  className="w-full text-xs font-mono px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Web Opt-In URL (Join on the web)
                  </label>
                  <input
                    type="url"
                    value={webOptInUrl}
                    onChange={(e) => setWebOptInUrl(e.target.value)}
                    placeholder={`https://play.google.com/apps/testing/${packageName || 'package'}`}
                    className="w-full text-xs font-mono px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Play Console format: https://play.google.com/apps/testing/[package]
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Android Opt-In URL (Join on Android)
                  </label>
                  <input
                    type="url"
                    value={androidOptInUrl}
                    onChange={(e) => setAndroidOptInUrl(e.target.value)}
                    placeholder={`https://play.google.com/store/apps/details?id=${packageName || 'package'}`}
                    className="w-full text-xs font-mono px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Play Store format: https://play.google.com/store/apps/details?id=[package]
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Testing Focus Bullet Points */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Key Testing Focus Areas</h3>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFocusItem}
                onChange={(e) => setNewFocusItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFocusItem();
                  }
                }}
                placeholder="e.g. Onboarding flow, Push notifications, Offline mode..."
                className="flex-1 text-xs font-medium px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddFocusItem}
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {testingFocus.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {testingFocus.map((item, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-xl font-medium"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFocusItem(idx)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5. Screenshots & UI Previews */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">5. Screenshots & UI Previews</h3>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer shadow-2xs transition">
                  {isUploadingScreenshot ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  <span>Upload Files</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleScreenshotFileUpload}
                    className="hidden"
                    disabled={isUploadingScreenshot}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowScreenshotUrlInput(!showScreenshotUrlInput)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                >
                  <Link2 className="w-3 h-3" />
                  <span>Add URL</span>
                </button>
              </div>
            </div>

            {showScreenshotUrlInput && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="url"
                  value={screenshotUrlInput}
                  onChange={(e) => setScreenshotUrlInput(e.target.value)}
                  placeholder="https://example.com/screenshot.png"
                  className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddScreenshotUrl}
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}

            {screenshotUploadError && (
              <p className="text-rose-600 text-xs">{screenshotUploadError}</p>
            )}

            {screenshots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
                {screenshots.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-9/16">
                    <img 
                      src={url} 
                      alt={`Screenshot ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer opacity-80 hover:opacity-100"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No screenshots added yet. Add screenshot URLs or upload images to give testers a preview.
              </p>
            )}
          </div>

          {/* 6. Settings & Requirements */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">6. Track Requirements & Status</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Testers</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetTesters}
                  onChange={(e) => setTargetTesters(parseInt(e.target.value) || 20)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Google Play requires 20</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Android OS</label>
                <input
                  type="text"
                  value={minAndroidVersion}
                  onChange={(e) => setMinAndroidVersion(e.target.value)}
                  placeholder="Android 11 (API 30)+"
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Track Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 bg-white shadow-2xs cursor-pointer"
                >
                  <option value="active_testing">Active Testing</option>
                  <option value="target_met">Target Met (20+)</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
