# File Tree Panel 设计文档

## 概述

在 T3 Code GUI 界面右上角添加文件树按钮，点击后在右侧展示当前激活项目的文件树。文件树与 Diff Panel 共用同一区域，二选一展示。支持右键菜单预览文件内容和将文件添加到 AI 聊天框。

## 目标

1. 提供项目文件结构的可视化浏览
2. 支持文件内容预览（语法高亮）
3. 支持将文件引用添加到聊天输入框
4. 与现有 Diff Panel 无缝集成

## 非目标

1. 文件编辑功能
2. 文件系统操作（新建、删除、重命名）
3. Git 状态展示（如 modified/deleted 标记）

## 架构

### 组件结构

```
apps/web/src/
├── components/
│   ├── chat/
│   │   └── ChatHeader.tsx          # 添加文件树按钮
│   ├── FileTreePanel.tsx           # 新增：文件树面板
│   ├── FilePreviewPanel.tsx        # 新增：文件预览面板
│   └── ...
├── hooks/
│   └── useFileTree.ts              # 新增：文件树数据获取 hook
├── lib/
│   └── filePreview.ts              # 新增：文件预览相关工具函数
└── routes/
    └── _chat.$environmentId.$threadId.tsx  # 修改：集成面板切换逻辑
```

### 状态管理

右侧面板状态由 URL 搜索参数和本地状态共同管理：

| 状态 | 来源 | 说明 |
|------|------|------|
| `diff` 搜索参数 | URL | `diff=1` 表示 Diff Panel 打开 |
| `fileTree` 搜索参数 | URL | `fileTree=1` 表示文件树打开 |
| 文件预览状态 | 本地 | 预览文件路径和内容 |

**互斥逻辑**：
- 打开文件树时，自动关闭 Diff Panel
- 打开 Diff Panel 时，自动关闭文件树
- 文件预览覆盖当前面板（文件树或 Diff）

### 数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChatHeader                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [📁 File Tree] [📊 Diff] [🖥️ Terminal] [...]            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 点击文件树按钮
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    URL Search Params                            │
│  { fileTree: "1", diff: undefined }                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 触发组件渲染
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FileTreePanel                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📁 src/                                                  │   │
│  │   📁 components/                                         │   │
│  │     📄 ChatHeader.tsx                                    │   │
│  │     📄 FileTreePanel.tsx                                 │   │
│  │   📁 hooks/                                              │   │
│  │     📄 useFileTree.ts                                    │   │
│  │ 📄 package.json                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 右键菜单
                              ▼
         ┌────────────────────┴────────────────────┐
         │                                         │
         ▼                                         ▼
┌─────────────────────┐               ┌─────────────────────────┐
│  FilePreviewPanel   │               │  ChatComposer           │
│  (语法高亮预览)      │               │  (插入 @filepath 引用)   │
└─────────────────────┘               └─────────────────────────┘
```

## 组件详细设计

### 1. ChatHeader 修改

在 `ChatHeader.tsx` 中添加文件树切换按钮，位于 Diff 按钮之前。

**Props 新增**：
```typescript
interface ChatHeaderProps {
  // ... 现有 props
  fileTreeOpen: boolean;
  onToggleFileTree: () => void;
}
```

**按钮 UI**：
- 使用 `FolderTreeIcon` (lucide-react)
- Toggle 按钮样式，与现有 Diff/Terminal 按钮一致
- Tooltip 显示 "Toggle file tree"

### 2. FileTreePanel 组件

**职责**：展示项目文件结构，支持展开/折叠，处理右键菜单。

**Props**：
```typescript
interface FileTreePanelProps {
  environmentId: EnvironmentId;
  projectCwd: string;
  worktreePath: string | null;
  onFilePreview: (filePath: string) => void;
  onAddFileToComposer: (filePath: string) => void;
}
```

**状态**：
```typescript
// 目录展开状态
const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

