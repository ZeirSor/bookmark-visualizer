import { hasChromeApi } from "./runtime";

export const permissionsAdapter = {
  async containsOrigins(origins: string[]): Promise<boolean> {
    if (hasChromeApi("permissions") && chrome.permissions.contains) {
      return chrome.permissions.contains({ origins });
    }

    return false;
  },

  async requestOrigins(origins: string[]): Promise<boolean> {
    if (hasChromeApi("permissions") && chrome.permissions.request) {
      return chrome.permissions.request({ origins });
    }

    return false;
  }
};
