import "./styles.css";

interface TargetCard {
  target: "popup" | "management" | "newtab";
  icon: string;
  title: string;
  desc: string;
}

const CARDS: TargetCard[] = [
  {
    target: "popup",
    icon: "🗂️",
    title: "调试 Popup",
    desc: "保存书签、选择位置、查看设置"
  },
  {
    target: "management",
    icon: "📋",
    title: "调试 Management",
    desc: "书签树、搜索、拖拽、批量操作"
  },
  {
    target: "newtab",
    icon: "🌐",
    title: "调试 New Tab",
    desc: "布局模式、搜索、快捷入口"
  }
];

export function DevLauncher() {
  return (
    <div className="dev-launcher">
      <div className="dev-launcher-header">
        <h1>Bookmark Visualizer Dev Workbench</h1>
        <p>选择要调试的页面，左侧切换场景，右侧实时预览</p>
      </div>

      <div className="dev-launcher-cards">
        {CARDS.map((card) => (
          <a
            key={card.target}
            className="dev-launcher-card"
            href={`/?devTarget=${card.target}`}
          >
            <div className="dev-launcher-card-icon">{card.icon}</div>
            <div className="dev-launcher-card-title">{card.title}</div>
            <div className="dev-launcher-card-desc">{card.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
