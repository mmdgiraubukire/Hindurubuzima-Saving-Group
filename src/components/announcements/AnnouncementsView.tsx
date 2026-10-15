import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { Announcement } from '../../types';
import { 
  Megaphone, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  User, 
  X, 
  Bell, 
  Send
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { 
    announcements, 
    addAnnouncement, 
    t, 
    currentUser 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addAnnouncement({
      title,
      content,
      priority,
      postedBy: `${currentUser.displayName} (${currentUser.role})`
    });

    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  const isOfficer = ['chairperson', 'secretary', 'treasurer', 'super_admin'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-800" />
            {t.announcements} & Group Bulletins
          </h1>
          <p className="text-xs text-slate-500">
            Official broadcasts, contribution deadline reminders, dividend payout dates, and regulatory policy circulars.
          </p>
        </div>

        {isOfficer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Post Announcement
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(a => (
          <div 
            key={a.id} 
            className={`bg-white rounded-2xl p-6 border shadow-2xs space-y-3 ${
              a.priority === 'urgent' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {a.priority === 'urgent' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    Urgent Circular
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    <Bell className="w-3 h-3 text-emerald-600" />
                    General Notice
                  </span>
                )}
                <span className="text-xs text-slate-400 font-mono">Posted: {a.date}</span>
              </div>

              <span className="text-xs text-slate-500 font-medium">{a.postedBy}</span>
            </div>

            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {a.title}
            </h2>

            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
              {a.content}
            </p>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-800" />
                Publish Group Announcement
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notice Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Contribution Deadline Extension for October Cycle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Priority Classification</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="normal"
                      checked={priority === 'normal'}
                      onChange={() => setPriority('normal')}
                    />
                    <span>Normal Bulletin</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="urgent"
                      checked={priority === 'urgent'}
                      onChange={() => setPriority('urgent')}
                    />
                    <span className="text-amber-800 font-semibold">Urgent Deadline / Alert</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Announcement Message Body *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Draft the clear instructions for members in English or Kinyarwanda..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
