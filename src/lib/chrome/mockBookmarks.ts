function bookmark(
  id: string,
  parentId: string,
  index: number,
  title: string,
  url: string
): chrome.bookmarks.BookmarkTreeNode {
  return {
    id,
    parentId,
    index,
    title,
    url,
    syncing: false,
    dateAdded: 1760000000000 + Number(id) * 1000
  };
}

function folder(
  id: string,
  parentId: string,
  index: number,
  title: string,
  children: chrome.bookmarks.BookmarkTreeNode[]
): chrome.bookmarks.BookmarkTreeNode {
  return {
    id,
    parentId,
    index,
    title,
    syncing: false,
    children,
    dateAdded: 1760000000000 + Number(id) * 1000
  };
}

const productResearchBookmarks = [
  bookmark("100", "10", 0, "Chrome Extensions Docs", "https://developer.chrome.com/docs/extensions"),
  bookmark("101", "10", 1, "Microsoft Edge Extensions", "https://learn.microsoft.com/en-us/microsoft-edge/extensions/"),
  bookmark("102", "10", 2, "Manifest V3 Overview", "https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3"),
  bookmark("103", "10", 3, "Chrome Bookmarks API", "https://developer.chrome.com/docs/extensions/reference/api/bookmarks"),
  bookmark("104", "10", 4, "Chrome Storage API", "https://developer.chrome.com/docs/extensions/reference/api/storage"),
  bookmark("105", "10", 5, "Chrome Permissions API", "https://developer.chrome.com/docs/extensions/reference/api/permissions"),
  bookmark("106", "10", 6, "Vite Guide", "https://vite.dev/guide/"),
  bookmark("107", "10", 7, "React Reference", "https://react.dev/reference/react"),
  bookmark("108", "10", 8, "TypeScript Handbook", "https://www.typescriptlang.org/docs/"),
  bookmark("109", "10", 9, "Web Platform Docs", "https://developer.mozilla.org/en-US/docs/Web")
];

const designReferenceBookmarks = [
  bookmark("110", "11", 0, "Material Symbols", "https://fonts.google.com/icons"),
  bookmark("111", "11", 1, "Apple Human Interface Guidelines", "https://developer.apple.com/design/human-interface-guidelines"),
  bookmark("112", "11", 2, "Microsoft Fluent Design", "https://fluent2.microsoft.design/"),
  bookmark("113", "11", 3, "Chrome Web Store Guidelines", "https://developer.chrome.com/docs/webstore/program-policies"),
  bookmark("114", "11", 4, "A11Y Project", "https://www.a11yproject.com/"),
  bookmark("115", "11", 5, "Color Contrast Checker", "https://webaim.org/resources/contrastchecker/"),
  bookmark("116", "11", 6, "Figma Community", "https://www.figma.com/community"),
  bookmark("117", "11", 7, "Mobbin", "https://mobbin.com/"),
  bookmark("118", "11", 8, "UI Patterns", "https://ui-patterns.com/"),
  bookmark("119", "11", 9, "Nielsen Norman Group", "https://www.nngroup.com/")
];

const readingQueueBookmarks = [
  bookmark("200", "20", 0, "Vite Guide", "https://vite.dev/guide/"),
  bookmark("201", "20", 1, "React TypeScript Cheatsheet", "https://react-typescript-cheatsheet.netlify.app/"),
  bookmark("202", "20", 2, "MDN Drag Operations", "https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations"),
  bookmark("203", "20", 3, "React Hooks", "https://react.dev/reference/react/hooks"),
  bookmark("204", "20", 4, "TypeScript Narrowing", "https://www.typescriptlang.org/docs/handbook/2/narrowing.html"),
  bookmark("205", "20", 5, "Testing Library", "https://testing-library.com/docs/"),
  bookmark("206", "20", 6, "Vitest Docs", "https://vitest.dev/guide/"),
  bookmark("207", "20", 7, "Web.dev Performance", "https://web.dev/performance/"),
  bookmark("208", "20", 8, "CSS Grid Guide", "https://css-tricks.com/snippets/css/complete-guide-grid/"),
  bookmark("209", "20", 9, "ARIA Authoring Practices", "https://www.w3.org/WAI/ARIA/apg/")
];

const bookmarksBarDirectBookmarks = [
  bookmark("120", "1", 2, "Gemini", "https://gemini.google.com/"),
  bookmark("121", "1", 3, "ChatGPT", "https://chatgpt.com/"),
  bookmark("122", "1", 4, "X", "https://x.com/"),
  bookmark("123", "1", 5, "Grok", "https://grok.com/"),
  bookmark("124", "1", 6, "Feishu", "https://feishu.cn/"),
  bookmark("125", "1", 7, "Bilibili", "https://bilibili.com/"),
  bookmark("126", "1", 8, "Substack", "https://substack.com/"),
  bookmark("127", "1", 9, "LINUX DO", "https://linux.do/"),
  bookmark("128", "1", 10, "Reddit", "https://reddit.com/"),
  bookmark("129", "1", 11, "Product Hunt", "https://producthunt.com/")
];

const otherBookmarksDirectBookmarks = [
  bookmark("210", "2", 1, "GitHub", "https://github.com/"),
  bookmark("211", "2", 2, "Stack Overflow", "https://stackoverflow.com/"),
  bookmark("212", "2", 3, "Hacker News", "https://news.ycombinator.com/"),
  bookmark("213", "2", 4, "Lobsters", "https://lobste.rs/"),
  bookmark("214", "2", 5, "DevDocs", "https://devdocs.io/"),
  bookmark("215", "2", 6, "Can I Use", "https://caniuse.com/"),
  bookmark("216", "2", 7, "Node.js", "https://nodejs.org/"),
  bookmark("217", "2", 8, "npm", "https://www.npmjs.com/"),
  bookmark("218", "2", 9, "CodePen", "https://codepen.io/"),
  bookmark("219", "2", 10, "Observable", "https://observablehq.com/")
];

const initialMockBookmarkTree: chrome.bookmarks.BookmarkTreeNode[] = [
  {
    id: "0",
    title: "",
    syncing: false,
    children: [
      {
        id: "1",
        parentId: "0",
        index: 0,
        title: "Bookmarks Bar",
        syncing: false,
        children: [
          folder("10", "1", 0, "Product Research", productResearchBookmarks),
          folder("11", "1", 1, "Design References", designReferenceBookmarks),
          ...bookmarksBarDirectBookmarks
        ]
      },
      {
        id: "2",
        parentId: "0",
        index: 1,
        title: "Other Bookmarks",
        syncing: false,
        children: [folder("20", "2", 0, "Reading Queue", readingQueueBookmarks), ...otherBookmarksDirectBookmarks]
      }
    ]
  }
];

export const mockBookmarkTree: chrome.bookmarks.BookmarkTreeNode[] =
  structuredClone(initialMockBookmarkTree);

export function resetMockBookmarkTree() {
  mockBookmarkTree.splice(0, mockBookmarkTree.length, ...structuredClone(initialMockBookmarkTree));
}
