import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
  };
  updateNotifications: (updates: Partial<SettingsState['notifications']>) => void;
  updateAppearance: (updates: Partial<SettingsState['appearance']>) => void;
}

export const sd_useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      },
      appearance: {
        theme: 'light',
        compactMode: false,
      },
      updateNotifications: (updates) =>
        set((state) => ({ notifications: { ...state.notifications, ...updates } })),
      updateAppearance: (updates) =>
        set((state) => ({ appearance: { ...state.appearance, ...updates } })),
    }),
    {
      name: 'coach-vault-settings',
    }
  )
);
