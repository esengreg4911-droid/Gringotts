# 地图版本同步

《火线》人物地图唯一长期保留的本地维护源为 `E:\Gringotts\the-wire\atlas`。
用户已要求删除旧的 `E:\Subtitles\wire-atlas` 以及 `E:\Subtitles\tmp`，不要再创建或依赖这些旧目录。

后续每次修改地图，均同步提交并推送：
- Gringotts 集成版：`esengreg4911-droid/Gringotts` 的 `main` 分支。
- 独立地图：`esengreg4911-droid/the-wire-atlas` 的 `main` 分支，网页文件在仓库根目录。

先在集成版修改，在临时目录检出独立地图仓库，再运行 `node scripts/sync-wire-atlas.cjs --output <临时检出目录>` 导出并校验独立版，最后提交并推送两个仓库。上传核对完成后清理本次临时检出，不保留第二套本地网站。
集成版的基础路径为 `/the-wire/atlas/`；独立版使用相对资源路径。除此之外核心代码、人物数据、译文及图片必须一致。地图不提供返回《火线》的链接。
用户若明确要求本次仅本地预览或不上传，遵从本次限制并说明哪些版本尚未同步。
同步不包括浏览器本地存储的语言选择与观看进度，不提交本地环境凭据。
