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
  },

  async removeOrigins(origins: string[]): Promise<boolean> {
    if (hasChromeApi("permissions") && chrome.permissions.remove) {
      return chrome.permissions.remove({ origins });
    }

    return false;
  },

  async getAllOrigins(): Promise<string[]> {
    if (hasChromeApi("permissions") && chrome.permissions.getAll) {
      const permissions = await chrome.permissions.getAll();
      return permissions.origins ?? [];
    }

    return [];
  }
};
