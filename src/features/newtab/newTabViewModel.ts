import {
  buildFolderPathMap,
  findNodeById,
  flattenBookmarks,
  flattenFolders,
  getDirectBookmarks,
  getDisplayTitle,
  type BookmarkNode
} from "../bookmarks";
import type { SettingsState } from "../settings";
import { deriveShortcutViewModels } from "./shortcuts";
import type {
  NewTabActivityItem,
  NewTabFeaturedBookmarkViewModel,
  NewTabFolderCardViewModel,
  NewTabState,
  NewTabUsageItem,
  NewTabViewModel
} from "./types";

const FOLDER_COLORS: NewTabFolderCardViewModel["color"][] = [
  "purple",
  "blue",
  "green",
  "orange",
  "gray"
];

export function deriveNewTabViewModel(input: {
  tree: BookmarkNode[];
  state: NewTabState;
  settings: SettingsState;
  activities: NewTabActivityItem[];
  usageStats: NewTabUsageItem[];
  activeFolderId?: string;
}): NewTabViewModel {
  const folders = deriveFolderCards(input.tree, input.state);
  const activeFolderId = input.activeFolderId ?? folders[0]?.id;

  return {
    shortcuts: deriveShortcutViewModels({
      tree: input.tree,
      state: input.state,
      usageStats: input.usageStats,
      limit: input.settings.newTabShortcutsPerRow * 3
    }),
    folders,
    featuredBookmarks: deriveFeaturedBookmarks(input.tree, input.state, activeFolderId),
    recentActivities: input.settings.newTabShowRecentActivity ? input.activities.slice(0, 8) : []
  };
}

function deriveFolderCards(tree: BookmarkNode[], state: NewTabState): NewTabFolderCardViewModel[] {
  const folderOptions = flattenFolders(tree);
  const folderPathMap = buildFolderPathMap(tree);
  const selectedFolders = state.selectedFolderIds
    .map((id) => folderOptions.find((option) => option.id === id))
    .filter((option): option is (typeof folderOptions)[number] => Boolean(option));
  const sourceFolders = selectedFolders.length > 0 ? selectedFolders : folderOptions;

  return sourceFolders
    .map((option, index) => {
      const directBookmarks = getDirectBookmarks(option.node);
      return {
        id: option.id,
        title: option.title,
        path: folderPathMap.get(option.id) ?? option.path,
        description:
          directBookmarks.length > 0
            ? `${directBookmarks.length} 个直接书签`
            : "打开完整管理页查看子文件夹",
        bookmarkCount: flattenBookmarks([option.node]).length,
        color: FOLDER_COLORS[index % FOLDER_COLORS.length],
        sampleBookmarks: directBookmarks.slice(0, 3).flatMap((bookmark) =>
          bookmark.url
            ? [
                {
                  id: bookmark.id,
                  title: getDisplayTitle(bookmark),
                  url: bookmark.url
                }
              ]
            : []
        )
      };
    })
    .filter((folder) => folder.bookmarkCount > 0 || folder.sampleBookmarks.length > 0)
    .slice(0, 5);
}

function deriveFeaturedBookmarks(
  tree: BookmarkNode[],
  state: NewTabState,
  activeFolderId?: string
): NewTabFeaturedBookmarkViewModel[] {
  const folderPathMap = buildFolderPathMap(tree);
  const explicitFeatured = state.featuredBookmarkIds
    .map((id) => findNodeById(tree, id))
    .filter((node): node is BookmarkNode => Boolean(node?.url));

  const activeFolder = activeFolderId ? findNodeById(tree, activeFolderId) : undefined;
  const folderBookmarks = getDirectBookmarks(activeFolder).slice(0, 8);
  const source = explicitFeatured.length > 0 ? explicitFeatured : folderBookmarks;

  return source
    .filter((bookmark) => Boolean(bookmark.url))
    .map((bookmark) => ({
      id: bookmark.id,
      title: getDisplayTitle(bookmark),
      url: bookmark.url!,
      folderPath: folderPathMap.get(bookmark.id) ?? "",
      node: bookmark
    }))
    .slice(0, 8);
}
