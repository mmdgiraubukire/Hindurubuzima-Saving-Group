import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { Meeting } from '../../types';
import { 
  CalendarDays, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  FileText, 
  X, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const MeetingsView: React.FC = () => {
  const { 
    meetings, 
    addMeeting, 
    formatRwf, 
    t, 
    currentUser 
  } = useApp();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-15T14:00');
  const [location, setLocation] = useState('Gisozi Community Center, Hall B');
  const [agenda, setAgenda] = useState('');

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMeeting({
      title,
      date,
      location,
      agenda,
      attendanceCount: 0,
      recordedBy: `${currentUser.displayName} (${currentUser.role})`
    });

    setIsScheduleModalOpen(false);
    setTitle('');
    setAgenda('');
  };

  const isSecretaryOrChair = ['secretary', 'chairperson', 'super_admin'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-800" />
            {t.meetings} & Assembly Minutes
          </h1>
          <p className="text-xs text-slate-500">
            Scheduling periodic member assemblies, tracking attendance roll-call, and documenting official signed minutes.
          </p>
        </div>

        {isSecretaryOrChair && (
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.scheduleMeeting}
          </button>
        )}
      </div>

      {/* Assemblies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.map(m => {
          const isPast = new Date(m.date).getTime() < Date.now();

          return (
            <div 
              key={m.id} 
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    {m.meetingNumber}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isPast 
                      ? 'bg-slate-100 text-slate-600' 
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {isPast ? 'Concluded' : 'Upcoming Assembly'}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900">
                  {m.title}
                </h2>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-mono font-medium">
                      {new Date(m.date).toLocaleDateString('en-GB', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{m.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Attendance: <strong className="font-mono">{m.attendanceCount} members</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Agenda Outline:
                  </span>
                  <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200 line-clamp-3">
                    {m.agenda}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Recorded by: {m.recordedBy}</span>
                <button
                  onClick={() => setSelectedMeeting(m)}
                  className="px-3 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg border border-emerald-300 transition-colors cursor-pointer"
                >
                  View Full Minutes
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meeting Details & Minutes Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">
                Official Assembly Minutes · {selectedMeeting.meetingNumber}
              </h2>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedMeeting.title}</h3>
                <p className="text-slate-500 font-mono mt-0.5">
                  {new Date(selectedMeeting.date).toLocaleString()} · {selectedMeeting.location}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span>Verified Quorum Attendance:</span>
                <span className="font-bold text-emerald-950 font-mono">{selectedMeeting.attendanceCount} Active Members</span>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 block uppercase tracking-wider text-[11px]">Agenda:</span>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-line text-slate-700">
                  {selectedMeeting.agenda}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-700 block uppercase tracking-wider text-[11px]">Recorded Minutes & Resolutions:</span>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-line text-slate-700 leading-relaxed">
                  {selectedMeeting.minutes || 'Formal minutes signed off by the Executive Committee and deposited in the physical group registry.'}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                Recorded by {selectedMeeting.recordedBy} · Certified by Chairperson Jeanette Mukamana
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close Minutes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-800" />
                Schedule Group Assembly
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November Monthly Savings Assembly"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Venue Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gisozi Sector Community Hall"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Meeting Agenda Items *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="1. Roll call and monthly contribution collection&#10;2. Micro-loan applications approval&#10;3. Cooperative land purchase update"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Schedule & Announce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
