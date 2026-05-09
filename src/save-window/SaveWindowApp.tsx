import { PopupApp } from "../popup/PopupApp";
import { parseSaveSourceParams } from "../features/popup";

export function SaveWindowApp() {
  return (
    <PopupApp
      variant="save-window"
      bootstrapOptions={{
        sourceParams: parseSaveSourceParams(window.location.search)
      }}
    />
  );
}
