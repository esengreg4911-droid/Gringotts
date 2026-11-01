# 火线 · 人物地图

覆盖《火线》五季的人物与关系静态网站，支持观看进度、人物搜索、关系筛选、人物详情及办案板地图。

## 使用

直接打开本目录下的 `index.html`，无需安装 Node、npm 或 Python。
移动或复制时请保留本目录的全部内容和相对路径。离线时字体会采用系统字体。
观看进度保存在浏览器中；资料外链可能包含后续剧情。

## 文件

- `index.html`：网页入口与基本结构。
- `app.js`：搜索、筛选、季数切换、人物详情和地图交互。
- `data.js`：完整五季人物、关系、展示边界和图片来源数据。
- `style.css`：页面布局、配色及办案板样式。
- `i18n-en.js`：人物地图完整英文译文。
- `favicon.svg`：网站图标。
- `portraits/`：人物图片。
- `DATA-LICENSE.md`：资料授权与来源说明。
- `PHOTOS.md`：人物图片来源清单。
- `LOCAL-PORTRAITS.md`：本地剧集截图与人物核对记录。

## 仓库结构

本文件与 `index.html` 应直接位于仓库根目录，`portraits/` 与它们同级。
上传时选择本目录中的全部内容，不要再套一层 `dist` 文件夹。
网站无需构建，后续直接编辑网页文件或数据。

资料与图片的相关权利及来源见 `DATA-LICENSE.md`。


## 版本同步

地图支持中英文切换，并记住语言选择；切换语言保留当前进度、筛选及选中人物。
Gringotts 的 `the-wire/atlas` 是维护源，独立地图仓库保留相同功能、样式、资料、译文和图片。
两个版本仅在网页基础路径上作部署适配。
后续修改必须同步 Gringotts、`E:\Subtitles\wire-atlas\dist` 和 `esengreg4911-droid/the-wire-atlas` 仓库。
在 Gringotts 项目运行 `node scripts/sync-wire-atlas.cjs` 可同步并逐文件校验本地独立版，之后提交并推送两个仓库。
