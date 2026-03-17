import { create } from 'zustand';
import { sd_pb } from '../lib/sd_pocketbase';
import type { sd_User } from '../types/sd_types';
import { z } from 'zod';

// Строгая валидация входящих данных из PocketBase
const sd_UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string().optional().catch('coach'),
  avatar: z.string().optional(),
}).passthrough(); // Разрешаем дополнительные поля от PocketBase

interface sd_AuthState {
  sd_user: sd_User | null;
  sd_isAuthenticated: boolean;
  sd_isLoading: boolean;
  sd_error: string | null;

  sd_login: (sd_email: string, sd_pass: string) => Promise<void>;
  sd_register: (sd_email: string, sd_pass: string, sd_name: string) => Promise<void>;
  sd_logout: () => void;
  sd_checkAuth: () => void;
  sd_clearError: () => void;
}

const sd_getErrorMessage = (sd_err: unknown, sd_fallback: string) => {
  if (sd_err && typeof sd_err === 'object') {
    const errObj = sd_err as {
      message?: string;
      response?: { message?: string; data?: Record<string, { message?: string }> };
    };
    if (errObj.response?.message) return errObj.response.message;
    if (errObj.response?.data) {
      const errors = Object.values(errObj.response.data);
      if (errors.length > 0 && errors[0]?.message) {
        return `${sd_fallback}: ${errors[0].message}`;
      }
    }
    if (errObj.message) return errObj.message;
  }
  return sd_fallback;
};

// Защищенный парсер для пользователя
const sd_safeParseUser = (sd_model: unknown): sd_User | null => {
  if (!sd_model) return null;
  try {
    return sd_UserSchema.parse(sd_model) as unknown as sd_User;
  } catch (sd_err) {
    console.error('[sd_useAuthStore] Ошибка парсинга пользователя:', sd_err);
    return null;
  }
};

export const sd_useAuthStore = create<sd_AuthState>((set) => ({
  sd_user: sd_safeParseUser(sd_pb.authStore.model),
  sd_isAuthenticated: sd_pb.authStore.isValid,
  sd_isLoading: false,
  sd_error: null,

  sd_login: async (sd_email, sd_pass) => {
    set({ sd_isLoading: true, sd_error: null });
    try {
      await sd_pb.collection('users').authWithPassword(sd_email, sd_pass);
      set({
        sd_user: sd_safeParseUser(sd_pb.authStore.model),
        sd_isAuthenticated: sd_pb.authStore.isValid,
        sd_isLoading: false,
      });
    } catch (sd_err: unknown) {
      const sd_message = sd_getErrorMessage(sd_err, 'Ошибка авторизации');

      console.error('[authStore] Login error', sd_err);
      set({ sd_error: sd_message, sd_isLoading: false });
      throw sd_err;
    }
  },

  sd_register: async (sd_email, sd_pass, sd_name) => {
    set({ sd_isLoading: true, sd_error: null });
    try {
      // 1. Создаем пользователя-тренера
      const sd_record = await sd_pb.collection('users').create({
        email: sd_email,
        password: sd_pass,
        passwordConfirm: sd_pass,
        name: sd_name,
        role: 'coach',
        emailVisibility: true,
      });

      // 2. Сразу логиним его
      await sd_pb.collection('users').authWithPassword(sd_email, sd_pass);

      // 3. Создаем связанного атлета-тренера (себя)
      await sd_pb.collection('athletes').create({
        coach_id: sd_record.id,
        name: sd_name,
        goal: 'maintenance',
        start_weight: 20,
        target_weight: 20,
        status: 'active',
        is_coach_self: true,
        notes: 'Профиль самого тренера',
      });

      set({
        sd_user: sd_safeParseUser(sd_pb.authStore.model),
        sd_isAuthenticated: sd_pb.authStore.isValid,
        sd_isLoading: false,
      });
    } catch (sd_err: unknown) {
      const sd_message = sd_getErrorMessage(sd_err, 'Ошибка регистрации');

      console.error('[authStore] Reg error', sd_err);
      set({ sd_error: sd_message, sd_isLoading: false });
      throw sd_err;
    }
  },

  sd_logout: () => {
    sd_pb.authStore.clear();
    set({ sd_user: null, sd_isAuthenticated: false, sd_error: null });
  },

  sd_checkAuth: () => {
    set((state) => {
      // Только обновляем стейт если он не синхронен с sd_pb
      if (state.sd_isAuthenticated !== sd_pb.authStore.isValid) {
        return {
          sd_user: sd_safeParseUser(sd_pb.authStore.model),
          sd_isAuthenticated: sd_pb.authStore.isValid,
        };
      }
      return state;
    });
  },

  sd_clearError: () => set({ sd_error: null }),
}));

// Подписываемся на изменения в PocketBase AuthStore (например, истечение токена)
sd_pb.authStore.onChange((sd_token, sd_model) => {
  sd_useAuthStore.setState({
    sd_user: sd_safeParseUser(sd_model),
    sd_isAuthenticated: !!sd_token,
  });
});