// 文件树数据缓存
const [treeData, setTreeData] = useState<FileTreeNode[]>([]);
```

**数据获取**：
- 使用 `environmentApi.filesystem.browse` 获取目录内容
- 按需加载：仅在展开目录时请求子内容
- 使用 React Query 缓存请求结果

**文件树节点**：
```typescript
interface FileTreeNode {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  children?: FileTreeNode[];
}
```

**右键菜单**：
```typescript
const contextMenuItems = [
  { id: 'preview', label: 'Preview file content' },
  { id: 'add-to-chat', label: 'Add to chat' },
];
```

**UI 结构**：
```
┌─────────────────────────────────────┐
│ 📁 project-name/                    │  ← Header (可折叠)
├─────────────────────────────────────┤
│ ▼ 📁 src/                           │
│   ▼ 📁 components/                  │
│       📄 ChatHeader.tsx             │
│       📄 FileTreePanel.tsx          │
│   📁 hooks/                         │
│ 📄 package.json                     │
│ 📄 README.md                        │
└─────────────────────────────────────┘
```

### 3. FilePreviewPanel 组件

**职责**：展示文件内容，支持语法高亮。

**Props**：
```typescript
interface FilePreviewPanelProps {
  filePath: string;
  projectCwd: string;
  onClose: () => void;
}
```

**文件内容获取**：
- 需要新增服务器端 API 读取文件内容
- 或通过 `projects.writeFile` 的反向操作实现

**语法高亮**：
- 复用 `@pierre/diffs` 的 `DiffsHighlighter`
- 根据文件扩展名推断语言类型

**UI 结构**：
```
┌─────────────────────────────────────┐
│ ← Back    src/components/Header.tsx │  ← Header
├─────────────────────────────────────┤
│  1 │ import React from 'react';     │
│  2 │                                │
│  3 │ export function Header() {     │
│  4 │   return <header>...</header>; │
│  5 │ }                              │
└─────────────────────────────────────┘
```

### 4. 路由集成

修改 `_chat.$environmentId.$threadId.tsx`：

**URL 搜索参数**：
```typescript
interface DiffRouteSearch {
  diff?: "1";
  diffTurnId?: TurnId;
  diffFilePath?: string;
  fileTree?: "1";  // 新增
}
```

**面板切换逻辑**：
```typescript
// DiffPanelInlineSidebar 同级新增 FileTreePanelSidebar
{fileTreeOpen ? (
  <FileTreePanelSidebar
    fileTreeOpen={fileTreeOpen}
    onCloseFileTree={closeFileTree}
    onOpenFileTree={openFileTree}
    // ...
  />
) : (
  <DiffPanelInlineSidebar
    diffOpen={diffOpen}
    onCloseDiff={closeDiff}
    onOpenDiff={openDiff}
    // ...
  />
)}
```

### 5. 聊天框文件引用

复用现有 `ComposerMentionNode` 机制：

**插入流程**：
1. 从 `ChatView` 获取 `ChatComposerHandle` 引用
2. 调用 `composerHandle.insertMention(filePath)` 方法
3. Composer 编辑器插入 `ComposerMentionNode`
4. 发送时转换为 `@filepath` 格式

**新增 Composer API**：
```typescript
interface ChatComposerHandle {
  // ... 现有方法
  insertMention: (filePath: string) => void;
}
```

## 服务器端修改

### 新增文件内容读取 API

**Contract**：
```typescript
// packages/contracts/src/filesystem.ts
export const FileReadInput = Schema.Struct({
  path: TrimmedNonEmptyString,
  cwd: Schema.optional(TrimmedNonEmptyString),
});

export const FileReadResult = Schema.Struct({
  content: Schema.String,
  mimeType: Schema.optional(Schema.String),
  size: Schema.Number,
});

export class FileReadError extends Schema.TaggedErrorClass()(
  "FileReadError",
  { message: TrimmedNonEmptyString, cause: Schema.optional(Schema.Defect) }
) {}
```

**RPC Method**：
```typescript
// packages/contracts/src/rpc.ts
filesystemRead: "filesystem.read",
```

**Server Implementation**：
```typescript
// apps/server/src/workspace/Layers/WorkspaceFileSystem.ts
// 添加 read 方法读取文件内容
```

## 样式设计

### 文件树样式

- 文件夹使用 `FolderIcon` / `FolderClosedIcon` (lucide-react)
- 文件使用 `VscodeEntryIcon`（根据扩展名显示对应图标）
- 展开/折叠箭头使用 `ChevronRightIcon`
- 缩进：每层 14px
- 字体：等宽字体 11px
- 悬停背景：`hover:bg-background/80`
- 行高：`py-1`

### 文件预览样式

- 复用 Diff Panel 的样式体系
- 行号显示在左侧
- 代码区域可滚动
- 支持 light/dark 主题

## 默认行为

1. **文件树默认打开**：首次加载时 URL 默认包含 `fileTree=1`，文件树面板自动展开
2. **切换项目**：文件树自动重新加载新项目的文件结构
3. **关闭文件树**：点击按钮或按 Escape 键关闭，状态保存到 URL（移除 `fileTree=1`）
4. **文件预览**：覆盖文件树显示，点击 Back 按钮返回文件树
5. **面板互斥**：打开文件树自动关闭 Diff Panel，反之亦然
6. **状态持久化**：面板状态通过 URL 参数持久化，刷新页面保持状态

## 错误处理

1. **无法读取目录**：显示错误提示，保留已加载内容
2. **无法预览文件**：显示错误提示，文件可能不存在或无权限
3. **二进制文件**：提示"Binary file, cannot preview"

## 测试策略

1. **单元测试**：
   - 文件树展开/折叠逻辑
   - 路径处理工具函数
   - 语法高亮语言推断

2. **集成测试**：
   - 面板切换互斥逻辑
   - 文件引用插入流程
   - 项目切换时文件树刷新

3. **浏览器测试**：
   - 右键菜单交互
   - 文件树滚动性能
   - 响应式布局

## 实现顺序

1. **Phase 1**：基础设施
   - 添加 URL 搜索参数支持
   - 修改 ChatHeader 添加按钮
   - 实现面板切换互斥逻辑

2. **Phase 2**：文件树核心
   - 实现 FileTreePanel 组件
   - 集成 filesystem.browse API
   - 添加右键菜单

3. **Phase 3**：文件预览
   - 添加服务器端文件读取 API
   - 实现 FilePreviewPanel 组件
   - 集成语法高亮

4. **Phase 4**：聊天集成
   - 添加 insertMention API
   - 集成文件树与 Composer

5. **Phase 5**：优化完善
   - 性能优化（虚拟滚动）
   - 键盘快捷键
   - 测试覆盖