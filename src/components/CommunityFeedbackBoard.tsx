import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FeedbackStatus, FeedbackType, FeatureFeedbackItem } from '../types';
import { 
  MessageSquareHeart, 
  ThumbsUp, 
  MessageSquare, 
  PlusCircle, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Send, 
  Heart,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CommunityFeedbackBoard: React.FC = () => {
  const { 
    featureFeedbacks, 
    comments, 
    apps, 
    currentUser, 
    toggleLikeFeatureFeedback, 
    updateFeatureStatus, 
    createFeatureFeedback, 
    addComment, 
    toggleLikeComment 
  } = useApp();

  const [selectedAppId, setSelectedAppId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(featureFeedbacks[0]?.id || null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New feedback state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAppId, setNewAppId] = useState(apps[0]?.id || '');
  const [newCategory, setNewCategory] = useState<FeedbackType>('feature_request');
  const [newTags, setNewTags] = useState('UI, Feature');

  // Comment input per feedback
  const [commentInputs, setCommentInputs] = useState<{ [feedbackId: string]: string }>({});

  const filteredFeedbacks = featureFeedbacks.filter(item => {
    if (selectedAppId !== 'all' && item.appId !== selectedAppId) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const handleCreateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newAppId) return;

    const targetApp = apps.find(a => a.id === newAppId);
    const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);

    createFeatureFeedback({
      appId: newAppId,
      appName: targetApp ? targetApp.name : 'Android App',
      title: newTitle,
      description: newDescription,
      category: newCategory,
      status: 'under_review',
      tags: tagsArray
    });

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });

    setNewTitle('');
    setNewDescription('');
    setIsCreatingNew(false);
  };

  const handleAddComment = (feedbackId: string) => {
    const text = commentInputs[feedbackId];
    if (!text || !text.trim()) return;

    addComment(feedbackId, text.trim());
    setCommentInputs(prev => ({ ...prev, [feedbackId]: '' }));
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'planned':
        return { label: 'Planned for Build', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'completed':
        return { label: 'Implemented', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'declined':
        return { label: 'Declined', color: 'bg-slate-100 text-slate-600 border-slate-200' };
      default:
        return { label: 'Under Review', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
              Community Feedback Loop
            </span>
            <span className="text-xs text-slate-500">In-App Feature Discussion (No Email or Chat Required)</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Feature Requests & Direct Feedback
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Vote on requested features, propose improvements, and collaborate with developers directly in threaded comments.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isCreatingNew ? 'Close Form' : 'Submit Feature / Idea'}</span>
        </button>
      </div>

      {/* New Feedback Form Box */}
      {isCreatingNew && (
        <form onSubmit={handleCreateFeedback} className="bg-white p-6 rounded-3xl border-2 border-emerald-500/50 shadow-md space-y-4 text-xs">
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Propose a Feature or Usability Improvement</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Android App</label>
              <select
                value={newAppId}
                onChange={(e) => setNewAppId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
              >
                {apps.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Feedback Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
              >
                <option value="feature_request">New Feature Request</option>
                <option value="improvement">Performance / Battery Improvement</option>
                <option value="ux_issue">UX / UI Workflow Suggestion</option>
                <option value="general_feedback">General Beta Feedback</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Idea Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Export telemetry as JSON or WearOS complication customization"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description & User Story</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="Explain why this feature would improve your experience or testing workflow..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="BLE, WearOS, Battery"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
            >
              Publish Proposal
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Filter by App:</span>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="all">All Apps ({featureFeedbacks.length})</option>
              {apps.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="under_review">Under Review</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Implemented</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="feature_request">Feature Request</option>
              <option value="improvement">Improvement</option>
              <option value="ux_issue">UX / UI Suggestion</option>
              <option value="general_feedback">General Feedback</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400">
          Showing {filteredFeedbacks.length} discussions
        </span>
      </div>

      {/* Feature Request & Comments Thread Feed */}
      <div className="space-y-6">
        {filteredFeedbacks.map((item) => {
          const isLiked = item.likedBy.includes(currentUser.id);
          const statusBadge = getStatusBadge(item.status);
          const itemComments = comments.filter(c => c.feedbackId === item.id);
          const isExpanded = expandedFeedbackId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition"
            >
              {/* Main Feedback Item Body */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.authorName}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          item.authorRole === 'developer' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.authorRole}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()} for <strong className="text-slate-700">{item.appName}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Status badge & Dev Status Controller */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>

                    {currentUser.role === 'developer' && (
                      <select
                        value={item.status}
                        onChange={(e) => updateFeatureStatus(item.id, e.target.value as any)}
                        className="text-[11px] border border-slate-300 rounded-lg px-2 py-0.5 bg-slate-50 font-medium"
                        title="Update status as developer"
                      >
                        <option value="under_review">Under Review</option>
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="declined">Declined</option>
                      </select>
                    )}
                  </div>
                </div>

                <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg mb-2">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Bar (Upvote / Like & Comments Toggle) */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    {/* Like / Upvote Button */}
                    <button
                      onClick={() => toggleLikeFeatureFeedback(item.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        isLiked 
                          ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{item.likes} {item.likes === 1 ? 'Upvote' : 'Upvotes'}</span>
                    </button>

                    {/* Toggle Comments */}
                    <button
                      onClick={() => setExpandedFeedbackId(isExpanded ? null : item.id)}
                      className="px-3.5 py-1.5 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>{itemComments.length} Comments</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Direct feedback exchange (no email needed)
                  </span>
                </div>
              </div>

              {/* Threaded Comments Section */}
              {isExpanded && (
                <div className="bg-slate-50/80 p-6 border-t border-slate-200 space-y-4">
                  <div className="space-y-3">
                    {itemComments.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        No comments yet. Be the first to start the feedback thread!
                      </p>
                    ) : (
                      itemComments.map((comm) => {
                        const isCommentLiked = comm.likedBy.includes(currentUser.id);
                        return (
                          <div key={comm.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={comm.authorAvatar}
                                  alt={comm.authorName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span className="font-bold text-slate-900">{comm.authorName}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  comm.authorRole === 'developer' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {comm.authorRole}
                                </span>
                              </div>
                              <span className="text-slate-400 text-[10px]">
                                {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className="text-slate-700 pl-8 leading-relaxed">
                              {comm.content}
                            </p>

                            <div className="pl-8 flex items-center gap-2 pt-1">
                              <button
                                onClick={() => toggleLikeComment(comm.id)}
                                className={`text-[10px] font-semibold flex items-center gap-1 transition ${
                                  isCommentLiked ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${isCommentLiked ? 'fill-rose-600' : ''}`} />
                                <span>{comm.likes > 0 ? comm.likes : 'Like'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex gap-2 pt-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[item.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [item.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(item.id); } }}
                        placeholder="Write constructive feedback, reproduction tip, or suggestion..."
                        className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleAddComment(item.id)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Send</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
