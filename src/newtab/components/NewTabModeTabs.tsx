export type NewTabContentTab = "shortcuts" | "folders" | "recent";

export function NewTabModeTabs({
  active,
  onChange
}: {
  active: NewTabContentTab;
  onChange(tab: NewTabContentTab): void;
}) {
  const tabs: Array<{ id: NewTabContentTab; label: string }> = [
    { id: "shortcuts", label: "常用网站" },
    { id: "folders", label: "书签文件夹" },
    { id: "recent", label: "最近收藏" }
  ];

  return (
    <div className="nt-content-tabs" role="tablist" aria-label="内容分区">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={active === tab.id ? "is-active" : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
