import { create } from 'zustand';
import { sd_pb } from '../lib/sd_pocketbase';
import { type Sd_ActivityActionType, type Sd_ActivityEntityType } from '../utils/sd_activityLogger';

export interface Sd_ActivityLog {
  id: string;
  user: string;
  action_type: Sd_ActivityActionType;
  entity_type: Sd_ActivityEntityType;
  title: string;
  entity_id: string;
  details: unknown;
  created: string;
  updated: string;
}

interface Sd_ActivityState {
  sd_logs: Sd_ActivityLog[];
  sd_totalItems: number;
  sd_currentPage: number;
  sd_totalPages: number;
  sd_isLoading: boolean;
  sd_error: string | null;

  // Filters
  sd_filterText: string;
  sd_filterAction: Sd_ActivityActionType | 'all';
  sd_filterEntity: Sd_ActivityEntityType | 'all';
  sd_filterDate: 'all' | 'today' | 'week' | 'month' | 'year';

  sd_setFilters: (filters: {
    text?: string;
    action?: Sd_ActivityActionType | 'all';
    entity?: Sd_ActivityEntityType | 'all';
    date?: 'all' | 'today' | 'week' | 'month' | 'year';
  }) => void;

  sd_fetchLogs: (page?: number) => Promise<void>;
  sd_loadMore: () => Promise<void>;
}

const ITEMS_PER_PAGE = 20;

export const sd_useActivityStore = create<Sd_ActivityState>((set, get) => ({
  sd_logs: [],
  sd_totalItems: 0,
  sd_currentPage: 1,
  sd_totalPages: 1,
  sd_isLoading: false,
  sd_error: null,

  sd_filterText: '',
  sd_filterAction: 'all',
  sd_filterEntity: 'all',
  sd_filterDate: 'all',

  sd_setFilters: (filters) => {
    set((state) => ({
      sd_filterText: filters.text !== undefined ? filters.text : state.sd_filterText,
      sd_filterAction: filters.action !== undefined ? filters.action : state.sd_filterAction,
      sd_filterEntity: filters.entity !== undefined ? filters.entity : state.sd_filterEntity,
      sd_filterDate: filters.date !== undefined ? filters.date : state.sd_filterDate,
      // Reset page when filters change
      sd_currentPage: 1,
    }));
    get().sd_fetchLogs(1); // Fetch with new filters
  },

  sd_fetchLogs: async (page = 1) => {
    set({ sd_isLoading: true, sd_error: null });
    try {
      const { sd_filterText, sd_filterAction, sd_filterEntity, sd_filterDate } = get();

      const userId = sd_pb.authStore.model?.id;
      if (!userId) throw new Error('User not authenticated');

      let filterStr = `user = "${userId}"`;

      if (sd_filterText) {
        // Basic full text search on the title
        filterStr += ` && title ~ "${sd_filterText}"`;
      }
      if (sd_filterAction !== 'all') {
        filterStr += ` && action_type = "${sd_filterAction}"`;
      }
      if (sd_filterEntity !== 'all') {
        filterStr += ` && entity_type = "${sd_filterEntity}"`;
      }

      // Date filtering
      if (sd_filterDate !== 'all') {
        const now = new Date();
        const startDate = new Date();
        if (sd_filterDate === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (sd_filterDate === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (sd_filterDate === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else if (sd_filterDate === 'year') {
          startDate.setFullYear(now.getFullYear() - 1);
        }

        // PocketBase uses UTC for queries
        const startDateStr = startDate.toISOString().replace('T', ' ').substring(0, 19) + 'Z';
        filterStr += ` && created >= "${startDateStr}"`;
      }

      const records = await sd_pb.collection('sd_activity_logs').getList<Sd_ActivityLog>(page, ITEMS_PER_PAGE, {
        sort: '-created',
        filter: filterStr,
      });

      set((state) => ({
        // If it's page 1, replace logs. If > 1, append them.
        sd_logs: page === 1 ? records.items : [...state.sd_logs, ...records.items],
        sd_totalItems: records.totalItems,
        sd_currentPage: page,
        sd_totalPages: records.totalPages,
        sd_isLoading: false,
      }));
    } catch (error: unknown) {
      console.error('Failed to fetch activity logs:', error);
      const message = error instanceof Error ? error.message : 'Ошибка загрузки активности';
      set({ sd_error: message, sd_isLoading: false });
    }
  },

  sd_loadMore: async () => {
    const { sd_currentPage, sd_totalPages, sd_isLoading } = get();
    if (sd_isLoading || sd_currentPage >= sd_totalPages) return;

    await get().sd_fetchLogs(sd_currentPage + 1);
  }
}));
