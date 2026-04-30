import { useCallback, useEffect, useState } from "react";
import { defaultSettings, type SettingsState } from "./index";
import { loadSettings, saveSettings } from "./settingsService";

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const stored = await loadSettings();
        if (!cancelled) {
          setSettings(stored);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(async (next: SettingsState) => {
    const saved = await saveSettings(next);
    setSettings(saved);
  }, []);

  return {
    settings,
    loading,
    updateSettings
  };
}
