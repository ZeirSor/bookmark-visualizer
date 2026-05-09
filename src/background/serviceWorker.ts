import { registerMessageRouter } from "./messageRouter";
import { registerNewTabRedirect } from "../features/newtab";

export function registerServiceWorker(): void {
  registerMessageRouter();
  registerNewTabRedirect();
}
