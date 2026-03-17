import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Users, FileText, Bell, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sd_pb } from '../../lib/sd_pocketbase';
import { sd_useAuthStore } from '../../stores/sd_useAuthStore';
import type { sd_Athlete, sd_Note, sd_Reminder } from '../../types/sd_types';
import { useClickAway } from 'react-use';

interface Sd_GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sd_GlobalSearchModal = ({ isOpen, onClose }: Sd_GlobalSearchModalProps) => {
  const navigate = useNavigate();
  const { sd_user } = sd_useAuthStore();
  const [sd_query, setSd_Query] = useState('');
  const [sd_isLoading, setSd_IsLoading] = useState(false);

  const [sd_results, setSd_Results] = useState<{
    athletes: sd_Athlete[];
    notes: (sd_Note & { expand?: { athlete_id?: sd_Athlete } })[];
    reminders: sd_Reminder[];
  }>({
    athletes: [],
    notes: [],
    reminders: [],
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickAway(modalRef, () => {
    if (isOpen) onClose();
  });

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSd_Query('');
      setSd_Results({ athletes: [], notes: [], reminders: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Global toggle logic should be in layout ideally, but keeping escape here
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!sd_query.trim() || !sd_user) {
      setSd_Results({ athletes: [], notes: [], reminders: [] });
      setSd_IsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSd_IsLoading(true);
      try {
        const searchTerm = sd_query.trim();

        // Execute parallel searches
        const [athletesRes, notesRes, remindersRes] = await Promise.all([
          // Search athletes
          sd_pb.collection('athletes').getList<sd_Athlete>(1, 5, {
            filter: `name ~ "${searchTerm}"`,
          }).catch((err) => {
            console.error('Athletes search error:', err.message, err.data);
            return { items: [] as sd_Athlete[] };
          }),
          // Search notes
          sd_pb.collection('notes').getList<sd_Note & { expand: { athlete_id: sd_Athlete } }>(1, 5, {
            filter: `content ~ "${searchTerm}"`,
            expand: 'athlete_id',
            sort: '-created'
          }).catch((err) => {
            console.error('Notes search error:', err.message, err.data);
            return { items: [] as (sd_Note & { expand?: { athlete_id?: sd_Athlete } })[] };
          }),
          // Search reminders
          sd_pb.collection('reminders').getList<sd_Reminder>(1, 5, {
            filter: `title ~ "${searchTerm}" || description ~ "${searchTerm}"`,
            sort: '-due_date'
          }).catch((err) => {
            console.error('Reminders search error (ignoring if collection missing):', err.message);
            return { items: [] as sd_Reminder[] };
          })
        ]);

        setSd_Results({
          athletes: athletesRes.items || [],
          notes: notesRes.items || [],
          reminders: remindersRes.items || [],
        });

      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSd_IsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [sd_query, sd_user]);

  const sd_handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const hasResults = sd_results.athletes.length > 0 || sd_results.notes.length > 0 || sd_results.reminders.length > 0;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] grid place-items-start pt-[10vh] px-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            ref={modalRef}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mx-auto animate-in fade-in zoom-in-[0.95] duration-200 ease-out"
          >
              {/* Search Input Area */}
              <div className="relative flex items-center px-4 py-4 border-b border-gray-50">
                <Search className="w-6 h-6 text-orange-500 absolute left-6" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Искать клиента, заметку или задачу..."
                  value={sd_query}
                  onChange={(e) => setSd_Query(e.target.value)}
                  className="w-full bg-transparent border-none outline-none pl-14 pr-12 py-2 text-lg font-medium text-gray-900 placeholder:text-gray-400"
                />

                {sd_isLoading ? (
                  <Loader2 className="w-5 h-5 text-gray-400 absolute right-6 animate-spin" />
                ) : sd_query ? (
                  <button onClick={() => setSd_Query('')} className="absolute right-6 p-1 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="absolute right-6 flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-bold text-gray-400">ESC</kbd>
                  </div>
                )}
              </div>

              {/* Results Area */}
              <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {!sd_query.trim() ? (
                  <div className="px-8 py-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">
                      Начните вводить текст для поиска по всей базе Coaching Vault
                    </p>
                  </div>
                ) : !sd_isLoading && !hasResults ? (
                  <div className="px-8 py-12 text-center">
                    <p className="text-sm font-semibold text-gray-500">
                      По запросу «<span className="text-gray-900">{sd_query}</span>» ничего не найдено
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-2">

                    {/* Athletes Results */}
                    {sd_results.athletes.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" /> Клиенты
                        </h4>
                        {sd_results.athletes.map((athlete) => (
                          <button
                            key={athlete.id}
                            onClick={() => sd_handleNavigate(`/athletes/${athlete.id}`)}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                              {athlete.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-sm text-gray-900 truncate group-hover:text-orange-500 transition-colors">{athlete.name}</h5>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Notes Results */}
                    {sd_results.notes.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mt-4 mb-2 flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" /> Заметки
                        </h4>
                        {sd_results.notes.map((note) => (
                          <button
                            key={note.id}
                            onClick={() => sd_handleNavigate(`/athletes/${note.athlete_id}`)}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                {note.content}
                              </p>
                              {note.expand?.athlete_id && (
                                <p className="text-xs text-gray-500 mt-1 font-semibold flex items-center gap-1">
                                  Клиент: <span className="text-gray-700">{note.expand.athlete_id.name}</span>
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Reminders Results */}
                    {sd_results.reminders.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mt-4 mb-2 flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5" /> Напоминания
                        </h4>
                        {sd_results.reminders.map((reminder) => (
                          <button
                            key={reminder.id}
                            onClick={() => sd_handleNavigate(`/dashboard`)}
                            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                              <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors">{reminder.title}</h5>
                              {reminder.description && (
                                <p className="text-xs text-gray-500 truncate">{reminder.description}</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
