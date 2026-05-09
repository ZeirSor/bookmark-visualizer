export const COMPACT_LOCATION_PICKER_MAX_WIDTH = 860;
export const COMPACT_LOCATION_PICKER_MAX_HEIGHT = 620;

export function isCompactLocationPickerViewport(viewport: { width: number; height: number }) {
  return (
    viewport.width < COMPACT_LOCATION_PICKER_MAX_WIDTH ||
    viewport.height < COMPACT_LOCATION_PICKER_MAX_HEIGHT
  );
}
