import { PopupApp } from "../popup/PopupApp";
import { parseSaveSourceParams } from "../features/popup";

export function SaveWindowApp() {
  return (
    <PopupApp
      bootstrapOptions={{
        sourceParams: parseSaveSourceParams(window.location.search)
      }}
    />
  );
}
