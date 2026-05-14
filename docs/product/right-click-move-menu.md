---
type: reference
status: active
scope: product
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Right-click Move Menu

本文说明当前管理页右键“移动”能力，以及它与 popup 保存位置选择器的边界。

## Current Scope

| Area | Component | Responsibility |
|---|---|---|
| Manager card context menu | `src/components/FolderCascadeMenu.tsx` | 多级 floating cascade，用于把已有书签移动到目标文件夹。 |
| Manager folder move submenu | `src/components/FolderMoveSubmenuContent.tsx` | 搜索、最近文件夹和新建目标文件夹。 |
| Popup save location | `src/components/folder-picker/InlineFolderPicker.tsx` | 内联文件夹选择，不使用 floating cascade。 |
| Popup default folder setting | `src/components/folder-picker/InlineFolderPicker.tsx` | 内联默认位置选择。 |

## Boundary

Quick Save 现在是保存消息协议和 helper，不再拥有网页 Shadow DOM 保存浮框。修改 `FolderCascadeMenu` 时必须回归管理页右键移动；修改 `InlineFolderPicker` 时必须分别回归 popup Save Tab 和 Settings 默认保存位置。

## Expected Behavior

- 菜单打开后应靠近触发点，避免被窗口边缘裁剪。
- 子菜单 hover 有短暂关闭缓冲，避免用户横向移动时丢失目标。
- 搜索模式应优先展示匹配文件夹，并保留可取消入口。
- 新建文件夹成功后，移动目标或保存位置应切换到新文件夹。
- 受保护根节点不可作为非法移动目标。
