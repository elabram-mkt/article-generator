import { Linkedin, Twitter, MessageSquare, Facebook, Share2, ThumbsUp, MessageCircle, Repeat2, Eye, Bookmark, Heart, Send } from 'lucide-react';

interface SocialPlatformPreviewProps {
  platform: 'LinkedIn' | 'Twitter/X' | 'Facebook' | 'Slack';
  text: string;
  authorName?: string;
  authorTitle?: string;
  articleTitle?: string;
}

export default function SocialPlatformPreview({
  platform,
  text,
  authorName = "People Operations Team",
  authorTitle = "HR & Culture Director",
  articleTitle = "HR Blog Post"
}: SocialPlatformPreviewProps) {
  
  const initials = authorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  switch (platform) {
    case 'LinkedIn':
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm text-gray-800 font-sans">
          {/* Header */}
          <div className="p-4 flex items-start justify-between">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center border border-indigo-200">
                {initials}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-1.5">
                  {authorName}
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">1st</span>
                </h4>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{authorTitle}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                  Just now • <Share2 className="w-2.5 h-2.5" />
                </p>
              </div>
            </div>
            <Linkedin className="w-5 h-5 text-[#0a66c2]" />
          </div>

          {/* Content */}
          <div className="px-4 pb-3 whitespace-pre-line leading-relaxed text-[13.5px] text-gray-950">
            {text}
          </div>

          {/* Article Card Emulation */}
          <div className="mx-4 mb-3 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col sm:flex-row hover:bg-gray-100 transition cursor-pointer">
            <div className="h-32 sm:h-auto sm:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
              <span className="text-white text-xs font-bold uppercase tracking-wider text-center px-2 py-1 bg-white/20 rounded backdrop-blur">
                HR Insight
              </span>
            </div>
            <div className="p-3 sm:w-2/3 flex flex-col justify-center">
              <p className="text-xs text-gray-400 font-medium">PEOPLE OPERATIONS JOURNAL</p>
              <h5 className="font-bold text-gray-900 mt-1 line-clamp-2 leading-snug">{articleTitle}</h5>
              <p className="text-xs text-gray-500 mt-1">Read the full perspective • 4 min read</p>
            </div>
          </div>

          {/* Social Counts */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">👍</span>
                <span className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center text-[8px] text-white">❤️</span>
                <span className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px] text-white">👏</span>
              </div>
              <span>18 reactions</span>
            </div>
            <div className="flex gap-2">
              <span>2 comments</span>
              <span>•</span>
              <span>1 repost</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-gray-100 px-2 py-1 bg-gray-50 flex items-center justify-around text-gray-600 font-medium text-xs">
            <button className="flex items-center gap-1.5 py-2 px-3 rounded hover:bg-gray-100 transition">
              <ThumbsUp className="w-4 h-4" /> <span>Like</span>
            </button>
            <button className="flex items-center gap-1.5 py-2 px-3 rounded hover:bg-gray-100 transition">
              <MessageCircle className="w-4 h-4" /> <span>Comment</span>
            </button>
            <button className="flex items-center gap-1.5 py-2 px-3 rounded hover:bg-gray-100 transition">
              <Repeat2 className="w-4 h-4" /> <span>Repost</span>
            </button>
            <button className="flex items-center gap-1.5 py-2 px-3 rounded hover:bg-gray-100 transition">
              <Send className="w-4 h-4" /> <span>Send</span>
            </button>
          </div>
        </div>
      );

    case 'Twitter/X':
      return (
        <div className="bg-black border border-zinc-800 rounded-xl shadow-sm text-sm text-zinc-100 font-sans p-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-indigo-900 text-indigo-200 font-bold rounded-full flex items-center justify-center border border-zinc-800">
                {initials}
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-1">
                  {authorName}
                  <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-4 h-4 text-[#1d9bf0] fill-current">
                    <g><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.17-2.9-.81-3.88s-2.49-1.27-3.88-.81C14.67 2.88 13.43 2 12 2s-2.67.88-3.34 2.19c-1.39-.46-2.9-.17-3.88.81s-1.27 2.49-.81 3.88C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.17 2.9.81 3.88s2.49 1.27 3.88.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.17 3.88-.81s1.27-2.49.81-3.88c1.31-.67 2.19-1.91 2.19-3.34zM10.5 17l-4.5-4.5 1.41-1.41 3.09 3.09 7.09-7.09 1.41 1.41L10.5 17z"></path></g>
                  </svg>
                </h4>
                <p className="text-xs text-zinc-500 leading-none mt-0.5">@{authorName.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
            </div>
            <Twitter className="w-4 h-4 text-white fill-current" />
          </div>

          {/* Content */}
          <div className="mt-3 whitespace-pre-line leading-relaxed text-[14.5px] text-zinc-100">
            {text}
          </div>

          {/* Attached card emulation */}
          <div className="mt-3 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex flex-col hover:bg-zinc-900/50 transition cursor-pointer">
            <div className="h-40 bg-gradient-to-br from-indigo-800 via-purple-950 to-zinc-900 flex items-center justify-center p-6 border-b border-zinc-800">
              <span className="text-indigo-200 text-sm font-bold text-center px-3 py-1 bg-black/40 rounded border border-zinc-800">
                {articleTitle}
              </span>
            </div>
            <div className="p-3">
              <p className="text-xs text-zinc-500 uppercase font-medium">people-ops-journal.com</p>
              <h5 className="font-semibold text-white mt-1 leading-snug line-clamp-1">{articleTitle}</h5>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-1">Explore our latest strategic guide for workplace success.</p>
            </div>
          </div>

          {/* Time & Views */}
          <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
            <span>10:31 AM</span>
            <span>•</span>
            <span>Jul 1, 2026</span>
            <span>•</span>
            <span className="text-zinc-300 font-medium">1,240</span>
            <span>Views</span>
          </div>

          {/* Interactive Icons */}
          <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between text-zinc-500 px-1">
            <button className="hover:text-sky-400 flex items-center gap-1.5 transition">
              <MessageSquare className="w-4 h-4" /> <span className="text-xs">4</span>
            </button>
            <button className="hover:text-green-400 flex items-center gap-1.5 transition">
              <Repeat2 className="w-4 h-4" /> <span className="text-xs">8</span>
            </button>
            <button className="hover:text-pink-400 flex items-center gap-1.5 transition">
              <Heart className="w-4 h-4" /> <span className="text-xs">42</span>
            </button>
            <button className="hover:text-sky-400 flex items-center gap-1.5 transition">
              <Bookmark className="w-4 h-4" /> <span className="text-xs">3</span>
            </button>
            <button className="hover:text-sky-400 flex items-center gap-1.5 transition">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      );

    case 'Facebook':
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-800 font-sans p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 font-bold rounded-full flex items-center justify-center border border-indigo-100">
                {initials}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-1">
                  {authorName}
                </h4>
                <p className="text-xs text-gray-500 leading-none mt-0.5 flex items-center gap-1">
                  Just now • <span className="text-[10px] bg-gray-100 px-1 py-0.5 rounded font-bold">🌐</span>
                </p>
              </div>
            </div>
            <Facebook className="w-5 h-5 text-[#1877f2]" />
          </div>

          {/* Content */}
          <div className="mt-3 whitespace-pre-line leading-relaxed text-gray-900">
            {text}
          </div>

          {/* Attached card emulation */}
          <div className="mt-3 border border-gray-200 rounded overflow-hidden bg-gray-50 flex flex-col hover:bg-gray-100 transition cursor-pointer">
            <div className="h-44 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center p-6">
              <div className="bg-white/95 p-4 rounded shadow-md max-w-xs text-center border-t-4 border-indigo-600">
                <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider block mb-1">Culture Insight</span>
                <h5 className="font-bold text-gray-900 text-xs line-clamp-2 leading-tight">{articleTitle}</h5>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-400 font-medium">PEOPLE OPERATIONS BLOG</p>
              <h5 className="font-bold text-gray-900 leading-snug mt-1">{articleTitle}</h5>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">Elevate employee happiness and organizational productivity.</p>
            </div>
          </div>

          {/* Interactive footer */}
          <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">👍</span>
              <span>12 people liked this</span>
            </div>
            <span>3 Comments</span>
          </div>

          <div className="mt-3 pt-1 border-t border-gray-100 flex justify-around text-gray-500 text-xs font-semibold">
            <button className="flex-1 py-2 rounded hover:bg-gray-50 flex items-center justify-center gap-1.5 transition">
              <span>👍</span> <span>Like</span>
            </button>
            <button className="flex-1 py-2 rounded hover:bg-gray-50 flex items-center justify-center gap-1.5 transition">
              <span>💬</span> <span>Comment</span>
            </button>
            <button className="flex-1 py-2 rounded hover:bg-gray-50 flex items-center justify-center gap-1.5 transition">
              <span>➡️</span> <span>Share</span>
            </button>
          </div>
        </div>
      );

    case 'Slack':
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm text-sm text-slate-300 font-sans p-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="text-emerald-500">#</span>
              <span>hr-announcements</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
              Slack Integration
            </div>
          </div>

          {/* Message Row */}
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-emerald-700 text-white font-bold rounded flex items-center justify-center flex-shrink-0">
              HR
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-white text-[14.5px]">{authorName}</span>
                <span className="text-[11px] text-slate-500">10:31 AM</span>
              </div>
              
              {/* Slack formatted text */}
              <div className="mt-1 whitespace-pre-line leading-relaxed text-[14px] text-slate-100">
                {text}
              </div>

              {/* Attachment Border block */}
              <div className="mt-2 border-l-4 border-emerald-500 pl-3 py-1 bg-slate-800/40 rounded-r">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {articleTitle}
                </h5>
                <p className="text-xs text-slate-400 mt-1">
                  Our team has crafted a comprehensive strategic guide. Check it out and let us know your thoughts!
                </p>
                <div className="mt-2 flex gap-2">
                  <button className="text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700">
                    Read Post (4 min)
                  </button>
                </div>
              </div>

              {/* Slack Reactions */}
              <div className="mt-3 flex gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-slate-700">
                  <span>🙌</span> <span className="text-slate-400 text-[10px]">7</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-slate-700">
                  <span>🚀</span> <span className="text-slate-400 text-[10px]">4</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-slate-700">
                  <span>❤️</span> <span className="text-slate-400 text-[10px]">11</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }
}
