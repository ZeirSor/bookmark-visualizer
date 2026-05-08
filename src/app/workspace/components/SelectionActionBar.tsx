import { CloseIcon } from "../../../components/icons/AppIcons";
import {
  ReadLaterIcon,
  TagIcon,
  TrashLineIcon
} from "../../../components/icons/ManagerIcons";
import { MoveToFolderIcon } from "../../../components/icons/MenuActionIcons";

interface SelectionActionBarProps {
  selectedCount: number;
  onDeleteSelected(): void;
  onCancel(): void;
}

export function SelectionActionBar({
  selectedCount,
  onDeleteSelected,
  onCancel
}: SelectionActionBarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="selection-action-bar" role="region" aria-label="批量选择操作">
      <strong>已选择 {selectedCount} 项</strong>
      <div className="selection-actions">
        <button type="button" disabled title="批量移动即将支持">
          <MoveToFolderIcon />
          移动到
        </button>
        <button type="button" disabled title="标签功能即将支持">
          <TagIcon />
          添加标签
        </button>
        <button type="button" disabled title="稍后阅读功能即将支持">
          <ReadLaterIcon />
          加入稍后阅读
        </button>
        <button
          className="is-danger"
          type="button"
          disabled={!hasSelection}
          onClick={onDeleteSelected}
        >
          <TrashLineIcon />
          删除
        </button>
      </div>
      <button className="selection-cancel-button" type="button" onClick={onCancel}>
        <CloseIcon />
        取消选择
      </button>
    </div>
  );
}
