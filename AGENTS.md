# 地图版本同步

用户已明确要求，后续每次修改《火线》人物地图，都要同步这些位置：

- Gringotts 集成版：`E:\Gringotts\the-wire\atlas`，仓库 `esengreg4911-droid/Gringotts`，分支 `main`。
- 本地独立版：`E:\Subtitles\wire-atlas\dist`。
- 独立地图仓库：`esengreg4911-droid/the-wire-atlas`，分支 `main`，网页文件位于仓库根目录。

地图修改先在集成版完成，再运行 `node scripts/sync-wire-atlas.cjs` 同步独立版。需要同时提交并推送两个仓库；不能只更新 Gringotts。
用户如果明确要求本次仅本地预览或不上传，则遵从本次限制并说明哪些版本尚未同步。
集成版的基础路径为 `/the-wire/atlas/`；独立版使用相对资源路径。地图不提供返回《火线》的链接。核心 JS、CSS、人物数据、翻译词典和图片必须相同。
同步不包括浏览器本地存储的语言选择与观看进度，不提交本地环境凭据。
