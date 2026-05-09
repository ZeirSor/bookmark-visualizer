import { permissionsAdapter } from "../../lib/chrome";
import {
  PAGE_SHORTCUT_ORIGINS,
  SYNC_PAGE_SHORTCUT_REGISTRATION,
  type PageShortcutResponse
} from "./message";

export interface PageShortcutCommandConflict {
  name: string;
  label: string;
  shortcut: string;
}

export async function setPageCtrlSShortcutEnabled(enabled: boolean): Promise<boolean> {
  if (enabled) {
    const granted =
      (await permissionsAdapter.containsOrigins(PAGE_SHORTCUT_ORIGINS)) ||
      (await permissionsAdapter.requestOrigins(PAGE_SHORTCUT_ORIGINS));

    if (!granted) {
      await syncPageShortcutRegistration(false);
      return false;
    }

    return syncPageShortcutRegistration(true);
  }

  await syncPageShortcutRegistration(false);
  await permissionsAdapter.removeOrigins(PAGE_SHORTCUT_ORIGINS);
  return true;
}

export async function getPageShortcutCommandConflicts(): Promise<
  PageShortcutCommandConflict[]
> {
  if (typeof chrome === "undefined" || !chrome.commands?.getAll) {
    return [];
  }

  const commands = await chrome.commands.getAll();
  return commands
    .filter((command) => isCtrlSShortcut(command.shortcut))
    .map((command) => ({
      name: command.name ?? "",
      label: getCommandLabel(command),
      shortcut: command.shortcut ?? ""
    }));
}

function isCtrlSShortcut(shortcut?: string): boolean {
  const normalized = shortcut?.replace(/\s+/g, "").toLocaleLowerCase();
  return normalized === "ctrl+s" || normalized === "command+s";
}

function getCommandLabel(command: chrome.commands.Command): string {
  if (command.name === "_execute_action") {
    return "Activate the extension";
  }

  return command.description ?? command.name ?? "Unknown command";
}

async function syncPageShortcutRegistration(enabled: boolean): Promise<boolean> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return false;
  }

  const response = (await chrome.runtime.sendMessage({
    type: SYNC_PAGE_SHORTCUT_REGISTRATION,
    enabled
  })) as PageShortcutResponse;

  return response.ok;
}
