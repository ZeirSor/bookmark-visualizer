import { registerCommandHandlers } from "./commandHandlers";
import { registerMessageRouter } from "./messageRouter";
import { registerNewTabRedirect } from "../features/newtab";

export function registerServiceWorker(): void {
  registerCommandHandlers();
  registerMessageRouter();
  registerNewTabRedirect();
}
