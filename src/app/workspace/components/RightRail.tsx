import {
  ChevronRightIcon,
  FolderPlusIcon,
  RecentIcon
} from "../../../components/icons/AppIcons";
import {
  ActivityIcon,
  DuplicateIcon,
  ExportIcon,
  ImportIcon,
  TrashLineIcon
} from "../../../components/icons/ManagerIcons";
import type { OperationLogEntry } from "../types";

interface StorageSummary {
  label: string;
  detail: string;
  meterLabel?: string;
  percent?: number;
}

interface RightRailProps {
  activities: OperationLogEntry[];
  canCreateFolder: boolean;
  storage: StorageSummary;
  onCreateFolder(): void;
  onViewAllActivity(): void;
}

export function RightRail({
  activities,
  canCreateFolder,
  storage,
  onCreateFolder,
  onViewAllActivity
}: RightRailProps) {
  return (
    <aside className="right-rail" aria-label="管理辅助信息">
      <section className="right-rail-card recent-activity-card">
        <div className="right-rail-card-heading">
          <h3>最近活动</h3>
          <button type="button" onClick={onViewAllActivity}>
            查看全部
            <ChevronRightIcon />
          </button>
        </div>
        {activities.length === 0 ? (
          <p className="right-rail-empty">本轮还没有操作记录。</p>
        ) : (
          <ol className="activity-list">
            {activities.slice(0, 5).map((activity) => (
              <li key={activity.id}>
                <span className="activity-icon">
                  <ActivityIcon />
                </span>
                <span>
                  <strong>{activity.title}</strong>
                  <small>{activity.detail}</small>
                </span>
                <time>{formatTime(activity.createdAt)}</time>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="right-rail-card quick-actions-card">
        <div className="right-rail-card-heading">
          <h3>快捷操作</h3>
        </div>
        <div className="quick-action-list">
          <button type="button" disabled={!canCreateFolder} onClick={onCreateFolder}>
            <FolderPlusIcon />
            新建文件夹
            <ChevronRightIcon />
          </button>
          <button type="button" disabled title="导入书签即将支持">
            <ImportIcon />
            导入书签
            <ChevronRightIcon />
          </button>
          <button type="button" disabled title="导出当前文件夹即将支持">
            <ExportIcon />
            导出当前文件夹
            <ChevronRightIcon />
          </button>
          <button type="button" disabled title="查找重复书签即将支持">
            <DuplicateIcon />
            查找重复书签
            <ChevronRightIcon />
          </button>
          <button type="button" disabled title="回收站即将支持">
            <TrashLineIcon />
            回收站
            <ChevronRightIcon />
          </button>
        </div>
      </section>

      <section className="right-rail-card storage-card">
        <div className="right-rail-card-heading">
          <h3>存储信息</h3>
        </div>
        <div className="storage-copy">
          <span>{storage.label}</span>
          <strong>{storage.detail}</strong>
        </div>
        {typeof storage.percent === "number" ? (
          <div className="storage-meter" aria-label={storage.meterLabel}>
            <span style={{ width: `${Math.min(100, Math.max(0, storage.percent))}%` }} />
          </div>
        ) : null}
        <button className="storage-action" type="button" disabled title="云空间升级即将支持">
          <RecentIcon />
          升级空间
        </button>
      </section>
    </aside>
  );
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}
