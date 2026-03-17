import { useEffect, useState } from 'react';
import { FileText, Plus, Search, MoreVertical, Calendar } from 'lucide-react';
import { sd_pb } from '../../../lib/sd_pocketbase';
import type { sd_Note, sd_Athlete } from '../../../types/sd_types';
import { Sd_AddNoteModal } from '../../../components/notes/Sd_AddNoteModal';

type NoteWithAthlete = sd_Note & { expand?: { athlete_id: sd_Athlete } };

export const Sd_NotesPage = () => {
  const [notes, setNotes] = useState<NoteWithAthlete[]>([]);
  const [sd_isModalOpen, setSd_IsModalOpen] = useState(false);
  const [sd_searchQuery, setSd_SearchQuery] = useState('');
  const [sd_noteToEdit, setSd_NoteToEdit] = useState<NoteWithAthlete | undefined>();

  useEffect(() => {
    // Fetch notes and expand athlete relation
    sd_pb
      .collection('notes')
      .getList<NoteWithAthlete>(1, 50, { sort: '-created', expand: 'athlete_id' })
      .then((res) => setNotes(res.items))
      .catch(console.error);
  }, []);

  const sd_filteredNotes = notes.filter(n => {
    const matchesContent = n.content.toLowerCase().includes(sd_searchQuery.toLowerCase());
    const matchesAthlete = n.expand?.athlete_id?.name?.toLowerCase().includes(sd_searchQuery.toLowerCase());
    return matchesContent || matchesAthlete;
  });

  const sd_handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      try {
        await sd_pb.collection('notes').delete(noteId);
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      } catch (err) {
        console.error('Ошибка при удалении заметки', err);
        alert('Ошибка удаления заметки');
      }
    }
  };

  const sd_handleEditNote = (e: React.MouseEvent, note: NoteWithAthlete) => {
    e.preventDefault();
    e.stopPropagation();
    setSd_NoteToEdit(note);
    setSd_IsModalOpen(true);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--accent)]" />
            Заметки
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 ml-11 opacity-80">
            Ваши наблюдения, идеи и планы тренировок
          </p>
        </div>
        <button
          onClick={() => {
            setSd_NoteToEdit(undefined);
            setSd_IsModalOpen(true);
          }}
          className="h-12 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white font-medium rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Новая заметка
        </button>
      </div>

      {/* Main Content Area */}
      <div className="sd_bento-card bg-transparent shadow-none p-0 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both" style={{ animationDelay: '100ms' }}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="text"
              placeholder="Поиск по заметкам..."
              value={sd_searchQuery}
              onChange={(e) => setSd_SearchQuery(e.target.value)}
              className="h-12 w-full pl-[54px] pr-4 rounded-xl bg-white border border-transparent hover:border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all placeholder:text-gray-400 font-medium shadow-sm"
            />
          </div>
        </div>

        {/* List */}
        {sd_filteredNotes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center sd_bento-card">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-[var(--accent)]" />
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">Нет заметок</p>
            <p className="text-[var(--text-secondary)] mt-1">Создайте первую заметку для вашего клиента.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sd_filteredNotes.map((n, i) => (
              <div
                key={n.id}
                className="p-6 rounded-[var(--radius-lg)] border border-gray-100 hover:border-orange-100 bg-white shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all group relative overflow-hidden flex flex-col h-[240px] animate-in fade-in zoom-in-95 duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-[var(--accent)] flex items-center justify-center font-bold text-sm">
                      {n.expand?.athlete_id?.name?.charAt(0) || 'A'}
                    </div>
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-black transition-colors line-clamp-1">
                      {n.expand?.athlete_id?.name || 'Без клиента'}
                    </span>
                  </div>
                  <div className="relative group/menu">
                    <button
                      type="button"
                      className="p-1 -mr-2 -mt-2 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {/* Hover Dropdown Menu */}
                    <div className="absolute right-0 top-full pt-1 w-36 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10 pointer-events-none group-hover/menu:pointer-events-auto origin-top-right transform scale-95 group-hover/menu:scale-100">
                      <div className="bg-white border border-gray-100 rounded-xl shadow-lg shadow-black/5 flex flex-col py-1 overflow-hidden">
                        <button 
                          onClick={(e) => sd_handleEditNote(e, n)} 
                          className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--accent)] font-medium transition-colors"
                        >
                          Изменить
                        </button>
                        <button 
                          onClick={(e) => sd_handleDeleteNote(e, n.id)} 
                          className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-5">
                    {n.content}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-medium text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(n.created).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <FileText className="w-3 h-3 text-[var(--accent)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Sd_AddNoteModal
        isOpen={sd_isModalOpen}
        onClose={() => {
          setSd_IsModalOpen(false);
          setSd_NoteToEdit(undefined);
        }}
        initialNote={sd_noteToEdit}
        onSuccess={(newNote, isEdit) => {
          if (isEdit) {
            setNotes(prev => prev.map(n => n.id === newNote.id ? newNote : n));
          } else {
            setNotes([newNote, ...notes]);
          }
        }}
      />
    </div>
  );
};
