import { registerMessageRouter } from "./messageRouter";
import { registerPageShortcutHandlers } from "./pageShortcutHandlers";
import { registerNewTabRedirect } from "../features/newtab";

export function registerServiceWorker(): void {
  registerMessageRouter();
  registerPageShortcutHandlers();
  registerNewTabRedirect();
}
