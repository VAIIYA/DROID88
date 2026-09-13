'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppCategory, TesterTier } from '../types';
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
  RefreshCw,
  Copy,
  Check,
  Users,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublishAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Helper to format package names like "com.vaiiya.matchmoji" into "Matchmoji"
const formatPackageToName = (pkg: string): string => {
  if (!pkg) return '';
  const parts = pkg.split('.');
  const lastPart = parts[parts.length - 1] || pkg;
  
  const words = lastPart
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/);

  return words
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

// Generates an adaptive SVG app icon with an initial letter and modern gradient
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

export const PublishAppModal: React.FC<PublishAppModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { publishApp, uploadFileToStorage } = useApp();

  const [name, setName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [versionName, setVersionName] = useState('1.0.0-rc1');
  const [versionCode, setVersionCode] = useState(1);
  const [category, setCategory] = useState<AppCategory>('Productivity');
  const [icon, setIcon] = useState(() => generateAdaptiveSvgIcon('App', 0));
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [testingTrackUrl, setTestingTrackUrl] = useState('');
  const [webOptInUrl, setWebOptInUrl] = useState('');
  const [androidOptInUrl, setAndroidOptInUrl] = useState('');
  const [googleGroupUrl, setGoogleGroupUrl] = useState('https://groups.google.com/g/droid88');
  const [copiedGroupEmail, setCopiedGroupEmail] = useState(false);
  const [requiredTier, setRequiredTier] = useState<TesterTier>('tier_1_standard');
  const [targetTesters, setTargetTesters] = useState(20);
  const [testDurationDays, setTestDurationDays] = useState(14);
  const [minAndroidVersion, setMinAndroidVersion] = useState('Android 11 (API 30)+');

  // Metadata & Icon states
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [iconUploadError, setIconUploadError] = useState<string | null>(null);
  const [autoFillBadge, setAutoFillBadge] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const handleCopyGroupEmail = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText('droid88@googlegroups.com');
      setCopiedGroupEmail(true);
      setTimeout(() => setCopiedGroupEmail(false), 2000);
    }
  };

  // Auto-detect package name, auto-fill app name & icon, and dual URLs
  const handleUrlOrPackageChange = async (val: string) => {
    setTestingTrackUrl(val);

    let detectedPkg = '';
    // Format 1: https://play.google.com/apps/testing/<pkg>
    if (val.includes('/apps/testing/')) {
      detectedPkg = val.split('/apps/testing/')[1]?.split('?')[0]?.split('#')[0] || '';
    } 
    // Format 2: https://play.google.com/store/apps/details?id=<pkg>
    else if (val.includes('id=')) {
      try {
        const u = new URL(val);
        detectedPkg = u.searchParams.get('id') || '';
      } catch {
        const match = val.match(/id=([a-zA-Z0-9_.]+)/);
        if (match) detectedPkg = match[1];
      }
    }
    // Format 3: Raw package name like com.company.app
    else if (/^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/.test(val.trim())) {
      detectedPkg = val.trim();
    }

    if (detectedPkg) {
      setPackageName(detectedPkg);
      setWebOptInUrl(`https://play.google.com/apps/testing/${detectedPkg}`);
      setAndroidOptInUrl(`https://play.google.com/store/apps/details?id=${detectedPkg}`);

      // Auto-derive formatted app name from package name immediately
      const formattedTitle = formatPackageToName(detectedPkg);
      if (!name || name === formatPackageToName(packageName)) {
        setName(formattedTitle);
        // Also generate an adaptive icon using the first letter if using default SVG
        if (icon.startsWith('data:image/svg+xml')) {
          setIcon(generateAdaptiveSvgIcon(formattedTitle, 0));
        }
        setAutoFillBadge(`Auto-detected "${formattedTitle}"`);
      }

      // Fetch official Play Store metadata (if public/pre-reg/open)
      setIsFetchingMetadata(true);
      try {
        const res = await fetch(`/api/play-store-metadata?id=${encodeURIComponent(detectedPkg)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.found) {
            if (data.name) setName(data.name);
            if (data.icon) setIcon(data.icon);
            if (data.description && !shortDescription) setShortDescription(data.description);
            setAutoFillBadge(`Synced details & icon from Google Play for "${data.name}"`);
          }
        }
      } catch (err) {
        console.warn('Could not reach play-store-metadata:', err);
      } finally {
        setIsFetchingMetadata(false);
      }
    }
  };

  // Upload custom app icon file to Supabase Storage
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
        setAutoFillBadge('App icon uploaded successfully');
      } else {
        // Fallback to local Data URL
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

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setIcon(customUrlInput.trim());
      setShowUrlInput(false);
      setCustomUrlInput('');
    }
  };

  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [screenshotUrlInput, setScreenshotUrlInput] = useState('');
  const [showScreenshotUrlInput, setShowScreenshotUrlInput] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotUploadError, setScreenshotUploadError] = useState<string | null>(null);

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
        setScreenshotUploadError(err.message || 'Failed to upload screenshot.');
      }
    }
    setIsUploadingScreenshot(false);
  };

  const handleAddSampleMockups = () => {
    setScreenshots([
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
    ]);
  };

  const [focusPoints, setFocusPoints] = useState<string[]>([
    'In-app billing and subscription restore testing',
    'Background sync and push notification reliability'
  ]);
  const [newFocus, setNewFocus] = useState('');

  if (!isOpen) return null;

  const handleAddFocus = () => {
    if (newFocus.trim()) {
      setFocusPoints([...focusPoints, newFocus.trim()]);
      setNewFocus('');
    }
  };

  const handleRemoveFocus = (index: number) => {
    setFocusPoints(focusPoints.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !packageName || !testingTrackUrl) return;

    publishApp({
      name,
      packageName: packageName.trim().toLowerCase(),
      versionName,
      versionCode: Number(versionCode),
      icon,
      category,
      shortDescription: shortDescription.trim() || `${name} closed testing build for Android.`,
      fullDescription: fullDescription.trim() || `Testing goals: 20 testers for 14 continuous days. Focus on stability and usability.`,
      testingTrackUrl: testingTrackUrl.trim(),
      webOptInUrl: webOptInUrl.trim() || `https://play.google.com/apps/testing/${packageName.trim().toLowerCase()}`,
      androidOptInUrl: androidOptInUrl.trim() || `https://play.google.com/store/apps/details?id=${packageName.trim().toLowerCase()}`,
      googleGroupUrl: googleGroupUrl ? googleGroupUrl.trim() : undefined,
      requiredTier,
      targetTesters: Number(targetTesters) || 20,
      testDurationDays: Number(testDurationDays) || 14,
      testStartDate: new Date().toISOString().split('T')[0],
      testingFocus: focusPoints.length > 0 ? focusPoints : ['General app stability and performance'],
      minAndroidVersion,
      screenshots: screenshots.length > 0 ? screenshots : [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80'
      ]
    });

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="publish-app-modal"
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Publish Android App for Closed Testing</h3>
              <p className="text-xs text-slate-300">Recruit 20 testers for 14 continuous days to satisfy Google Play requirements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Track URL & Package Name Input Card */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Google Play Closed Testing Link</span>
              </div>
              {isFetchingMetadata && (
                <span className="text-[10px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                  Looking up Play Store metadata...
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Paste Google Play Track Link or Package Name <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  Auto-Fills Title & Testing Links
                </span>
              </div>
              <input
                type="text"
                value={testingTrackUrl}
                onChange={(e) => handleUrlOrPackageChange(e.target.value)}
                placeholder="e.g. https://play.google.com/store/apps/details?id=com.vaiiya.matchmoji"
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Paste any Play Console link ("Join on Android" or "Join on the Web") or package ID. We auto-extract both links and the App Name!
              </span>
            </div>

            {/* Auto-fill notification badge */}
            {autoFillBadge && (
              <div className="p-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{autoFillBadge}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Package Name (Application ID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => {
                    const pkg = e.target.value.trim();
                    setPackageName(pkg);
                    if (pkg && !testingTrackUrl) {
                      handleUrlOrPackageChange(pkg);
                    }
                  }}
                  placeholder="com.vaiiya.matchmoji"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex flex-col justify-between p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      Universal DROID88 Tester Group
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Auto-Configured
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                    Add this group email in your <strong>Google Play Console &gt; Closed Testing &gt; Testers</strong> to automatically grant access to all Droid88 testers:
                  </p>
                </div>

                <div className="mt-2.5 flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-emerald-200 font-mono text-xs">
                  <span className="text-emerald-900 font-semibold select-all">droid88@googlegroups.com</span>
                  <button
                    type="button"
                    onClick={handleCopyGroupEmail}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-sans font-bold cursor-pointer"
                  >
                    {copiedGroupEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Dual Play Console Links Preview */}
            {(webOptInUrl || androidOptInUrl) && (
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Generated Play Console Opt-In Links:
                </span>
                <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px] truncate">
                  <span className="font-sans font-bold text-slate-800 shrink-0">Web:</span>
                  <span className="truncate">{webOptInUrl || `https://play.google.com/apps/testing/${packageName}`}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px] truncate">
                  <span className="font-sans font-bold text-slate-800 shrink-0">Android:</span>
                  <span className="truncate">{androidOptInUrl || `https://play.google.com/store/apps/details?id=${packageName}`}</span>
                </div>
              </div>
            )}
          </div>

          {/* App Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                App Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Matchmoji"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
                {packageName && (
                  <button
                    type="button"
                    onClick={() => {
                      const derived = formatPackageToName(packageName);
                      setName(derived);
                      setIcon(generateAdaptiveSvgIcon(derived, 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                    title="Reset title from package name"
                  >
                    Reset from Package
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="Productivity">Productivity</option>
                <option value="Games">Games</option>
                <option value="Tools & Utilities">Tools & Utilities</option>
                <option value="Health & Fitness">Health & Fitness</option>
                <option value="Finance">Finance</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Social">Social</option>
                <option value="Education">Education</option>
              </select>
            </div>
          </div>

          {/* Dedicated App Icon Upload & Selection Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>App Icon (Upload Custom File or Generate)</span>
              </label>
              {isUploadingIcon && (
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading icon to Supabase...
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Squircle Preview */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 p-1 shadow-sm overflow-hidden flex items-center justify-center">
                  <img 
                    src={icon} 
                    alt="App Icon Preview" 
                    className="w-full h-full object-cover rounded-xl" 
                    onError={() => setIcon(generateAdaptiveSvgIcon(name || 'App', 0))}
                  />
                </div>
                <span className="text-[10px] text-slate-400 text-center block mt-1 font-medium">Preview</span>
              </div>

              {/* Action Buttons: File Upload, URL Input, Adaptive Colors */}
              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload App Icon</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleIconFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Link2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{showUrlInput ? 'Hide URL' : 'Paste Image URL'}</span>
                  </button>
                </div>

                {/* Optional Custom Image URL input */}
                {showUrlInput && (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://example.com/my-icon.png"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Adaptive Theme Color Swatches if no custom upload yet */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">Or generate adaptive initial:</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((colorIdx) => (
                      <button
                        key={colorIdx}
                        type="button"
                        onClick={() => setIcon(generateAdaptiveSvgIcon(name || 'App', colorIdx))}
                        className="w-5 h-5 rounded-full overflow-hidden border border-slate-300 hover:scale-110 transition cursor-pointer"
                        title={`Generate theme style ${colorIdx + 1}`}
                      >
                        <img 
                          src={generateAdaptiveSvgIcon(name || 'App', colorIdx)} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {iconUploadError && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{iconUploadError}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dedicated App Screenshots & Previews Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>App Screenshots & UI Previews</span>
              </label>
              <div className="flex items-center gap-2">
                {isUploadingScreenshot && (
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-medium">
                  {screenshots.length} / 6 added
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Provide phone mockups or UI screenshots so testers know what your app looks like. Paste image URLs or upload files.
            </p>

            {/* Screenshots Thumbnails Gallery */}
            {screenshots.length > 0 ? (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {screenshots.map((shot, idx) => (
                  <div key={idx} className="relative group shrink-0 w-24 h-40 rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-xs">
                    <img
                      src={shot}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(idx)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md cursor-pointer transition"
                        title="Remove screenshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-500">No custom screenshots added yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">High-quality phone mockups will be used if left empty, or add your own below.</p>
              </div>
            )}

            {/* Action Bar: Upload File, Paste URL Toggle, Sample Mockups */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Upload Screenshot</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleScreenshotFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowScreenshotUrlInput(!showScreenshotUrlInput)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Link2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showScreenshotUrlInput ? 'Hide URL Input' : 'Paste Image URL'}</span>
                </button>

                {screenshots.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddSampleMockups}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Use Sample Phone Mockups</span>
                  </button>
                )}
              </div>

              {/* URL Input Row */}
              {showScreenshotUrlInput && (
                <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                  <input
                    type="url"
                    value={screenshotUrlInput}
                    onChange={(e) => setScreenshotUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddScreenshotUrl(); } }}
                    placeholder="https://example.com/screenshot.png"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddScreenshotUrl}
                    disabled={!screenshotUrlInput.trim()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}

              {screenshotUploadError && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{screenshotUploadError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Version and Min OS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Version Name</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="1.0.0-rc1"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Version Code</label>
              <input
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Min Android OS</label>
              <input
                type="text"
                value={minAndroidVersion}
                onChange={(e) => setMinAndroidVersion(e.target.value)}
                placeholder="Android 11 (API 30)+"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tier Access and Target Testers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Required Tester Access Tier
              </label>
              <select
                value={requiredTier}
                onChange={(e) => setRequiredTier(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="tier_1_standard">Tier 1: Standard (All Community Testers)</option>
                <option value="tier_2_verified">Tier 2: Verified Beta Testers Only</option>
                <option value="tier_3_core">Tier 3: Core QA & Internal VIPs Only</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Google Play requires 20 opted-in testers for 14 continuous days.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Testers Benchmark
              </label>
              <input
                type="number"
                value={targetTesters}
                onChange={(e) => setTargetTesters(Number(e.target.value))}
                min={5}
                max={100}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard: 20 testers for 14 continuous days.
              </span>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Short Summary / Pitch
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Fast emoji-matching memory puzzle with Google Play Games leaderboards."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Testing Instructions & Details
            </label>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={3}
              placeholder="Detail testing goals, known caveats, sandbox credentials, or what testers should pay attention to..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Testing Focus Points */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Testing Focus Areas (What testers should verify)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFocus}
                onChange={(e) => setNewFocus(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFocus(); } }}
                placeholder="e.g. Test on 120Hz displays and Android 14 back gesture..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddFocus}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5">
              {focusPoints.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-700 font-medium">• {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFocus(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              Publish to Closed Testing Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
