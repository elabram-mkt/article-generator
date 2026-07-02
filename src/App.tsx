import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Share2,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  FileText,
  Copy,
  Check,
  Send,
  Linkedin,
  Twitter,
  Facebook,
  MessageSquare,
  HelpCircle,
  Layers,
  ChevronRight,
  CalendarDays,
  X
} from 'lucide-react';
import { Article, ScheduledPost, HR_TOPICS, TONE_OPTIONS, HRTopic } from './types';
import MarkdownRenderer from './components/MarkdownRenderer';
import SocialPlatformPreview from './components/SocialPlatformPreview';

export default function App() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'calendar'>('generate');

  // API Status & Core Data
  const [apiHealth, setApiHealth] = useState<{ checked: boolean; ok: boolean; hasApiKey: boolean }>({
    checked: false,
    ok: false,
    hasApiKey: false,
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [schedules, setSchedules] = useState<ScheduledPost[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Form State: Generation
  const [selectedTopicId, setSelectedTopicId] = useState<string>(HR_TOPICS[0].id);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [targetAudience, setTargetAudience] = useState('HR professionals, team leads, and people managers');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Generated Result Draft State
  const [draftArticle, setDraftArticle] = useState<{
    title: string;
    content: string;
    topic: string;
    suggestedBlurbs: { platform: 'LinkedIn' | 'Twitter/X' | 'Facebook' | 'Slack'; text: string }[];
  } | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  
  // Save status indicator
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State: Scheduling
  const [selectedArticleForSchedule, setSelectedArticleForSchedule] = useState<Article | null>(null);
  const [scheduleText, setScheduleText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<('LinkedIn' | 'Twitter/X' | 'Facebook' | 'Slack')[]>(['LinkedIn']);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // View Overlay/Detail
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Rotate helpful loading statements for delight and context
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const loadingTips = [
    "Analyzing recent workplace trends and organizational psychology literature...",
    "Drafting clear, empathetic headings to keep employees highly engaged...",
    "Injecting SEO keywords and action-oriented takeaways for people leaders...",
    "Tailoring high-impact social copy for LinkedIn, Slack, Facebook, and Twitter/X...",
    "Polishing the tone to match your selected publishing voice..."
  ];

  // Fetch initial health and core data
  useEffect(() => {
    checkHealth();
    fetchArticles();
    fetchSchedules();
  }, []);

  // Interval for changing loading tips
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingTipIndex(prev => (prev + 1) % loadingTips.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiHealth({ checked: true, ok: data.status === 'ok', hasApiKey: data.hasApiKey });
    } catch {
      setApiHealth({ checked: true, ok: false, hasApiKey: false });
    }
  };

  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (e) {
      console.error("Error fetching articles:", e);
    } finally {
      setLoadingArticles(false);
    }
  };

  const fetchSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const res = await fetch('/api/schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (e) {
      console.error("Error fetching schedules:", e);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Preset quick-select triggers
  const handleSelectPresetTopic = (id: string) => {
    setSelectedTopicId(id);
    setCustomTopic('');
    const topicObj = HR_TOPICS.find(t => t.id === id);
    if (topicObj) {
      setKeywordsInput(topicObj.keywords.join(', '));
    }
  };

  // Trigger Gemini AI Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationError(null);
    setDraftArticle(null);
    setSaveSuccess(false);

    const activeTopicObj = HR_TOPICS.find(t => t.id === selectedTopicId);
    const chosenTopic = customTopic ? customTopic : (activeTopicObj ? activeTopicObj.name : '');
    const keywordsArray = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: chosenTopic,
          tone: selectedTone,
          length: selectedLength,
          audience: targetAudience,
          keywords: keywordsArray,
          customTopic: customTopic || undefined
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate content');
      }

      const data = await res.json();
      setDraftArticle({
        title: data.title,
        content: data.content,
        topic: chosenTopic,
        suggestedBlurbs: data.suggestedBlurbs || []
      });

      // Prepare edit states immediately
      setEditedTitle(data.title);
      setEditedContent(data.content);
    } catch (error: any) {
      console.error(error);
      setGenerationError(error.message || 'An unexpected error occurred while communicating with Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save freshly generated article to local library
  const handleSaveToLibrary = async () => {
    if (!draftArticle) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle || draftArticle.title,
          content: editedContent || draftArticle.content,
          topic: draftArticle.topic,
          tone: selectedTone,
          length: selectedLength,
          audience: targetAudience,
          keywords: keywordsInput.split(',').map(k => k.trim()).filter(Boolean),
          suggestedBlurbs: draftArticle.suggestedBlurbs
        }),
      });

      if (res.ok) {
        const savedArt = await res.json();
        setArticles(prev => [savedArt, ...prev]);
        setSaveSuccess(true);
        // Automatically prefill the scheduling workflow
        setSelectedArticleForSchedule(savedArt);
        const firstBlurb = draftArticle.suggestedBlurbs.find(b => b.platform === 'LinkedIn')?.text || draftArticle.suggestedBlurbs[0]?.text || '';
        setScheduleText(firstBlurb);
      }
    } catch (e) {
      console.error("Error saving article:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete article
  const handleDeleteArticle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this article? This will also cancel any scheduled posts pointing to it.")) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(prev => prev.filter(art => art.id !== id));
        fetchSchedules(); // refresh schedules in case any status was updated to cancelled
        if (viewingArticle?.id === id) {
          setViewingArticle(null);
        }
        if (selectedArticleForSchedule?.id === id) {
          setSelectedArticleForSchedule(null);
          setScheduleText('');
        }
      }
    } catch (e) {
      console.error("Error deleting article:", e);
    }
  };

  // Schedule social post trigger
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleText.trim()) return;
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one social media platform.");
      return;
    }
    if (!scheduleDateTime) {
      alert("Please select a valid future date and time for publication.");
      return;
    }

    setIsSubmittingSchedule(true);
    setScheduleSuccess(false);

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: selectedArticleForSchedule?.id,
          articleTitle: selectedArticleForSchedule?.title || "Standalone Promotion",
          text: scheduleText,
          platforms: selectedPlatforms,
          scheduledAt: new Date(scheduleDateTime).toISOString(),
        }),
      });

      if (res.ok) {
        const newSch = await res.json();
        setSchedules(prev => [newSch, ...prev]);
        setScheduleSuccess(true);
        setScheduleDateTime('');
        // Alert briefly or keep visual checklist
        setTimeout(() => setScheduleSuccess(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  // Delete or cancel schedule item
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and remove this scheduled post?")) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSchedules(prev => prev.filter(sch => sch.id !== id));
      }
    } catch (e) {
      console.error("Error deleting schedule:", e);
    }
  };

  // Instantly publish a scheduled post (for live-testing/demo support)
  const handlePublishNow = async (id: string) => {
    try {
      const res = await fetch(`/api/schedules/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      });
      if (res.ok) {
        setSchedules(prev => prev.map(sch => sch.id === id ? { ...sch, status: 'published' } : sch));
      }
    } catch (e) {
      console.error("Error publishing schedule:", e);
    }
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getPlatformIcon = (platform: 'LinkedIn' | 'Twitter/X' | 'Facebook' | 'Slack') => {
    switch (platform) {
      case 'LinkedIn': return <Linkedin className="w-4 h-4 text-sky-700" />;
      case 'Twitter/X': return <Twitter className="w-4 h-4 text-zinc-900" />;
      case 'Facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'Slack': return <MessageSquare className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-800 flex flex-col antialiased">
      {/* Upper Navigation & Status Banner */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight font-display flex items-center gap-2">
                HR Publisher AI
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  v1.2
                </span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">Smart HR Article Generator & Social Scheduler</p>
            </div>
          </div>

          {/* Core Navigation Controls */}
          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'generate'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Draft</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'library'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Saved Articles</span>
              {articles.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-white">
                  {articles.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'calendar'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Social Schedule</span>
              {schedules.filter(s => s.status === 'scheduled').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-white">
                  {schedules.filter(s => s.status === 'scheduled').length}
                </span>
              )}
            </button>
          </nav>

          {/* Gemini API Key Status indicator */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gemini Engine</p>
              <p className="text-xs font-semibold text-gray-700">
                {apiHealth.hasApiKey ? 'Connected & Ready' : 'Awaiting Setup'}
              </p>
            </div>
            <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${apiHealth.hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 gap-8">
        
        {/* Urgent Warning if API key is missing */}
        {apiHealth.checked && !apiHealth.hasApiKey && (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <span className="font-bold">Gemini API Key missing:</span> The application needs a <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-xs font-mono">GEMINI_API_KEY</code> variable configured in the Secrets / Environment panel of AI Studio. Please verify that the key exists to unlock the article builder.
            </div>
          </div>
        )}

        {/* TAB 1: GENERATE & TWEAK */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar: Controls & Parameters */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl shadow-xs p-5 space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 tracking-tight font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Define HR Blog Parameters
                </h2>
                <p className="text-xs text-gray-500 mt-1">Configure your target tone, audience, and keyword focus to guide the Gemini model.</p>
              </div>

              {/* Topic Select Matrix */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Select HR Topic Category</label>
                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {HR_TOPICS.map(topic => {
                    const isSelected = selectedTopicId === topic.id && !customTopic;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleSelectPresetTopic(topic.id)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 ring-1 ring-indigo-200'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center font-bold text-gray-900">
                          <span>{topic.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 font-normal">{topic.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Topic Override Option */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Or write custom HR prompt/topic</label>
                  {customTopic && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTopic('');
                        handleSelectPresetTopic(HR_TOPICS[0].id);
                      }}
                      className="text-[10px] font-semibold text-red-500 hover:underline"
                    >
                      Clear custom topic
                    </button>
                  )}
                </div>
                <textarea
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value);
                    setSelectedTopicId('');
                  }}
                  placeholder="e.g., Implementing four-day work weeks in medical operations: logistics, key pros and cons, and employee satisfaction indicators."
                  className="w-full h-20 p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden placeholder:text-gray-400 bg-gray-50/30 font-sans"
                />
              </div>

              {/* Tone Matrix */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Publishing Voice & Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONE_OPTIONS.map(tone => {
                    const isSelected = selectedTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setSelectedTone(tone.id)}
                        className={`py-2 px-2.5 rounded-xl border text-xs text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-semibold ring-1 ring-indigo-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="text-sm">{tone.emoji}</span>
                        <span className="truncate">{tone.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Length & Target Audience Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Target Length</label>
                  <select
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="short">Short (300-500w)</option>
                    <option value="medium">Medium (600-900w)</option>
                    <option value="long">Long (1000-1500w)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Audience Focus</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="HR professionals, team leads, and people managers">HR Professionals</option>
                    <option value="Executive leadership, board members, and CEOs">Executive C-Suite</option>
                    <option value="General employees and staff members">All Employees</option>
                    <option value="Job seekers, developers, and candidates">Candidates / Sourcing</option>
                  </select>
                </div>
              </div>

              {/* SEO Keywords Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Keywords to weave in (comma separated)</label>
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="e.g., hybrid retention, digital workplace, pulse survey"
                  className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden bg-gray-50/20"
                />
              </div>

              {/* Generation Actions */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!selectedTopicId && !customTopic)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isGenerating
                    ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate HR Blog & Socials</span>
                  </>
                )}
              </button>
            </div>

            {/* Right main workspace: Article Output & Customizer */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Draft State Blank Case */}
              {!isGenerating && !draftArticle && !generationError && (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="max-w-sm mx-auto">
                    <h3 className="text-base font-bold text-gray-900 tracking-tight font-display">Awaiting your prompt parameters</h3>
                    <p className="text-xs text-gray-500 mt-1">Select a popular Human Resources category on the left, adjust your voice options, and hit "Generate". Gemini will instantly build a polished corporate blog post and matching multi-channel promotional messages.</p>
                  </div>
                </div>
              )}

              {/* Generating Skeletal Animation */}
              {isGenerating && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6 animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
                  </div>
                  
                  <div className="space-y-2.5 pt-4">
                    <div className="h-3.5 bg-gray-200 rounded-md"></div>
                    <div className="h-3.5 bg-gray-200 rounded-md w-5/6"></div>
                    <div className="h-3.5 bg-gray-200 rounded-md w-4/5"></div>
                    <div className="h-3.5 bg-gray-200 rounded-md"></div>
                    <div className="h-3.5 bg-gray-200 rounded-md w-11/12"></div>
                  </div>

                  {/* Elegant loading tip banner */}
                  <div className="mt-8 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    <p className="text-xs font-semibold text-indigo-900 italic transition-all duration-500">
                      {loadingTips[loadingTipIndex]}
                    </p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {generationError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>Generation Failed</span>
                  </div>
                  <p className="text-xs text-red-900 leading-relaxed bg-white/60 p-3 rounded-lg border border-red-100">
                    {generationError}
                  </p>
                  <p className="text-xs text-red-500">
                    💡 Ensure your internet connection is active and that your API key contains adequate credits and valid credentials.
                  </p>
                </div>
              )}

              {/* Freshly Generated Article Result */}
              {draftArticle && (
                <div className="space-y-6">
                  
                  {/* Article Main Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                    <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-indigo-600" />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">AI Draft Generation</span>
                      </div>
                      
                      {/* Editing Toggles */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingDraft(!isEditingDraft)}
                          className="px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-semibold text-gray-700 transition"
                        >
                          {isEditingDraft ? 'Preview' : 'Edit content'}
                        </button>
                        
                        <button
                          onClick={handleSaveToLibrary}
                          disabled={isSaving || saveSuccess}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold text-white transition flex items-center gap-1 ${
                            saveSuccess 
                              ? 'bg-emerald-600 hover:bg-emerald-700' 
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          {isSaving ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : saveSuccess ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Saved to Library!</span>
                            </>
                          ) : (
                            <span>Save to Library</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {isEditingDraft ? (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Article Title</label>
                            <input
                              type="text"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Content body (Supports Markdown)</label>
                            <textarea
                              rows={15}
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full p-3 rounded-lg border border-gray-200 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-hidden leading-relaxed"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold font-display text-gray-900 leading-snug tracking-tight">
                              {editedTitle || draftArticle.title}
                            </h2>
                            <div className="flex gap-2 mt-2 flex-wrap text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              <span>Topic: {draftArticle.topic}</span>
                              <span>•</span>
                              <span>Tone: {selectedTone}</span>
                              <span>•</span>
                              <span>Length: {selectedLength}</span>
                            </div>
                          </div>

                          {/* Standard high-contrast Markdown output */}
                          <div className="prose max-w-none">
                            <MarkdownRenderer content={editedContent || draftArticle.content} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Blurbs & Quick Schedulers */}
                  {draftArticle.suggestedBlurbs && draftArticle.suggestedBlurbs.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 tracking-tight font-display flex items-center gap-1.5">
                          <Share2 className="w-4 h-4 text-indigo-600" />
                          Suggested Social Promotion Blurbs
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Gemini drafted distinct social captions for LinkedIn, Twitter/X, Facebook, and Slack based on your article content.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {draftArticle.suggestedBlurbs.map((blurb, index) => {
                          const isCopied = copiedText === `blurb-${index}`;
                          return (
                            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getPlatformIcon(blurb.platform)}
                                  <span className="text-xs font-bold text-gray-900">{blurb.platform} Promotion</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => copyToClipboard(blurb.text, `blurb-${index}`)}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition flex items-center gap-1 text-xs font-semibold"
                                    title="Copy caption"
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      // If already saved to library, select it to unlock scheduler
                                      // Else, inform user they need to save first
                                      if (!saveSuccess) {
                                        alert("Please click 'Save to Library' at the top of the article draft first so we can reference this article!");
                                        return;
                                      }
                                      setScheduleText(blurb.text);
                                      setSelectedPlatforms([blurb.platform]);
                                      // Scroll down to scheduling section or notify
                                      const scheduleEl = document.getElementById('scheduling-dashboard');
                                      if (scheduleEl) {
                                        scheduleEl.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                                  >
                                    <Clock className="w-3 h-3" />
                                    <span>Schedule this</span>
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left Side: Raw editable message */}
                                <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Draft Caption Text</span>
                                  <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed italic select-all">
                                    {blurb.text}
                                  </p>
                                </div>

                                {/* Right Side: Authentic Live Social Preview */}
                                <div className="rounded-xl overflow-hidden shadow-2xs">
                                  <SocialPlatformPreview
                                    platform={blurb.platform}
                                    text={blurb.text}
                                    articleTitle={editedTitle || draftArticle.title}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inline Scheduler Box (Revealed when saved is complete) */}
                  <div id="scheduling-dashboard" className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-md space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Social Scheduler</span>
                        <h3 className="text-base font-bold tracking-tight font-display flex items-center gap-1.5">
                          <CalendarDays className="w-5 h-5 text-indigo-400" />
                          Schedule Draft Article To Social Channels
                        </h3>
                        <p className="text-xs text-slate-300">Set publication timers. Our automated worker publishes exactly at your chosen timeframe.</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${saveSuccess ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                        {saveSuccess ? 'Ready to Schedule' : 'Locked • Save Article First'}
                      </span>
                    </div>

                    {!saveSuccess ? (
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                        🔒 Save this newly generated article to your library to unlock direct high-fidelity social scheduling pipelines.
                      </div>
                    ) : (
                      <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                        <div className="md:col-span-12 space-y-2">
                          <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider">Social Caption Copy</label>
                          <textarea
                            value={scheduleText}
                            onChange={(e) => setScheduleText(e.target.value)}
                            rows={3}
                            placeholder="Write custom caption copy..."
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-hidden"
                          />
                        </div>

                        {/* Multi-channel checkbox targets */}
                        <div className="md:col-span-6 space-y-2">
                          <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider">Target Channels</label>
                          <div className="flex flex-wrap gap-2">
                            {(['LinkedIn', 'Twitter/X', 'Facebook', 'Slack'] as const).map(platform => {
                              const isChecked = selectedPlatforms.includes(platform);
                              return (
                                <button
                                  key={platform}
                                  type="button"
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
                                    } else {
                                      setSelectedPlatforms(prev => [...prev, platform]);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                                    isChecked
                                      ? 'bg-indigo-600 border-indigo-500 text-white'
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {getPlatformIcon(platform)}
                                  <span>{platform}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Timing picker */}
                        <div className="md:col-span-4 space-y-2">
                          <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider">Schedule Time & Date</label>
                          <input
                            type="datetime-local"
                            value={scheduleDateTime}
                            onChange={(e) => setScheduleDateTime(e.target.value)}
                            required
                            className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-hidden"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <button
                            type="submit"
                            disabled={isSubmittingSchedule}
                            className="w-full py-2 px-4 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-900/50"
                          >
                            {isSubmittingSchedule ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Schedule</span>
                              </>
                            )}
                          </button>
                        </div>

                        {scheduleSuccess && (
                          <div className="md:col-span-12 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>Successfully scheduled to queued list! Navigate to the "Social Schedule" tab to manage publishing dates.</span>
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED ARTICLES LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display">Corporate HR Articles Library</h2>
                <p className="text-xs text-gray-500 mt-0.5">Explore, edit, delete, or construct social promotions from previously compiled AI publications.</p>
              </div>
              <button
                onClick={() => setActiveTab('generate')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Write New Article</span>
              </button>
            </div>

            {loadingArticles ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-gray-500 mt-2">Loading saved documents...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight font-display">No articles found in library</h3>
                  <p className="text-xs text-gray-500 mt-1">Generate dynamic blog posts using the generator console and hit 'Save to Library' to store them here safely for ongoing publication.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(art => (
                  <div
                    key={art.id}
                    onClick={() => setViewingArticle(art)}
                    className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-xs hover:border-indigo-200 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {art.topic}
                        </span>
                        <button
                          onClick={(e) => handleDeleteArticle(art.id, e)}
                          className="p-1 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 tracking-tight font-display line-clamp-2 leading-snug">
                        {art.title}
                      </h3>
                      
                      {/* Body snippet */}
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                        {art.content.replace(/[#*`>_-]/g, '').trim()}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 mt-4">
                      <span>{new Date(art.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:underline">
                        <span>Read & Schedule</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOCIAL SCHEDULE & QUEUE TIMELINE */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-display">Social Media Promotion Pipeline</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage automated queues, publish items instantly, or cancel scheduled promotions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: List of items */}
              <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight uppercase tracking-wider text-xs text-gray-500">Scheduled Queues</h3>
                
                {loadingSchedules ? (
                  <div className="text-center py-10">
                    <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-gray-400 mt-1">Fetching timing timelines...</p>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <Calendar className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="text-xs font-semibold">No scheduled promotions active</p>
                    <p className="text-[11px] max-w-xs mx-auto">Generate a blog draft first, save it to the library, and then schedule social promotion texts using the timing controls.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {schedules.map((sch) => {
                      const isPast = new Date(sch.scheduledAt) <= new Date();
                      return (
                        <div key={sch.id} className="py-4.5 flex flex-col sm:flex-row justify-between gap-4 first:pt-0 last:pb-0">
                          <div className="space-y-2 flex-1">
                            {/* Metadata row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                sch.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : sch.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-500 border-gray-200'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              }`}>
                                {sch.status}
                              </span>

                              {/* Target Platforms */}
                              <div className="flex gap-1.5">
                                {sch.platforms.map((plat) => (
                                  <span key={plat} className="p-1 bg-gray-50 rounded border border-gray-100 flex items-center gap-1 text-[10px] font-semibold text-gray-600">
                                    {getPlatformIcon(plat)}
                                    <span>{plat}</span>
                                  </span>
                                ))}
                              </div>

                              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium ml-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(sch.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>

                            {/* Caption text */}
                            <p className="text-xs text-gray-800 font-sans whitespace-pre-line leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                              {sch.text}
                            </p>

                            {sch.articleTitle && (
                              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                <FileText className="w-3 h-3 text-indigo-400" />
                                <span className="font-semibold">Linked Article:</span> {sch.articleTitle}
                              </p>
                            )}
                          </div>

                          {/* Controls row */}
                          <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                            {sch.status === 'scheduled' && (
                              <button
                                onClick={() => handlePublishNow(sch.id)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Publish Now</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSchedule(sch.id)}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"
                              title="Delete schedule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Mini Scheduling Creator */}
              <div className="lg:col-span-4 bg-indigo-900 text-white border border-indigo-950 rounded-2xl p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold tracking-tight font-display flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-300" />
                    Standalone Scheduler
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">Quickly queue a social media blurb independently of any article draft.</p>
                </div>

                <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-indigo-200 uppercase tracking-wider text-[10px]">Article Reference (Optional)</label>
                    <select
                      value={selectedArticleForSchedule?.id || ''}
                      onChange={(e) => {
                        const art = articles.find(a => a.id === e.target.value);
                        setSelectedArticleForSchedule(art || null);
                      }}
                      className="w-full p-2 bg-indigo-950/60 border border-indigo-800 text-white rounded-xl text-xs outline-hidden"
                    >
                      <option value="">None (Standalone Promotion)</option>
                      {articles.map(art => (
                        <option key={art.id} value={art.id}>{art.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-indigo-200 uppercase tracking-wider text-[10px]">Social Copy Text</label>
                    <textarea
                      value={scheduleText}
                      onChange={(e) => setScheduleText(e.target.value)}
                      rows={4}
                      placeholder="Type custom thoughts or paste social media promotion snippets here..."
                      className="w-full p-2.5 bg-indigo-950 border border-indigo-800 text-white rounded-xl text-xs outline-hidden"
                    />
                  </div>

                  {/* Target Platform checkboxes */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-indigo-200 uppercase tracking-wider text-[10px]">Target Platform Channels</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['LinkedIn', 'Twitter/X', 'Facebook', 'Slack'] as const).map(platform => {
                        const isChecked = selectedPlatforms.includes(platform);
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedPlatforms(prev => prev.filter(p => p !== platform));
                              } else {
                                setSelectedPlatforms(prev => [...prev, platform]);
                              }
                            }}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 ${
                              isChecked
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300 hover:text-white'
                            }`}
                          >
                            {getPlatformIcon(platform)}
                            <span>{platform}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date selection */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-indigo-200 uppercase tracking-wider text-[10px]">Timing Clock</label>
                    <input
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                      required
                      className="w-full p-2 bg-indigo-950 border border-indigo-800 rounded-xl text-white outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingSchedule || !scheduleText.trim()}
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Queue Promotion</span>
                  </button>

                  {scheduleSuccess && (
                    <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                      Post successfully added to scheduling list!
                    </div>
                  )}
                </form>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ARTICLE READER SLIDE-OVER / DETAILED MODAL OVERLAY */}
      {viewingArticle && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          {/* Backdrop screen */}
          <div
            onClick={() => setViewingArticle(null)}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
          ></div>

          {/* Slide-over panel container */}
          <div className="relative w-screen max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {viewingArticle.topic}
                </span>
                <h3 className="text-base font-bold text-gray-900 font-display leading-snug tracking-tight">
                  {viewingArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingArticle(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core reader markdown view */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="prose max-w-none bg-gray-50/30 p-5 rounded-2xl border border-gray-100">
                <MarkdownRenderer content={viewingArticle.content} />
              </div>

              {/* Social blurbs promotion center inside article modal */}
              {viewingArticle.suggestedBlurbs && viewingArticle.suggestedBlurbs.length > 0 && (
                <div className="space-y-3.5 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Social Media Promos</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {viewingArticle.suggestedBlurbs.map((blurb, bIdx) => {
                      const isCopied = copiedText === `modal-blurb-${bIdx}`;
                      return (
                        <div key={bIdx} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              {getPlatformIcon(blurb.platform)}
                              <span>{blurb.platform}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => copyToClipboard(blurb.text, `modal-blurb-${bIdx}`)}
                                className="text-[10px] font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>Copy</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedArticleForSchedule(viewingArticle);
                                  setScheduleText(blurb.text);
                                  setSelectedPlatforms([blurb.platform]);
                                  setViewingArticle(null);
                                  setActiveTab('calendar');
                                }}
                                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md"
                              >
                                Schedule
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 italic whitespace-pre-line leading-relaxed">
                            {blurb.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer controls inside modal */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => handleDeleteArticle(viewingArticle.id)}
                className="px-3.5 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Article</span>
              </button>

              <button
                onClick={() => {
                  setSelectedArticleForSchedule(viewingArticle);
                  const firstBlurb = viewingArticle.suggestedBlurbs?.[0]?.text || '';
                  setScheduleText(firstBlurb);
                  setViewingArticle(null);
                  setActiveTab('calendar');
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Configure Social Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 HR Publisher AI • Powered by Gemini 3.5 Flash & Full-Stack Node.js Storage.</p>
          <p className="mt-1">Designed for agile People Operations, continuous feedback loops, and employer branding excellence.</p>
        </div>
      </footer>
    </div>
  );
}
