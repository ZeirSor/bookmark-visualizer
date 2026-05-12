import { normalizePopupPageDetails } from "../features/popup/tabDetails";
import { mockBookmarkTree } from "../lib/chrome/mockBookmarks";
import type { BookmarkScenario, CurrentTabScenario } from "./devState";
import type { PopupPageDetails } from "../features/popup/tabDetails";

// ─── Bookmark scenario trees ──────────────────────────────────────────────────

function bm(
  id: string,
  parentId: string,
  index: number,
  title: string,
  url: string
): chrome.bookmarks.BookmarkTreeNode {
  return { id, parentId, index, title, url, syncing: false, dateAdded: 1760000000000 + Number(id) };
}

function folder(
  id: string,
  parentId: string,
  index: number,
  title: string,
  children: chrome.bookmarks.BookmarkTreeNode[]
): chrome.bookmarks.BookmarkTreeNode {
  return { id, parentId, index, title, syncing: false, children, dateAdded: 1760000000000 + Number(id) };
}

function rootTree(
  bar: chrome.bookmarks.BookmarkTreeNode[],
  other: chrome.bookmarks.BookmarkTreeNode[]
): chrome.bookmarks.BookmarkTreeNode[] {
  return [
    {
      id: "0",
      title: "",
      syncing: false,
      children: [
        { id: "1", parentId: "0", index: 0, title: "Bookmarks Bar", syncing: false, children: bar },
        { id: "2", parentId: "0", index: 1, title: "Other Bookmarks", syncing: false, children: other }
      ]
    }
  ];
}

const emptyTree = rootTree([], []);

const largeTree = rootTree(
  [
    folder("10", "1", 0, "Dev Tools", Array.from({ length: 20 }, (_, i) =>
      bm(String(200 + i), "10", i, `Dev Tool ${i + 1}`, `https://devtool${i + 1}.example.com/`)
    )),
    folder("11", "1", 1, "Reading", Array.from({ length: 20 }, (_, i) =>
      bm(String(300 + i), "11", i, `Article ${i + 1}`, `https://article${i + 1}.example.com/`)
    )),
    ...Array.from({ length: 15 }, (_, i) =>
      bm(String(400 + i), "1", i + 2, `Quick Link ${i + 1}`, `https://quick${i + 1}.example.com/`)
    )
  ],
  Array.from({ length: 15 }, (_, i) =>
    bm(String(500 + i), "2", i, `Other ${i + 1}`, `https://other${i + 1}.example.com/`)
  )
);

const deepTree = rootTree(
  [
    folder("10", "1", 0, "Level 1",
      [folder("20", "10", 0, "Level 2",
        [folder("30", "20", 0, "Level 3",
          [folder("40", "30", 0, "Level 4",
            [folder("50", "40", 0, "Level 5",
              [
                bm("100", "50", 0, "Deep Bookmark A", "https://deep-a.example.com/"),
                bm("101", "50", 1, "Deep Bookmark B", "https://deep-b.example.com/")
              ]
            )]
          )]
        )]
      )]
    ),
    bm("110", "1", 1, "Shallow Bookmark", "https://shallow.example.com/")
  ],
  []
);

const longTitleText =
  "This Is An Extremely Long Bookmark Title That Will Test How The UI Handles Overflow And Text Truncation In Various Components Including Cards Lists And Tooltips";

const longTextTree = rootTree(
  [
    folder("10", "1", 0, "Folder With A Very Long Name That Might Cause Layout Issues In Sidebar Or Tree",
      [
        bm("100", "10", 0, longTitleText, "https://very-long-title.example.com/path/to/deeply/nested/resource?query=very-long-parameter-value&another=parameter"),
        bm("101", "10", 1, "Normal Title", "https://normal.example.com/")
      ]
    ),
    bm("110", "1", 1, longTitleText, "https://long-bm.example.com/")
  ],
  [bm("200", "2", 0, longTitleText, "https://other-long.example.com/")]
);

const duplicateFoldersTree = rootTree(
  [
    folder("10", "1", 0, "Resources", [bm("100", "10", 0, "Link A", "https://a.example.com/")]),
    folder("11", "1", 1, "Resources", [bm("101", "11", 0, "Link B", "https://b.example.com/")]),
    folder("12", "1", 2, "Archive",   [bm("102", "12", 0, "Link C", "https://c.example.com/")]),
    folder("13", "1", 3, "Archive",   [bm("103", "13", 0, "Link D", "https://d.example.com/")]),
    folder("14", "1", 4, "Archive",   [bm("104", "14", 0, "Link E", "https://e.example.com/")])
  ],
  [
    folder("20", "2", 0, "Resources", [bm("200", "20", 0, "Link F", "https://f.example.com/")])
  ]
);

