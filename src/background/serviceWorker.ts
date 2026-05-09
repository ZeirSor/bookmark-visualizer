import { registerCommandHandlers } from "./commandHandlers";
import { registerMessageRouter } from "./messageRouter";
import { registerSaveWindowAction } from "./saveWindow";
import { registerNewTabRedirect } from "../features/newtab";

export function registerServiceWorker(): void {
  registerSaveWindowAction();
  registerCommandHandlers();
  registerMessageRouter();
  registerNewTabRedirect();
}
