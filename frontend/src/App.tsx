import { useEffect } from 'react';
import { Sd_AppRouter } from './app/Sd_AppRouter';
import { sd_useSettingsStore } from './stores/sd_useSettingsStore';

function App() {
  const { theme } = sd_useSettingsStore((state) => state.appearance);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <Sd_AppRouter />;
}

export default App;