// missingFavicons uses default tree — favicons are fetched at runtime, not stored in the tree
const missingFaviconsTree = structuredClone(mockBookmarkTree);

const scenarioTrees: Record<BookmarkScenario, chrome.bookmarks.BookmarkTreeNode[]> = {
  default: mockBookmarkTree,
  empty: emptyTree,
  large: largeTree,
  deep: deepTree,
  longText: longTextTree,
  duplicateFolders: duplicateFoldersTree,
  missingFavicons: missingFaviconsTree
};

export function getScenarioBookmarkTree(
  scenario: BookmarkScenario
): chrome.bookmarks.BookmarkTreeNode[] {
  return structuredClone(scenarioTrees[scenario] ?? scenarioTrees.default);
}

// ─── Current tab scenarios ────────────────────────────────────────────────────

interface TabSeed {
  title: string;
  url: string;
  favIconUrl?: string;
}

const tabSeeds: Record<CurrentTabScenario, TabSeed> = {
  normal: {
    title: "Bookmark Visualizer — Dev Preview",
    url: "https://example.com/",
    favIconUrl: "https://example.com/favicon.ico"
  },
  github: {
    title: "crxjs/chrome-extension-tools: Build cross-browser extensions — GitHub",
    url: "https://github.com/crxjs/chrome-extension-tools",
    favIconUrl: "https://github.com/favicon.ico"
  },
  arxivPdf: {
    title: "[2310.07521] Attention Is All You Need — arXiv",
    url: "https://arxiv.org/pdf/2310.07521",
    favIconUrl: "https://arxiv.org/favicon.ico"
  },
  youtube: {
    title: "React in 100 Seconds — YouTube",
    url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
    favIconUrl: "https://www.youtube.com/favicon.ico"
  },
  longTitle: {
    title:
      "This Is An Extremely Long Page Title That Tests How The Save Popup Handles Title Field Overflow And Wrapping Behavior In Various Screen Sizes And Configurations",
    url: "https://long-title.example.com/path/to/page",
    favIconUrl: "https://long-title.example.com/favicon.ico"
  },
  noTitle: {
    title: "",
    url: "https://no-title.example.com/",
    favIconUrl: "https://no-title.example.com/favicon.ico"
  },
  noFavicon: {
    title: "Page Without Favicon",
    url: "https://no-favicon.example.com/",
    favIconUrl: undefined
  },
  unsupportedChromeUrl: {
    title: "Extensions",
    url: "chrome://extensions/",
    favIconUrl: undefined
  }
};

export function getScenarioCurrentTab(scenario: CurrentTabScenario): PopupPageDetails {
  const seed = tabSeeds[scenario] ?? tabSeeds.normal;
  return normalizePopupPageDetails(seed);
}

// ─── Label helpers (used by DevControlPanel) ─────────────────────────────────

export const BOOKMARK_SCENARIO_LABELS: Record<BookmarkScenario, string> = {
  default: "默认书签树",
  empty: "空书签树",
  large: "大量书签",
  deep: "深层文件夹",
  longText: "超长标题 / URL",
  duplicateFolders: "重名文件夹",
  missingFavicons: "无 Favicon"
};

export const CURRENT_TAB_LABELS: Record<CurrentTabScenario, string> = {
  normal: "普通网页",
  github: "GitHub 页面",
  arxivPdf: "arXiv PDF",
  youtube: "YouTube 页面",
  longTitle: "超长标题页面",
  noTitle: "无标题页面",
  noFavicon: "无 Favicon 页面",
  unsupportedChromeUrl: "chrome:// 不可保存"
};

export const BEHAVIOR_SCENARIO_LABELS: Record<BehaviorScenario, string> = {
  normal: "正常",
  saveFailure: "保存失败",
  bookmarkReadFailure: "读取书签失败",
  storageReadFailure: "读取 Storage 失败",
  permissionMissing: "权限缺失",
  delay500: "人为延迟 500 ms",
  delay1500: "人为延迟 1500 ms"
};
