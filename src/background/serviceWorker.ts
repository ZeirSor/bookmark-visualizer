import { registerCommandHandlers } from "./commandHandlers";
import { registerMessageRouter } from "./messageRouter";

export function registerServiceWorker(): void {
  registerCommandHandlers();
  registerMessageRouter();
}
